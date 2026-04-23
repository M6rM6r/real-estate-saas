export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doc = await adminDb
    .collection('tenants')
    .doc(session.tenantId)
    .collection('profiles')
    .doc(session.tenantId)
    .get()

  return NextResponse.json(doc.exists ? { id: doc.id, ...doc.data() } : {})
}

export async function PATCH(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    .collection('tenants')
    .doc(session.tenantId)
    .collection('profiles')
    .doc(session.tenantId)

  await ref.set(update, { merge: true })
  const doc = await ref.get()
  return NextResponse.json({ id: doc.id, ...doc.data() })
}
