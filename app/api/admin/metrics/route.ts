export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

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
    { name: 'Luxury Homes Dubai', slug: 'luxury-homes-dubai', postCount: 45 },
    { name: 'Palm Realty', slug: 'palm-realty', postCount: 32 },
    { name: 'Marina Estates', slug: 'marina-estates', postCount: 28 },
    { name: 'Downtown Properties', slug: 'downtown-properties', postCount: 15 },
    { name: 'JBR Residences', slug: 'jbr-residences', postCount: 7 },
  ],
}

export async function GET() {
  // Return demo data if in demo mode
  if (process.env.DEMO_MODE === 'true') {
    return NextResponse.json(DEMO_METRICS)
  }

  // Check if Firebase is configured
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY.includes('YOUR_PRIVATE_KEY_HERE')) {
    return NextResponse.json({
      error: 'Firebase Admin credentials not configured',
      totalAgencies: 0,
      totalPosts: 0,
      totalMedia: 0,
      agenciesPerMonth: [],
      topAgencies: [],
    }, { status: 503 })
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const twelveMonthsAgo = new Date(now)
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)

  const [tenantsSnap, recentPostsSnap, mediaSnap] = await Promise.all([
    adminDb.collection('tenants').get(),
    adminDb.collection('posts').where('createdAt', '>=', thirtyDaysAgo).count().get(),
    adminDb.collection('media').count().get(),
  ])

  const tenants = tenantsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Array<{
    id: string; name: string; slug: string; createdAt: { toDate: () => Date }
  }>

  // Agencies per month (last 12 months)
  const monthCounts: Record<string, number> = {}
  for (let i = 0; i < 12; i++) {
    const d = new Date(twelveMonthsAgo)
    d.setMonth(d.getMonth() + i)
    monthCounts[d.toISOString().slice(0, 7)] = 0
  }
  tenants.forEach(t => {
    if (t.createdAt?.toDate) {
      const m = t.createdAt.toDate().toISOString().slice(0, 7)
      if (m in monthCounts) monthCounts[m]++
    }
  })
  const agenciesPerMonth = Object.entries(monthCounts).map(([month, count]) => ({ month, count }))

  // Top 10 agencies by post count
  const postCounts = await Promise.all(
    tenants.map(t =>
      adminDb.collection('posts').where('tenantId', '==', t.id).count().get()
        .then(s => ({ name: t.name, slug: t.slug, postCount: s.data().count }))
    )
  )
  postCounts.sort((a, b) => b.postCount - a.postCount)

  return NextResponse.json({
    totalAgencies: tenants.length,
    totalPosts: recentPostsSnap.data().count,
    totalMedia: mediaSnap.data().count,
    agenciesPerMonth,
    topAgencies: postCounts.slice(0, 10),
  })
}
