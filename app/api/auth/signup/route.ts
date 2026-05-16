export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { rateLimit } from '@/lib/rate-limit'
import { getRequestId, logRouteError, logRouteInfo } from '@/lib/observability'
import { trackFunnelEvent } from '@/lib/funnel-events'

const SIGNUP_TRIAL_DAYS = 14

const SignupSchema = z.object({
  businessName: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/),
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(8).max(128),
  businessType: z.string().trim().max(30).optional().default('real_estate'),
  theme: z.string().trim().max(20).optional().default('modern'),
})

export async function POST(request: NextRequest) {
  const startedAt = Date.now()
  const limited = await rateLimit(request)
  if (limited) return limited

  let body: z.infer<typeof SignupSchema>
  try {
    body = SignupSchema.parse(await request.json())
  } catch (error) {
    if (error instanceof z.ZodError) {
      const first = error.issues[0]
      return NextResponse.json(
        { error: `Invalid input at ${first?.path?.join('.') || 'payload'}` },
        { status: 400 },
      )
    }
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { businessName, slug, email, password, businessType, theme } = body
  const normalizedEmail = email.toLowerCase()
  const now = new Date()
  const trialExpiresAt = new Date(now.getTime() + SIGNUP_TRIAL_DAYS * 24 * 60 * 60 * 1000)
  const nowIso = now.toISOString()
  const trialExpiresIso = trialExpiresAt.toISOString()

  let createdUid: string | null = null
  try {
    const slugCheck = await adminDb.collection('tenants').where('slug', '==', slug).limit(1).get()
    if (!slugCheck.empty) {
      return NextResponse.json({ error: 'Business URL is already taken' }, { status: 409 })
    }

    try {
      await adminAuth.getUserByEmail(normalizedEmail)
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    } catch (error) {
      const code = (error as { code?: string })?.code
      if (code && code !== 'auth/user-not-found') {
        throw error
      }
    }

    const userRecord = await adminAuth.createUser({
      email: normalizedEmail,
      password,
      displayName: businessName,
    })
    createdUid = userRecord.uid

    const tenantId = uuidv4()
    const tenantRef = adminDb.collection('tenants').doc(tenantId)
    const userRef = adminDb.collection('users').doc(userRecord.uid)
    const profileRef = tenantRef.collection('profiles').doc(tenantId)
    const batch = adminDb.batch()

    batch.set(tenantRef, {
      name: businessName,
      slug,
      status: 'active',
      primary_color: '#3B82F6',
      business_type: businessType,
      theme,
      billing_status: 'unpaid',
      billing_provider: 'paytabs',
      subscription_status: 'trial',
      billing_plan: 'starter',
      trial_started_at: nowIso,
      trial_expires_at: trialExpiresIso,
      createdAt: now,
      updatedAt: now,
    })

    batch.set(userRef, {
      tenantId,
      email: normalizedEmail,
      role: 'admin',
      createdAt: now,
    })

    batch.set(profileRef, {
      tenant_id: tenantId,
      tagline: businessName,
      contact_email: normalizedEmail,
      page_config: {
        page_lang: 'ar',
      },
      createdAt: now,
      updatedAt: now,
    })

    await batch.commit()

    await adminAuth.setCustomUserClaims(userRecord.uid, {
      tenantId,
      admin: true,
      role: 'admin',
    })

    const response = NextResponse.json(
      {
        ok: true,
        tenantId,
        uid: userRecord.uid,
        email: normalizedEmail,
        trial: {
          days: SIGNUP_TRIAL_DAYS,
          expiresAt: trialExpiresIso,
        },
      },
      { status: 201 },
    )
    response.headers.set('x-request-id', getRequestId(request))
    logRouteInfo(request, 'POST /api/auth/signup', {
      message: 'Self-signup tenant provisioned',
      durationMs: Date.now() - startedAt,
      status: 201,
      tenantId,
      uid: userRecord.uid,
      slug,
    })
    await trackFunnelEvent({
      name: 'signup_completed',
      tenantId,
      uid: userRecord.uid,
      requestId: getRequestId(request),
      metadata: { slug },
    })
    return response
  } catch (error) {
    if (createdUid) {
      try {
        await adminDb.collection('users').doc(createdUid).delete()
      } catch {}
      try {
        await adminAuth.deleteUser(createdUid)
      } catch {}
    }

    const code = (error as { code?: string })?.code
    if (code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    logRouteError(request, 'POST /api/auth/signup', error, {
      durationMs: Date.now() - startedAt,
      status: 500,
      slug,
      message: 'Self-signup failed',
    })
    await trackFunnelEvent({
      name: 'signup_failed',
      uid: createdUid ?? undefined,
      requestId: getRequestId(request),
      metadata: { slug, reason: (error as { code?: string; message?: string })?.code ?? (error as Error)?.message ?? 'unknown' },
    })
    const response = NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    response.headers.set('x-request-id', getRequestId(request))
    return response
  }
}