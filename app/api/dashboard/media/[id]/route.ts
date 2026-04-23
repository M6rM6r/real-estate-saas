export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { z } from 'zod'

const UpdateMediaSchema = z.object({
  label: z.string().max(200).optional().nullable(),
  sort_order: z.number().int().min(0).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: z.infer<typeof UpdateMediaSchema>
  try {
    body = UpdateMediaSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const ref = adminDb.collection('media').doc(params.id)
  const doc = await ref.get()
  if (!doc.exists || doc.data()?.tenantId !== session.tenantId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await ref.update({ ...body, updatedAt: new Date() })
  return NextResponse.json({ id: params.id, ...body })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ref = adminDb.collection('media').doc(params.id)
  const doc = await ref.get()
  if (!doc.exists || doc.data()?.tenantId !== session.tenantId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await ref.delete()
  return NextResponse.json({ success: true })
}
