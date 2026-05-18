export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { getRequestId, logRouteError, logRouteInfo } from '@/lib/observability'

const DEMO_METRICS = {
  totalAgencies: 5,
  totalPosts: 127,
  totalMedia: 348,
  billing: {
    paid: 3,
    pending: 1,
    failed: 0,
    unpaid: 1,
  },
  funnel: {
    signupCompleted30d: 12,
    signupFailed30d: 2,
    profileUpdated30d: 18,
    firstListingCreated30d: 7,
    paymentSessionStarted30d: 6,
    paymentSucceeded30d: 4,
    paymentFailed30d: 1,
    signupToPaymentConversionPct30d: 33.3,
  },
  agenciesPerMonth: [
    { month: '2024-05', count: 1 },
    { month: '2024-06', count: 0 },
    { month: '2024-07', count: 1 },
    { month: '2024-08', count: 2 },
    { month: '2024-09', count: 0 },
    { month: '2024-10', count: 1 },
    { month: '2024-11', count: 0 },
    { month: '2024-12', count: 0 },
    { month: '2025-01', count: 0 },
    { month: '2025-02', count: 0 },
    { month: '2025-03', count: 0 },
    { month: '2025-04', count: 0 },
  ],
  topAgencies: [
    { name: 'Luxury Homes Dubai', slug: 'demo', postCount: 45 },
    { name: 'Palm Realty', slug: 'palm-realty', postCount: 32 },
    { name: 'Marina Estates', slug: 'marina-estates', postCount: 28 },
    { name: 'Downtown Properties', slug: 'downtown-properties', postCount: 15 },
    { name: 'JBR Residences', slug: 'jbr-residences', postCount: 7 },
  ],
  allAgencies: [
    { id: 'demo-1', name: 'Luxury Homes Dubai', slug: 'demo', status: 'active', postCount: 45, listingCount: 16, leadCount: 8, agentCount: 3, healthScore: 100, primaryColor: '#c9a84c', created_at: '2024-08-15' },
    { id: 'demo-2', name: 'Palm Realty', slug: 'palm-realty', status: 'active', postCount: 32, listingCount: 12, leadCount: 5, agentCount: 2, healthScore: 100, primaryColor: '#16a34a', created_at: '2024-07-20' },
    { id: 'demo-3', name: 'Marina Estates', slug: 'marina-estates', status: 'active', postCount: 28, listingCount: 9, leadCount: 4, agentCount: 4, healthScore: 100, primaryColor: '#0ea5e9', created_at: '2024-09-05' },
    { id: 'demo-4', name: 'Downtown Properties', slug: 'downtown-properties', status: 'suspended', postCount: 15, listingCount: 4, leadCount: 1, agentCount: 1, healthScore: 60, primaryColor: '#f59e0b', created_at: '2024-10-12' },
    { id: 'demo-5', name: 'JBR Residences', slug: 'jbr-residences', status: 'active', postCount: 7, listingCount: 2, leadCount: 0, agentCount: 1, healthScore: 25, primaryColor: '#8b5cf6', created_at: '2024-05-08' },
  ],
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now()

  try {
    // Return demo data if in demo mode
    if (process.env.DEMO_MODE === 'true') {
      const response = NextResponse.json(DEMO_METRICS)
      response.headers.set('x-request-id', getRequestId(request))
      return response
    }

    // Check if Firebase is configured
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL ||
        !process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY.includes('YOUR_PRIVATE_KEY_HERE')) {
      const response = NextResponse.json({
        error: 'Firebase Admin credentials not configured',
        totalAgencies: 0,
        totalPosts: 0,
        totalMedia: 0,
        billing: { paid: 0, pending: 0, failed: 0, unpaid: 0 },
        funnel: {
          signupCompleted30d: 0,
          signupFailed30d: 0,
          profileUpdated30d: 0,
          firstListingCreated30d: 0,
          paymentSessionStarted30d: 0,
          paymentSucceeded30d: 0,
          paymentFailed30d: 0,
          signupToPaymentConversionPct30d: 0,
        },
        agenciesPerMonth: [],
        topAgencies: [],
      }, { status: 503 })
      response.headers.set('x-request-id', getRequestId(request))
      return response
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const twelveMonthsAgo = new Date(now)
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)

    const [tenantsSnap, postsSnap, mediaSnap, usersSnap, leadsSnap, funnelEventsSnap] = await Promise.all([
      adminDb.collection('tenants').get(),
      adminDb.collection('posts').select('tenantId', 'createdAt', 'type').get(),
      adminDb.collection('media').count().get(),
      adminDb.collection('users').select('tenantId').get(),
      adminDb.collection('leads').select('tenantId').get(),
      adminDb.collection('funnel_events').where('created_at', '>=', thirtyDaysAgo).get(),
    ])

    const tenants = tenantsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Array<{
      id: string; name: string; slug: string; status?: string; createdAt?: { toDate: () => Date } | string
    }>

    const billing = { paid: 0, pending: 0, failed: 0, unpaid: 0 }
    tenants.forEach((tenant) => {
      const status = String((tenant as { billing_status?: string }).billing_status ?? 'unpaid').toLowerCase()
      if (status === 'paid') billing.paid += 1
      else if (status === 'pending') billing.pending += 1
      else if (status === 'failed') billing.failed += 1
      else billing.unpaid += 1
    })

    const funnelCounts: Record<string, number> = {
      signup_completed: 0,
      signup_failed: 0,
      profile_updated: 0,
      first_listing_created: 0,
      payment_session_started: 0,
      payment_succeeded: 0,
      payment_failed: 0,
    }
    const signupTenants = new Set<string>()
    const paidTenants = new Set<string>()

    funnelEventsSnap.docs.forEach((doc) => {
      const data = doc.data() as { name?: string; tenant_id?: string | null }
      const name = String(data.name ?? '').toLowerCase()
      if (name in funnelCounts) funnelCounts[name] += 1

      const tenantId = String(data.tenant_id ?? '').trim()
      if (tenantId && name === 'signup_completed') signupTenants.add(tenantId)
      if (tenantId && name === 'payment_succeeded') paidTenants.add(tenantId)
    })

    const signupToPaymentConversionPct30d =
      signupTenants.size > 0
        ? Number(((paidTenants.size / signupTenants.size) * 100).toFixed(1))
        : 0

    const postCountByTenant = new Map<string, number>()
    const listingCountByTenant = new Map<string, number>()
    let recentPostsCount = 0

    postsSnap.docs.forEach((doc) => {
      const data = doc.data() as { tenantId?: string; createdAt?: { toDate?: () => Date } | string }
      if (data.tenantId) {
        postCountByTenant.set(data.tenantId, (postCountByTenant.get(data.tenantId) ?? 0) + 1)
        if ((data as { type?: string }).type === 'listing') {
          listingCountByTenant.set(data.tenantId, (listingCountByTenant.get(data.tenantId) ?? 0) + 1)
        }
      }

      const createdAt = typeof data.createdAt === 'string'
        ? new Date(data.createdAt)
        : data.createdAt?.toDate?.()

      if (createdAt && createdAt >= thirtyDaysAgo) {
        recentPostsCount += 1
      }
    })

    const agentCountByTenant = new Map<string, number>()
    usersSnap.docs.forEach((doc) => {
      const tenantId = (doc.data() as { tenantId?: string }).tenantId
      if (!tenantId) return
      agentCountByTenant.set(tenantId, (agentCountByTenant.get(tenantId) ?? 0) + 1)
    })

    const leadCountByTenant = new Map<string, number>()
    leadsSnap.docs.forEach((doc) => {
      const tenantId = (doc.data() as { tenantId?: string }).tenantId
      if (!tenantId) return
      leadCountByTenant.set(tenantId, (leadCountByTenant.get(tenantId) ?? 0) + 1)
    })

    const monthCounts: Record<string, number> = {}
    for (let i = 0; i < 12; i++) {
      const d = new Date(twelveMonthsAgo)
      d.setMonth(d.getMonth() + i)
      monthCounts[d.toISOString().slice(0, 7)] = 0
    }

    tenants.forEach((tenant) => {
      const createdAt = typeof tenant.createdAt === 'string' ? new Date(tenant.createdAt) : tenant.createdAt?.toDate?.()
      if (!createdAt) return
      const monthKey = createdAt.toISOString().slice(0, 7)
      if (monthKey in monthCounts) monthCounts[monthKey] += 1
    })

    const rankedAgencies = tenants
      .map((tenant) => {
        const listingCount = listingCountByTenant.get(tenant.id) ?? 0
        const leadCount = leadCountByTenant.get(tenant.id) ?? 0
        const agentCount = agentCountByTenant.get(tenant.id) ?? 0

        return {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          status: tenant.status ?? 'active',
          postCount: postCountByTenant.get(tenant.id) ?? 0,
          listingCount,
          leadCount,
          agentCount,
          healthScore: Math.min(100, listingCount * 10 + leadCount * 15 + agentCount * 5),
          primaryColor: (tenant as { primary_color?: string }).primary_color,
          created_at: (() => {
            const createdAt = typeof tenant.createdAt === 'string' ? new Date(tenant.createdAt) : tenant.createdAt?.toDate?.()
            return createdAt ? createdAt.toISOString().slice(0, 10) : ''
          })(),
        }
      })
      .sort((a, b) => b.postCount - a.postCount)

    const response = NextResponse.json({
      totalAgencies: tenants.length,
      totalPosts: recentPostsCount,
      totalMedia: mediaSnap.data().count,
      billing,
      funnel: {
        signupCompleted30d: funnelCounts.signup_completed,
        signupFailed30d: funnelCounts.signup_failed,
        profileUpdated30d: funnelCounts.profile_updated,
        firstListingCreated30d: funnelCounts.first_listing_created,
        paymentSessionStarted30d: funnelCounts.payment_session_started,
        paymentSucceeded30d: funnelCounts.payment_succeeded,
        paymentFailed30d: funnelCounts.payment_failed,
        signupToPaymentConversionPct30d,
      },
      agenciesPerMonth: Object.entries(monthCounts).map(([month, count]) => ({ month, count })),
      topAgencies: rankedAgencies.slice(0, 10).map(({ name, slug, postCount }) => ({ name, slug, postCount })),
      allAgencies: rankedAgencies,
    })

    response.headers.set('x-request-id', getRequestId(request))
    logRouteInfo(request, 'GET /api/admin/metrics', {
      message: 'Admin metrics fetched',
      durationMs: Date.now() - startedAt,
      status: 200,
      tenantCount: tenants.length,
      postSampleCount: postsSnap.size,
    })
    return response
  } catch (error) {
    logRouteError(request, 'GET /api/admin/metrics', error, {
      durationMs: Date.now() - startedAt,
      status: 500,
    })
    const response = NextResponse.json({ error: 'Failed to fetch admin metrics' }, { status: 500 })
    response.headers.set('x-request-id', getRequestId(request))
    return response
  }
}
