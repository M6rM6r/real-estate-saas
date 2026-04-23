export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await adminDb.collection('posts').doc(params.id).get()
  if (!existing.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.data()?.tenantId !== session.tenantId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { title, body: description, images, published, ...rest } = body

  const updateData: Record<string, unknown> = { ...rest }
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.body = description
  if (images !== undefined) updateData.images = images
  if (published !== undefined) {
    updateData.published = published
    updateData.publishedAt = published ? new Date() : null
  }
  updateData.updatedAt = new Date()

  await adminDb.collection('posts').doc(params.id).update(updateData)
  return NextResponse.json({ id: params.id, ...updateData })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await adminDb.collection('posts').doc(params.id).get()
  if (!existing.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.data()?.tenantId !== session.tenantId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await adminDb.collection('posts').doc(params.id).delete()
  return NextResponse.json({ success: true })
}
