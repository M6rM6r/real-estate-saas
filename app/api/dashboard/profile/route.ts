export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { z } from 'zod'

const ProfileDataSchema = z.object({
  logo_url: z.string().url().max(500).optional().nullable(),
  cover_url: z.string().url().max(500).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  tagline: z.string().max(200).optional().nullable(),
  contact_email: z.string().email().max(200).optional().nullable(),
  contact_phone: z.string().max(30).optional().nullable(),
  contact_address: z.string().max(300).optional().nullable(),
  social_links: z.object({
    instagram: z.string().max(200).optional(),
    x: z.string().max(200).optional(),
    linkedin: z.string().max(200).optional(),
    whatsapp: z.string().max(30).optional(),
  }).optional(),
}).optional()

const TenantDataSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
}).optional()

const PatchSchema = z.object({
  profile: ProfileDataSchema,
  tenant: TenantDataSchema,
})

export async function GET(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [tenantDoc, profileDoc] = await Promise.all([
    adminDb.collection('tenants').doc(session.tenantId).get(),
    adminDb
      .collection('tenants')
      .doc(session.tenantId)
      .collection('profiles')
      .doc(session.tenantId)
      .get(),
  ])

  const tenant = tenantDoc.exists
    ? { id: tenantDoc.id, ...tenantDoc.data() }
    : null

  const profile = profileDoc.exists
    ? { id: profileDoc.id, ...profileDoc.data() }
    : null

  return NextResponse.json({ tenant, profile })
}

export async function PATCH(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: z.infer<typeof PatchSchema>
  try {
    body = PatchSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { profile: profileFields, tenant: tenantFields } = body

  const ref = adminDb
    .collection('tenants')
    .doc(session.tenantId)
    .collection('profiles')
    .doc(session.tenantId)

  if (profileFields && Object.keys(profileFields).length > 0) {
    await ref.set({ ...profileFields, updatedAt: new Date() }, { merge: true })
  }

  // Update tenant doc with name and/or primary_color if provided
  const tenantUpdate: Record<string, unknown> = {}
  if (tenantFields?.name) tenantUpdate.name = tenantFields.name
  if (tenantFields?.primary_color) tenantUpdate.primary_color = tenantFields.primary_color
  if (Object.keys(tenantUpdate).length > 0) {
    await adminDb.collection('tenants').doc(session.tenantId).update(tenantUpdate)
  }

  const doc = await ref.get()
  return NextResponse.json({ id: doc.id, ...doc.data() })
}
