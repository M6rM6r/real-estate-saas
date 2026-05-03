export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireAdmin } from '@/lib/admin-auth'

type DemoTenantCard = {
  id: string
  name: string
  slug: string
  status: 'active' | 'suspended' | string
  theme: string
  business_type: string
  primary_color: string
  cover_url: string
  tagline: string
  contact_email: string
  listingCount: number
  leadCount: number
  created_at: string
}

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  const tenantsSnap = await adminDb.collection('tenants').orderBy('createdAt', 'desc').get()

  const demoTenants = tenantsSnap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Record<string, unknown> & { id: string }))
    .filter((tenant) => {
      const slug = String(tenant.slug ?? '')
      return slug.startsWith('demo') || tenant.id.startsWith('demo')
    })

  const items = await Promise.all(
    demoTenants.map(async (tenant): Promise<DemoTenantCard> => {
      const [profileDoc, listingCountSnap, leadCountSnap] = await Promise.all([
        adminDb.collection('tenants').doc(tenant.id).collection('profiles').doc(tenant.id).get(),
        adminDb.collection('posts').where('tenantId', '==', tenant.id).where('type', '==', 'listing').count().get(),
        adminDb.collection('leads').where('tenantId', '==', tenant.id).count().get(),
      ])

      const profile = (profileDoc.exists ? profileDoc.data() : null) ?? {}

      const createdAtRaw = tenant.createdAt as { toDate?: () => Date } | string | undefined
      const createdAt = typeof createdAtRaw === 'string'
        ? createdAtRaw
        : createdAtRaw?.toDate?.()?.toISOString() ?? new Date().toISOString()

      return {
        id: tenant.id,
        name: String(tenant.name ?? tenant.id),
        slug: String(tenant.slug ?? tenant.id),
        status: String(tenant.status ?? 'active'),
        theme: String(tenant.theme ?? 'modern'),
        business_type: String(tenant.business_type ?? 'other'),
        primary_color: String(tenant.primary_color ?? '#2563eb'),
        cover_url: String(profile.cover_url ?? ''),
        tagline: String(profile.tagline ?? ''),
        contact_email: String(profile.contact_email ?? tenant.email ?? ''),
        listingCount: listingCountSnap.data().count,
        leadCount: leadCountSnap.data().count,
        created_at: createdAt,
      }
    })
  )

  return NextResponse.json({
    count: items.length,
    items,
  })
}
