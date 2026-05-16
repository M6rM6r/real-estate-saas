export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { requireAdmin } from '@/lib/admin-auth'
import { writeAdminLog } from '@/lib/audit'
import { z } from 'zod'

const UpdateTenantSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
  status: z.enum(['active', 'suspended']).optional(),
  paid: z.boolean().optional(),
  business_type: z.string().optional(),
  theme: z.string().optional(),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  custom_domain: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  const [tenantDoc, profileDoc, usersSnap, postsSnap, listingsSnap, leadsSnap, mediaSnap, recentLeadsRawSnap, recentPostsRawSnap] = await Promise.all([
    adminDb.collection('tenants').doc(params.id).get(),
    adminDb.collection('tenants').doc(params.id).collection('profiles').doc(params.id).get(),
    adminDb.collection('users').where('tenantId', '==', params.id).get(),
    adminDb.collection('posts').where('tenantId', '==', params.id).count().get(),
    adminDb.collection('posts').where('tenantId', '==', params.id).where('type', '==', 'listing').count().get(),
    adminDb.collection('leads').where('tenantId', '==', params.id).count().get(),
    adminDb.collection('tenants').doc(params.id).collection('media').count().get(),
    adminDb.collection('leads').where('tenantId', '==', params.id).limit(50).get(),
    adminDb.collection('posts').where('tenantId', '==', params.id).limit(100).get(),
  ])

  if (!tenantDoc.exists) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const parseDateValue = (value: unknown) => {
    if (!value) return 0
    if (typeof value === 'string') {
      const ts = new Date(value).getTime()
      return Number.isNaN(ts) ? 0 : ts
    }
    if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
      return (value as { toDate: () => Date }).toDate().getTime()
    }
    return 0
  }

  const recentLeads = recentLeadsRawSnap.docs
    .sort((a, b) => parseDateValue(b.data().created_at) - parseDateValue(a.data().created_at))
    .slice(0, 5)

  const recentListings = recentPostsRawSnap.docs
    .filter(d => d.data().type === 'listing')
    .sort((a, b) => parseDateValue(b.data().createdAt) - parseDateValue(a.data().createdAt))
    .slice(0, 5)

  return NextResponse.json({
    id: tenantDoc.id,
    ...tenantDoc.data(),
    createdAt: tenantDoc.data()?.createdAt?.toDate?.()?.toISOString() ?? tenantDoc.data()?.createdAt ?? null,
    updatedAt: tenantDoc.data()?.updatedAt?.toDate?.()?.toISOString() ?? tenantDoc.data()?.updatedAt ?? null,
    profile: profileDoc.exists ? { id: profileDoc.id, ...profileDoc.data() } : null,
    agentCount: usersSnap.size,
    postCount: postsSnap.data().count,
    listingCount: listingsSnap.data().count,
    leadCount: leadsSnap.data().count,
    mediaCount: mediaSnap.data().count,
    users: usersSnap.docs.map(d => ({ id: d.id, email: d.data().email, role: d.data().role })),
    recentLeads: recentLeads.map(d => ({
      id: d.id,
      name: d.data().name ?? '—',
      phone: d.data().phone ?? '—',
      status: d.data().status ?? 'new',
      created_at: d.data().created_at?.toDate?.()?.toISOString() ?? d.data().created_at ?? null,
    })),
    recentListings: recentListings.map(d => ({
      id: d.id,
      title: d.data().title ?? '—',
      price: d.data().price ?? null,
      currency: d.data().currency ?? 'SAR',
      listing_status: d.data().listing_status ?? null,
      created_at: d.data().createdAt?.toDate?.()?.toISOString() ?? d.data().createdAt ?? null,
    })),
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  const { id } = params
  let body: z.infer<typeof UpdateTenantSchema>
  try {
    body = UpdateTenantSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() }
  if (body.name) updates.name = body.name
  if (body.slug) updates.slug = body.slug
  if (body.status) updates.status = body.status
  if (body.paid !== undefined) updates.paid = body.paid
  if (body.business_type) updates.business_type = body.business_type
  if (body.theme) updates.theme = body.theme
  if (body.primary_color) updates.primary_color = body.primary_color
  if (body.custom_domain !== undefined) updates.custom_domain = body.custom_domain

  await adminDb.collection('tenants').doc(id).update(updates)
  try {
    await writeAdminLog('tenant_updated', 'super_admin', { targetId: id, targetType: 'tenant', metadata: updates })
  } catch {
    // Logging must not block successful tenant updates
  }

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
  try {
    await writeAdminLog('tenant_deleted', 'super_admin', { targetId: id, targetType: 'tenant' })
  } catch {
    // Logging must not block successful tenant deletions
  }

  return NextResponse.json({ success: true })
}
