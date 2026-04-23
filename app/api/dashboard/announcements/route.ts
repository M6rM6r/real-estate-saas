export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const snap = await adminDb.collection('posts')
    .where('tenantId', '==', session.tenantId).where('type', '==', 'announcement')
    .orderBy('createdAt', 'desc').get()
  return NextResponse.json(snap.docs.map(d => ({ id: d.id, ...d.data() })))
}

export async function POST(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { title, body: description, images, published, ...rest } = body
  const id = uuidv4()
  const doc = { tenantId: session.tenantId, type: 'announcement', title, body: description, images: images ?? [], published: !!published, publishedAt: published ? new Date() : null, createdAt: new Date(), ...rest }
  await adminDb.collection('posts').doc(id).set(doc)
  return NextResponse.json({ id, ...doc }, { status: 201 })
}
