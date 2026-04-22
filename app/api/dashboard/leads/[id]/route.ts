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

  const { status } = await request.json()
  const ALLOWED_STATUSES = ['new', 'contacted', 'closed']
  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const ref = adminDb.collection('leads').doc(params.id)
  const doc = await ref.get()
  if (!doc.exists || doc.data()?.tenantId !== session.tenantId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await ref.update({ status, updatedAt: new Date() })
  const updated = await ref.get()
  return NextResponse.json({ id: updated.id, ...updated.data() })
}
