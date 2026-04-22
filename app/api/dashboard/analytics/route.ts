export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [pageViewsSnap, leadsSnap] = await Promise.all([
    adminDb.collection('page_views').where('tenantId', '==', session.tenantId).get(),
    adminDb.collection('leads').where('tenantId', '==', session.tenantId).count().get(),
  ])
  const monthMap: Record<string, number> = {}
  pageViewsSnap.docs.forEach(d => {
    const data = d.data()
    const date = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
    const m = date.toISOString().slice(0, 7)
    monthMap[m] = (monthMap[m] ?? 0) + 1
  })
  const pageViews = Object.entries(monthMap).sort().map(([date, views]) => ({ date, views }))
  return NextResponse.json({ pageViews, listingViews: [], totalViews: pageViewsSnap.size, totalLeads: leadsSnap.data().count })
}
