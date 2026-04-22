export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const ref = adminDb.collection('posts').doc(params.id)
  const doc = await ref.get()
  if (!doc.exists || doc.data()?.tenantId !== session.tenantId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await ref.update({ ...body, updatedAt: new Date() })
  const updated = await ref.get()
  return NextResponse.json({ id: updated.id, ...updated.data() })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ref = adminDb.collection('posts').doc(params.id)
  const doc = await ref.get()
  if (!doc.exists || doc.data()?.tenantId !== session.tenantId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await ref.delete()
  return NextResponse.json({ success: true })
}
