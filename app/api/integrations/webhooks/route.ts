export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { logRouteError, logRouteInfo, logRouteStart, getRequestId, getLatencyBucket } from '@/lib/observability'
import { rateLimit } from '@/lib/rate-limit'

/**
 * POST /api/integrations/webhooks
 *
 * Receives dispatched events from the PHP webhook gateway.
 * The PHP service forwards partner events here after signature validation.
 *
 * Security:
 *  - Requires a shared gateway secret (GATEWAY_DISPATCH_SECRET) set in both services.
 *  - Rate-limited via Upstash if configured.
 *  - All payloads are sanitised and stored; no exec paths.
 */

const GATEWAY_SECRET = process.env.GATEWAY_DISPATCH_SECRET?.trim() ?? ''

export async function POST(request: NextRequest) {
  const startedAt = Date.now()
  logRouteStart(request, 'POST /api/integrations/webhooks')

  // ── Rate limiting ──────────────────────────────────────
  const limited = await rateLimit(request)
  if (limited) return limited

  // ── Gateway secret verification ────────────────────────
  const incomingSecret = request.headers.get('x-gateway-secret') ?? ''
  if (!GATEWAY_SECRET || incomingSecret !== GATEWAY_SECRET) {
    const res = NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    res.headers.set('x-request-id', getRequestId(request))
    return res
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    const res = NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    res.headers.set('x-request-id', getRequestId(request))
    return res
  }

  const partner = typeof body.partner === 'string' ? body.partner : 'unknown'
  const gatewayEventId = typeof body.gateway_event_id === 'string' ? body.gateway_event_id : null
  const attempt = typeof body.attempt === 'number' ? body.attempt : 1
  const payload = body.payload && typeof body.payload === 'object' ? body.payload : {}

  try {
    // Store raw event for auditability + async processing
    const docRef = await adminDb.collection('webhook_events').add({
      partner,
      gateway_event_id: gatewayEventId,
      attempt,
      payload,
      received_at: new Date(),
      processed: false,
      processing_error: null,
    })

    // ── Async event routing ───────────────────────────────
    // Route event to the correct handler without blocking the 202 response.
    // Errors are captured into Firestore for operator visibility.
    routePartnerEvent(docRef.id, partner, payload as Record<string, unknown>).catch((err) => {
      adminDb.collection('webhook_events').doc(docRef.id).update({
        processed: false,
        processing_error: err instanceof Error ? err.message : String(err),
      })
    })

    const res = NextResponse.json({ received: true, event_id: docRef.id }, { status: 202 })
    res.headers.set('x-request-id', getRequestId(request))
    logRouteInfo(request, 'POST /api/integrations/webhooks', {
      message: 'Webhook event received',
      status: 202,
      durationMs: Date.now() - startedAt,
      latencyBucket: getLatencyBucket(Date.now() - startedAt),
      partner,
      gatewayEventId,
      attempt,
    })
    return res
  } catch (error) {
    logRouteError(request, 'POST /api/integrations/webhooks', error, {
      status: 500,
      durationMs: Date.now() - startedAt,
      latencyBucket: getLatencyBucket(Date.now() - startedAt),
    })
    const res = NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    res.headers.set('x-request-id', getRequestId(request))
    return res
  }
}

/**
 * Route partner event to the appropriate handler.
 * Add new partners/event types here — each case is isolated and auditable.
 */
async function routePartnerEvent(
  eventId: string,
  partner: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const eventType = typeof payload.event_type === 'string' ? payload.event_type : 'unknown'

  // ── New lead from partner portal ──────────────────────
  if (eventType === 'new_lead') {
    const tenantId = typeof payload.tenant_id === 'string' ? payload.tenant_id : null
    if (!tenantId) throw new Error('Missing tenant_id in new_lead event')

    await adminDb.collection('leads').add({
      tenantId,
      source: `partner:${partner}`,
      gateway_event_id: eventId,
      name: payload.name ?? null,
      phone: payload.phone ?? null,
      email: payload.email ?? null,
      message: payload.message ?? null,
      listing_id: payload.listing_id ?? null,
      createdAt: new Date(),
    })
  }

  // ── Listing price update from partner ─────────────────
  if (eventType === 'price_update') {
    const listingId = typeof payload.listing_id === 'string' ? payload.listing_id : null
    const newPrice = typeof payload.price === 'number' ? payload.price : null
    if (!listingId || newPrice === null) throw new Error('Invalid price_update event')

    await adminDb.collection('listings').doc(listingId).update({
      price: newPrice,
      updatedAt: new Date(),
      price_source: `partner:${partner}`,
    })
  }

  // Mark as processed
  await adminDb.collection('webhook_events').doc(eventId).update({
    processed: true,
    processed_at: new Date(),
    event_type: eventType,
  })
}

/**
 * GET /api/integrations/webhooks
 * Health probe — confirms the integration endpoint is reachable.
 */
export async function GET(request: NextRequest) {
  const res = NextResponse.json({ status: 'ok', endpoint: 'webhook-receiver' })
  res.headers.set('x-request-id', getRequestId(request))
  return res
}
