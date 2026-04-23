export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Light rate limiting per IP to prevent view count inflation
  const limited = await rateLimit(request)
  if (limited) return limited

  const { slug } = params

  const tenantSnap = await adminDb
    .collection('tenants')
    .where('slug', '==', slug)
    .where('status', '==', 'active')
    .limit(1)
    .get()

  if (tenantSnap.empty) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await adminDb.collection('page_views').add({
    tenantId: tenantSnap.docs[0].id,
    referrer: request.headers.get('referer') ?? null,
    createdAt: new Date(),
  })

  return NextResponse.json({ ok: true })
}
