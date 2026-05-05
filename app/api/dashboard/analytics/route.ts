export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { getRequestId, logRouteError, logRouteInfo } from '@/lib/observability'

export async function GET(request: NextRequest) {
  const startedAt = Date.now()

  try {
    const session = await getFirebaseSession(request)
    if (!session) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      response.headers.set('x-request-id', getRequestId(request))
      return response
    }

    const period = request.nextUrl.searchParams.get('period') ?? '30d'

    // Determine start date and grouping key
    let startDate: Date
    let groupKey: (d: Date) => string
    let labelFormat: 'day' | 'month'

    if (period === '7d') {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      groupKey = (d) => d.toISOString().slice(0, 10)
      labelFormat = 'day'
    } else if (period === '12m') {
      startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      groupKey = (d) => d.toISOString().slice(0, 7)
      labelFormat = 'month'
    } else {
      // default 30d
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      groupKey = (d) => d.toISOString().slice(0, 10)
      labelFormat = 'day'
    }

    const [pageViewsSnap, leadsSnap] = await Promise.all([
      adminDb.collection('page_views')
        .where('tenantId', '==', session.tenantId)
        .where('createdAt', '>=', startDate)
        .get(),
      adminDb.collection('leads').where('tenantId', '==', session.tenantId).count().get(),
    ])

    const bucketMap: Record<string, number> = {}
    pageViewsSnap.docs.forEach(d => {
      const data = d.data()
      const date = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
      const k = groupKey(date)
      bucketMap[k] = (bucketMap[k] ?? 0) + 1
    })

    const pageViews = Object.entries(bucketMap).sort().map(([date, views]) => ({ date, views }))

    const totalViewsSnap = await adminDb.collection('page_views')
      .where('tenantId', '==', session.tenantId)
      .count()
      .get()

    const response = NextResponse.json({
      pageViews,
      listingViews: [],
      totalViews: totalViewsSnap.data().count,
      totalLeads: leadsSnap.data().count,
      period,
      labelFormat,
    })

    response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=60')
    response.headers.set('x-request-id', getRequestId(request))
    logRouteInfo(request, 'GET /api/dashboard/analytics', {
      message: 'Dashboard analytics fetched',
      durationMs: Date.now() - startedAt,
      status: 200,
      tenantId: session.tenantId,
      period,
      buckets: pageViews.length,
    })
    return response
  } catch (error) {
    logRouteError(request, 'GET /api/dashboard/analytics', error, {
      durationMs: Date.now() - startedAt,
      status: 500,
    })
    const response = NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    response.headers.set('x-request-id', getRequestId(request))
    return response
  }
}
