export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { z } from 'zod'

const UpdateLeadSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'closed', 'archived']).optional(),
  notes: z.string().max(2000).optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doc = await adminDb.collection('leads').doc(params.id).get()
  if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (doc.data()?.tenantId !== session.tenantId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ id: doc.id, ...doc.data() })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: z.infer<typeof UpdateLeadSchema>
  try {
    body = UpdateLeadSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const ref = adminDb.collection('leads').doc(params.id)
  const doc = await ref.get()
  if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (doc.data()?.tenantId !== session.tenantId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const update = { ...body, updatedAt: new Date() }
  await ref.update(update)
  const updated = await ref.get()
  return NextResponse.json({ id: updated.id, ...updated.data() })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doc = await adminDb.collection('leads').doc(params.id).get()
  if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (doc.data()?.tenantId !== session.tenantId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await adminDb.collection('leads').doc(params.id).delete()
  return NextResponse.json({ success: true })
}

