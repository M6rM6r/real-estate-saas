import { adminDb } from '@/lib/firebase-admin'

export type FunnelEventName =
  | 'signup_completed'
  | 'signup_failed'
  | 'profile_updated'
  | 'listing_created'
  | 'first_listing_created'
  | 'payment_session_started'
  | 'payment_session_failed'
  | 'payment_succeeded'
  | 'payment_failed'

export async function trackFunnelEvent(event: {
  name: FunnelEventName
  tenantId?: string
  uid?: string
  requestId?: string
  metadata?: Record<string, unknown>
}) {
  try {
    await adminDb.collection('funnel_events').add({
      name: event.name,
      tenant_id: event.tenantId ?? null,
      uid: event.uid ?? null,
      request_id: event.requestId ?? null,
      metadata: event.metadata ?? {},
      created_at: new Date(),
    })
  } catch {
    // Best-effort telemetry only; never break main route.
  }
}
