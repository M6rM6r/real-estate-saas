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

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const allowed = ['bio', 'licenceNo', 'logoUrl', 'coverUrl', 'socialLinks', 'workingHours']
  const update: Record<string, unknown> = { updatedAt: new Date() }
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  const ref = adminDb
    .collection('tenants')
    .doc(session.tenantId)
    .collection('profiles')
    .doc(session.tenantId)

  await ref.set(update, { merge: true })
  const doc = await ref.get()
  return NextResponse.json({ id: doc.id, ...doc.data() })
}
