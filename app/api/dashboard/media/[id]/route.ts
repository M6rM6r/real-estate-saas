export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'

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
