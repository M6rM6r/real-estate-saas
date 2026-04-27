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

  const counts: Record<string, number> = {}
  snap.docs.forEach(d => {
    const listingId = d.data().listingId as string | undefined
    if (listingId) {
      counts[listingId] = (counts[listingId] ?? 0) + 1
    }
  })

  return NextResponse.json(counts)
}
