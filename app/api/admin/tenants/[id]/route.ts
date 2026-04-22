export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  let body: { name?: string; slug?: string; status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const updates: Record<string, string> = { updatedAt: new Date().toISOString() }
  if (body.name) updates.name = body.name
  if (body.slug) updates.slug = body.slug
  if (body.status && ['active', 'suspended'].includes(body.status)) {
    updates.status = body.status
  }

  await adminDb.collection('tenants').doc(id).update(updates)

  await adminDb.collection('admin_logs').add({
    action: 'tenant_updated',
    targetId: id,
    targetType: 'tenant',
    performedBy: 'super_admin',
    metadata: updates,
    createdAt: new Date(),
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  // Delete all subcollection docs
  const collections = ['posts', 'media', 'leads', 'profiles', 'page_views']
  await Promise.all(
    collections.map(async (col) => {
      const snap = await adminDb.collection(col).where('tenantId', '==', id).get()
      const batch = adminDb.batch()
      snap.docs.forEach(d => batch.delete(d.ref))
      if (!snap.empty) await batch.commit()
    })
  )

  // Delete users and their Firebase Auth accounts
  const usersSnap = await adminDb.collection('users').where('tenantId', '==', id).get()
  const userBatch = adminDb.batch()
  await Promise.all(
    usersSnap.docs.map(async (d) => {
      userBatch.delete(d.ref)
      try { await adminAuth.deleteUser(d.id) } catch { /* ignore */ }
    })
  )
  if (!usersSnap.empty) await userBatch.commit()

  await adminDb.collection('tenants').doc(id).delete()

  await adminDb.collection('admin_logs').add({
    action: 'tenant_deleted',
    targetId: id,
    targetType: 'tenant',
    performedBy: 'super_admin',
    createdAt: new Date(),
  })

  return NextResponse.json({ success: true })
}
