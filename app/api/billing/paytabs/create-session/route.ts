export const dynamic = 'force-dynamic'

import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { extractPaytabsCheckoutUrl, isBillingPaid } from '@/lib/billing/paytabs'
import { getRequestId, logRouteError, logRouteInfo } from '@/lib/observability'
import { trackFunnelEvent } from '@/lib/funnel-events'

function getMissingEnv(names: string[]): string[] {
  return names.filter((name) => !String(process.env[name] ?? '').trim())
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now()
  const requestId = getRequestId(request)

  const session = await getFirebaseSession(request)
  if (!session) {
    const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    res.headers.set('x-request-id', requestId)
    return res
  }

  const tenantRef = adminDb.collection('tenants').doc(session.tenantId)
  const tenantDoc = await tenantRef.get()
  if (!tenantDoc.exists) {
    const res = NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    res.headers.set('x-request-id', requestId)
    return res
  }

  const tenantData = tenantDoc.data() ?? {}
  if (isBillingPaid(tenantData.billing_status)) {
    const res = NextResponse.json({ alreadyPaid: true, status: 'paid' })
    res.headers.set('x-request-id', requestId)
    return res
  }

  const missingEnv = getMissingEnv(['PAYTABS_API_BASE', 'PAYTABS_PROFILE_ID', 'PAYTABS_SERVER_KEY'])
  if (missingEnv.length > 0) {
    const message = `PayTabs is not configured. Missing: ${missingEnv.join(', ')}`
    logRouteError(request, 'POST /api/billing/paytabs/create-session', new Error(message), {
      status: 503,
      durationMs: Date.now() - startedAt,
      tenantId: session.tenantId,
      message: 'Payment configuration missing',
    })
    await trackFunnelEvent({
      name: 'payment_session_failed',
      tenantId: session.tenantId,
      uid: session.uid,
      requestId,
      metadata: { reason: 'missing_env', missingEnv },
    })
    const res = NextResponse.json({ error: message }, { status: 503 })
    res.headers.set('x-request-id', requestId)
    return res
  }

  const apiBase = String(process.env.PAYTABS_API_BASE ?? '').trim().replace(/\/+$/, '')
  const profileId = String(process.env.PAYTABS_PROFILE_ID ?? '').trim()
  const serverKeyRaw = String(process.env.PAYTABS_SERVER_KEY ?? '').trim()
  const authScheme = String(process.env.PAYTABS_AUTH_SCHEME ?? '').trim()
  const serverKey = authScheme
    ? `${authScheme} ${serverKeyRaw}`.trim()
    : serverKeyRaw

  const callbackUrl = (process.env.PAYTABS_CALLBACK_URL || `${request.nextUrl.origin}/api/billing/paytabs/callback`).trim()
  const returnUrl = (process.env.PAYTABS_RETURN_URL || `${request.nextUrl.origin}/dashboard/page-builder`).trim()
  const currency = (process.env.PAYTABS_CURRENCY || 'SAR').trim()
  const amount = Number(process.env.PAYTABS_URL_UNLOCK_AMOUNT || '99')
  const normalizedAmount = Number.isFinite(amount) && amount > 0 ? amount : 99
  const endpointPath = (process.env.PAYTABS_CREATE_PAYMENT_PATH || '/payment/request').trim()

  const userDoc = await adminDb.collection('users').doc(session.uid).get()
  const userData = userDoc.exists ? userDoc.data() ?? {} : {}
  const customerEmail = String(userData.email ?? '').trim()

  const attemptId = randomUUID()
  const cartId = `tenant_${session.tenantId}_${Date.now()}_${attemptId.slice(0, 8)}`

  const payload = {
    profile_id: Number(profileId),
    tran_type: 'sale',
    tran_class: 'ecom',
    cart_id: cartId,
    cart_description: `URL unlock for tenant ${session.tenantId}`,
    cart_currency: currency,
    cart_amount: normalizedAmount,
    callback: callbackUrl,
    return: returnUrl,
    customer_details: {
      name: String(tenantData.name ?? 'Tenant').trim() || 'Tenant',
      email: customerEmail || 'billing@wa9l.website',
      phone: String(tenantData.contact_phone ?? '+966000000000').trim() || '+966000000000',
      street1: 'N/A',
      city: 'Riyadh',
      state: 'RIY',
      country: 'SA',
      ip: request.ip ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1',
    },
    user_defined: {
      tenant_id: session.tenantId,
      attempt_id: attemptId,
      purpose: 'url_visibility_unlock',
    },
  }

  const paytabsUrl = `${apiBase}${endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`}`

  let paytabsResponse: Response
  try {
    paytabsResponse = await fetch(paytabsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: serverKey,
      },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    logRouteError(request, 'POST /api/billing/paytabs/create-session', error, {
      status: 502,
      durationMs: Date.now() - startedAt,
      tenantId: session.tenantId,
      message: 'PayTabs upstream network error',
    })
    await trackFunnelEvent({
      name: 'payment_session_failed',
      tenantId: session.tenantId,
      uid: session.uid,
      requestId,
      metadata: { reason: 'upstream_network_error' },
    })
    const res = NextResponse.json({ error: 'Failed to reach payment provider' }, { status: 502 })
    res.headers.set('x-request-id', requestId)
    return res
  }

  const paytabsText = await paytabsResponse.text().catch(() => '')
  const paytabsJson = (() => {
    if (!paytabsText) return {}
    try {
      return JSON.parse(paytabsText)
    } catch {
      return { raw: paytabsText }
    }
  })()
  if (!paytabsResponse.ok) {
    logRouteError(request, 'POST /api/billing/paytabs/create-session', new Error('PayTabs session creation failed'), {
      status: 502,
      durationMs: Date.now() - startedAt,
      tenantId: session.tenantId,
      providerStatus: paytabsResponse.status,
      message: 'PayTabs session creation failed',
    })
    await trackFunnelEvent({
      name: 'payment_session_failed',
      tenantId: session.tenantId,
      uid: session.uid,
      requestId,
      metadata: { reason: 'provider_rejected', providerStatus: paytabsResponse.status },
    })
    const res = NextResponse.json(
      {
        error: 'PayTabs session creation failed',
        details: paytabsJson,
      },
      { status: 502 },
    )
    res.headers.set('x-request-id', requestId)
    return res
  }

  const checkoutUrl = extractPaytabsCheckoutUrl(paytabsJson)
  if (!checkoutUrl) {
    await trackFunnelEvent({
      name: 'payment_session_failed',
      tenantId: session.tenantId,
      uid: session.uid,
      requestId,
      metadata: { reason: 'missing_checkout_url' },
    })
    const res = NextResponse.json(
      {
        error: 'PayTabs did not return a checkout URL',
        details: paytabsJson,
      },
      { status: 502 },
    )
    res.headers.set('x-request-id', requestId)
    return res
  }

  await adminDb.collection('billing_attempts').doc(attemptId).set({
    id: attemptId,
    tenant_id: session.tenantId,
    uid: session.uid,
    provider: 'paytabs',
    status: 'pending',
    purpose: 'url_visibility_unlock',
    cart_id: cartId,
    callback_url: callbackUrl,
    return_url: returnUrl,
    amount: payload.cart_amount,
    currency,
    checkout_url: checkoutUrl,
    paytabs_init_response: paytabsJson,
    created_at: new Date(),
    updated_at: new Date(),
  })

  await tenantRef.set(
    {
      billing_status: 'pending',
      billing_provider: 'paytabs',
      billing_attempt_id: attemptId,
      billing_last_attempt_at: new Date().toISOString(),
    },
    { merge: true },
  )

  await trackFunnelEvent({
    name: 'payment_session_started',
    tenantId: session.tenantId,
    uid: session.uid,
    requestId,
    metadata: {
      attemptId,
      cartId,
      amount: normalizedAmount,
      currency,
    },
  })

  logRouteInfo(request, 'POST /api/billing/paytabs/create-session', {
    message: 'PayTabs session created',
    status: 200,
    durationMs: Date.now() - startedAt,
    tenantId: session.tenantId,
    attemptId,
  })

  const res = NextResponse.json({
    status: 'pending',
    checkoutUrl,
    attemptId,
  })
  res.headers.set('x-request-id', requestId)
  return res
}
