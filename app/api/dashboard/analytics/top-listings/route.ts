export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const snap = await adminDb.collection('page_views')
    .where('tenantId', '==', session.tenantId)
    .get()

  // Aggregate view counts per listing
  const counts: Record<string, number> = {}
  snap.docs.forEach(d => {
    const listingId = d.data().listingId as string | undefined
    if (listingId) {
      counts[listingId] = (counts[listingId] ?? 0) + 1
    }
  })

  // Get top 10 listing IDs by view count
  const top10 = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  if (top10.length === 0) {
    return NextResponse.json([])
  }

  // Fetch listing titles from posts collection
  const listingIds = top10.map(([id]) => id)
  const postsSnap = await adminDb.collection('posts')
    .where('tenantId', '==', session.tenantId)
    .where('type', '==', 'listing')
    .get()

  const titleMap: Record<string, string> = {}
  postsSnap.docs.forEach(d => {
    if (listingIds.includes(d.id)) {
      titleMap[d.id] = d.data().title as string ?? d.id
    }
  })

  const result = top10.map(([listingId, views]) => ({
    listingId,
    title: titleMap[listingId] ?? listingId,
    views,
  }))

  return NextResponse.json(result)
}
