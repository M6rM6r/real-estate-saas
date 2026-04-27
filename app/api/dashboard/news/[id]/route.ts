export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { logMutation } from '@/lib/audit'
import { z } from 'zod'

const UpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().max(10000).optional().nullable(),
  images: z.array(z.string().url()).max(10).optional(),
  published: z.boolean().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: z.infer<typeof UpdateSchema>
  try {
    body = UpdateSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const existing = await adminDb.collection('posts').doc(params.id).get()
  if (!existing.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.data()?.tenantId !== session.tenantId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, body: description, images, published } = body
  const updateData: Record<string, unknown> = { updatedAt: new Date() }
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.body = description
  if (images !== undefined) updateData.images = images
  if (published !== undefined) {
    updateData.published = published
    updateData.publishedAt = published ? new Date() : null
  }

  await adminDb.collection('posts').doc(params.id).update(updateData)
  await logMutation({ tenantId: session.tenantId, action: 'update', resource: 'news', resourceId: params.id, userId: session.uid })
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

  await logMutation({ tenantId: session.tenantId, action: 'delete', resource: 'news', resourceId: params.id, userId: session.uid })
  await adminDb.collection('posts').doc(params.id).delete()
  return NextResponse.json({ success: true })
}