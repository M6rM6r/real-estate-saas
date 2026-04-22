export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const snap = await adminDb.collection('media').where('tenantId', '==', session.tenantId).orderBy('sort_order', 'asc').get()
  return NextResponse.json(snap.docs.map(d => ({ id: d.id, ...d.data() })))
}

export async function POST(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { url, label } = body

  // Get the highest sort_order for this tenant
  const snap = await adminDb.collection('media')
    .where('tenantId', '==', session.tenantId)
    .orderBy('sort_order', 'desc')
    .limit(1)
    .get()

  const sortOrder = snap.empty ? 0 : (snap.docs[0].data().sort_order || 0) + 1

  const docRef = await adminDb.collection('media').add({
    tenantId: session.tenantId,
    url,
    label: label || null,
    sort_order: sortOrder,
    createdAt: new Date(),
  })

  return NextResponse.json({ id: docRef.id, url, label, sort_order: sortOrder })
}

export async function PATCH(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { order } = body

  if (!order || !Array.isArray(order)) {
    return NextResponse.json({ error: 'Invalid order data' }, { status: 400 })
  }

  const batch = adminDb.batch()
  order.forEach((item: { id: string; sort_order: number }) => {
    const ref = adminDb.collection('media').doc(item.id)
    batch.update(ref, { sort_order: item.sort_order })
  })

  await batch.commit()
  return NextResponse.json({ success: true })
}
