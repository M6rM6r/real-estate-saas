export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { getRequestId, logRouteError, logRouteInfo } from '@/lib/observability'

const DEMO_METRICS = {
  totalAgencies: 5,
  totalPosts: 127,
  totalMedia: 348,
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
    { id: 'demo-1', name: 'Luxury Homes Dubai', slug: 'demo', status: 'active', postCount: 45, createdAt: '2024-08-15' },
    { id: 'demo-2', name: 'Palm Realty', slug: 'palm-realty', status: 'active', postCount: 32, createdAt: '2024-07-20' },
    { id: 'demo-3', name: 'Marina Estates', slug: 'marina-estates', status: 'active', postCount: 28, createdAt: '2024-09-05' },
    { id: 'demo-4', name: 'Downtown Properties', slug: 'downtown-properties', status: 'suspended', postCount: 15, createdAt: '2024-10-12' },
    { id: 'demo-5', name: 'JBR Residences', slug: 'jbr-residences', status: 'active', postCount: 7, createdAt: '2024-05-08' },
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

    const [tenantsSnap, postsSnap, mediaSnap] = await Promise.all([
      adminDb.collection('tenants').get(),
      adminDb.collection('posts').select('tenantId', 'createdAt').get(),
      adminDb.collection('media').count().get(),
    ])

    const tenants = tenantsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Array<{
      id: string; name: string; slug: string; status?: string; createdAt?: { toDate: () => Date } | string
    }>

    const postCountByTenant = new Map<string, number>()
    let recentPostsCount = 0

    postsSnap.docs.forEach((doc) => {
      const data = doc.data() as { tenantId?: string; createdAt?: { toDate?: () => Date } | string }
      if (data.tenantId) {
        postCountByTenant.set(data.tenantId, (postCountByTenant.get(data.tenantId) ?? 0) + 1)
      }

      const createdAt = typeof data.createdAt === 'string'
        ? new Date(data.createdAt)
        : data.createdAt?.toDate?.()

      if (createdAt && createdAt >= thirtyDaysAgo) {
        recentPostsCount += 1
      }
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
      .map((tenant) => ({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status ?? 'active',
        postCount: postCountByTenant.get(tenant.id) ?? 0,
        created_at: (() => {
          const createdAt = typeof tenant.createdAt === 'string' ? new Date(tenant.createdAt) : tenant.createdAt?.toDate?.()
          return createdAt ? createdAt.toISOString().slice(0, 10) : ''
        })(),
      }))
      .sort((a, b) => b.postCount - a.postCount)

    const response = NextResponse.json({
      totalAgencies: tenants.length,
      totalPosts: recentPostsCount,
      totalMedia: mediaSnap.data().count,
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
