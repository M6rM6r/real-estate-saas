export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params

  // 1. Look up the tenant by slug
  const tenantSnap = await adminDb
    .collection('tenants')
    .where('slug', '==', slug)
    .where('status', '==', 'active')
    .limit(1)
    .get()

  if (tenantSnap.empty) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const tenantDoc = tenantSnap.docs[0]
  const tenantData = tenantDoc.data()

  // 2. Fetch the tenant profile (bio, logo, social links, etc.)
  const profileDoc = await adminDb
    .collection('tenants')
    .doc(tenantDoc.id)
    .collection('profiles')
    .doc(tenantDoc.id)
    .get()

  // 3. Fetch published listings
  const listingsSnap = await adminDb
    .collection('posts')
    .where('tenantId', '==', tenantDoc.id)
    .where('type', '==', 'listing')
    .where('published', '==', true)
    .orderBy('createdAt', 'desc')
    .get()

  // 4. Fetch published news/posts
  const newsSnap = await adminDb
    .collection('posts')
    .where('tenantId', '==', tenantDoc.id)
    .where('type', '==', 'news')
    .where('published', '==', true)
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get()

  // 5. Fetch gallery/media
  const mediaSnap = await adminDb
    .collection('media')
    .where('tenantId', '==', tenantDoc.id)
    .orderBy('sort_order', 'asc')
    .get()

  // 6. Fetch announcements
  const announcementsSnap = await adminDb
    .collection('posts')
    .where('tenantId', '==', tenantDoc.id)
    .where('type', '==', 'announcement')
    .where('published', '==', true)
    .orderBy('createdAt', 'desc')
    .limit(5)
    .get()

  const tenant = {
    id: tenantDoc.id,
    name: tenantData.name,
    slug: tenantData.slug,
    primary_color: tenantData.primary_color ?? '#3B82F6',
    status: tenantData.status,
    createdAt: tenantData.createdAt?.toDate?.()?.toISOString() ?? tenantData.createdAt,
  }

  const profile = profileDoc.exists
    ? { id: profileDoc.id, ...serializeDoc(profileDoc.data()!) }
    : null

  const listings = listingsSnap.docs.map(d => ({ id: d.id, ...serializeDoc(d.data()) }))
  const news = newsSnap.docs.map(d => ({ id: d.id, ...serializeDoc(d.data()) }))
  const media = mediaSnap.docs.map(d => ({ id: d.id, ...serializeDoc(d.data()) }))
  const announcements = announcementsSnap.docs.map(d => ({
    id: d.id,
    ...serializeDoc(d.data()),
  }))

  // 7. Record the page view (fire-and-forget)
  adminDb
    .collection('page_views')
    .add({ tenantId: tenantDoc.id, createdAt: new Date() })
    .catch(() => undefined)

  const response = NextResponse.json({
    tenant,
    profile,
    listings,
    news,
    media,
    announcements,
  })

  // Cache publicly for 60 seconds, allow stale-while-revalidate for 30s
  response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30')

  return response
}

// Serialize Firestore Timestamps to ISO strings
function serializeDoc(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && 'toDate' in value && typeof (value as any).toDate === 'function') {
      result[key] = (value as any).toDate().toISOString()
    } else {
      result[key] = value
    }
  }
  return result
}
