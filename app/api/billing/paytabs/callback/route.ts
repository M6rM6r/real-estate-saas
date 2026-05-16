export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { extractPaytabsStatus } from '@/lib/billing/paytabs'
import { trackFunnelEvent } from '@/lib/funnel-events'
import { getRequestId } from '@/lib/observability'

function getSecretFromRequest(request: NextRequest): string {
  return (
    request.headers.get('x-paytabs-callback-secret') ||
    request.nextUrl.searchParams.get('secret') ||
    ''
  ).trim()
}

async function processCallbackPayload(payload: unknown, requestId?: string) {
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const parsed = extractPaytabsStatus(payload)
  if (!parsed.cartId) {
    return NextResponse.json({ error: 'Missing cart_id' }, { status: 400 })
  }

  const attemptsSnapshot = await adminDb
    .collection('billing_attempts')
    .where('cart_id', '==', parsed.cartId)
    .limit(1)
    .get()

  if (attemptsSnapshot.empty) {
    return NextResponse.json({ ok: true, ignored: 'attempt_not_found' })
  }

  const attemptDoc = attemptsSnapshot.docs[0]
  const attemptData = attemptDoc.data() ?? {}
  const tenantId = String(attemptData.tenant_id ?? '').trim()
  if (!tenantId) {
    return NextResponse.json({ ok: true, ignored: 'missing_tenant_id' })
  }

  const paid = parsed.responseStatus === 'A'
  const nowIso = new Date().toISOString()
  const existingStatus = String(attemptData.status ?? '').toLowerCase()
  const existingTranRef = String(attemptData.tran_ref ?? '').trim()
  const incomingTranRef = String(parsed.tranRef ?? '').trim()

  if (existingStatus === 'paid') {
    // Idempotency + safety: once paid, do not downgrade on duplicate/late callbacks.
    return NextResponse.json({ ok: true, paid: true, ignored: 'already_paid' })
  }

  if (!paid && existingStatus === 'failed' && incomingTranRef && existingTranRef === incomingTranRef) {
    return NextResponse.json({ ok: true, paid: false, ignored: 'already_failed' })
  }

  await attemptDoc.ref.set(
    {
      status: paid ? 'paid' : 'failed',
      callback_received_at: nowIso,
      callback_response_status: parsed.responseStatus,
      callback_response_code: parsed.responseCode,
      callback_response_message: parsed.responseMessage,
      tran_ref: parsed.tranRef,
      callback_payload: payload,
      updated_at: new Date(),
    },
    { merge: true },
  )

  const tenantRef = adminDb.collection('tenants').doc(tenantId)
  const tenantSnapshot = await tenantRef.get()
  const currentTenantBillingStatus = String(tenantSnapshot.data()?.billing_status ?? '').toLowerCase()

  if (paid || currentTenantBillingStatus !== 'paid') {
    await tenantRef.set(
      paid
        ? {
            billing_status: 'paid',
          paid: true,
            billing_provider: 'paytabs',
            billing_payment_ref: parsed.tranRef,
            billing_activation_source: 'paytabs-callback',
            billing_last_paid_at: nowIso,
            billing_attempt_id: attemptDoc.id,
            subscription_status: 'active',
            billing_activated_at: nowIso,
          }
        : {
            billing_status: 'failed',
            paid: false,
            billing_provider: 'paytabs',
            billing_attempt_id: attemptDoc.id,
          },
      { merge: true },
    )
  }

  await trackFunnelEvent({
    name: paid ? 'payment_succeeded' : 'payment_failed',
    tenantId,
    uid: String(attemptData.uid ?? '').trim() || undefined,
    requestId,
    metadata: {
      cartId: parsed.cartId,
      tranRef: parsed.tranRef,
      attemptId: attemptDoc.id,
      responseCode: parsed.responseCode,
    },
  })

  return NextResponse.json({ ok: true, paid })
}

function validateSecret(request: NextRequest): NextResponse | null {
  const expectedSecret = (process.env.PAYTABS_CALLBACK_SECRET || '').trim()
  if (expectedSecret) {
    const providedSecret = getSecretFromRequest(request)
    if (!providedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request)
  const secretError = validateSecret(request)
  if (secretError) return secretError

  const payload = await request.json().catch(() => null)
  return processCallbackPayload(payload, requestId)
}

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request)
  const secretError = validateSecret(request)
  if (secretError) return secretError

  const params = request.nextUrl.searchParams
  const payload = {
    tran_ref: params.get('tran_ref') ?? undefined,
    cart_id: params.get('cart_id') ?? undefined,
    payment_result: {
      response_status: params.get('respStatus') ?? params.get('response_status') ?? undefined,
      response_code: params.get('respCode') ?? params.get('response_code') ?? undefined,
      response_message: params.get('respMessage') ?? params.get('response_message') ?? undefined,
    },
  }

  return processCallbackPayload(payload, requestId)
}
