export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  const [tenantDoc, profileDoc, usersSnap, postsSnap] = await Promise.all([
    adminDb.collection('tenants').doc(params.id).get(),
    adminDb.collection('tenants').doc(params.id).collection('profiles').doc(params.id).get(),
    adminDb.collection('users').where('tenantId', '==', params.id).get(),
    adminDb.collection('posts').where('tenantId', '==', params.id).count().get(),
  ])

  if (!tenantDoc.exists) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: tenantDoc.id,
    ...tenantDoc.data(),
    profile: profileDoc.exists ? { id: profileDoc.id, ...profileDoc.data() } : null,
    agentCount: usersSnap.size,
    postCount: postsSnap.data().count,
    users: usersSnap.docs.map(d => ({ id: d.id, email: d.data().email, role: d.data().role })),
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin(request)
  if (denied) return denied
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin(request)
  if (denied) return denied
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
