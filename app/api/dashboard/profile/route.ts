export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { logMutation } from '@/lib/audit'
import { z } from 'zod'

const emptyToNull = (v: unknown) => {
  if (typeof v !== 'string') return v
  const t = v.trim()
  return t === '' ? null : t
}

const optionalUrlField = z.preprocess(
  emptyToNull,
  z.string().url().max(500).nullable().optional(),
)

const ProfileDataSchema = z.object({
  logo_url: optionalUrlField,
  cover_url: optionalUrlField,
  bio: z.preprocess(emptyToNull, z.string().max(2000).nullable().optional()),
  tagline: z.preprocess(emptyToNull, z.string().max(200).nullable().optional()),
  licence_no: z.preprocess(emptyToNull, z.string().max(100).nullable().optional()),
  contact_email: z.preprocess(emptyToNull, z.string().email().max(200).nullable().optional()),
  contact_phone: z.preprocess(emptyToNull, z.string().max(30).nullable().optional()),
  extra_phones: z.array(z.string().max(30)).max(5).optional(),
  contact_address: z.preprocess(emptyToNull, z.string().max(300).nullable().optional()),
  social_links: z.object({
    instagram: z.preprocess(emptyToNull, z.string().max(200).nullable().optional()),
    x: z.preprocess(emptyToNull, z.string().max(200).nullable().optional()),
    linkedin: z.preprocess(emptyToNull, z.string().max(200).nullable().optional()),
    whatsapp: z.preprocess(emptyToNull, z.string().max(30).nullable().optional()),
    snapchat: z.preprocess(emptyToNull, z.string().max(200).nullable().optional()),
    tiktok: z.preprocess(emptyToNull, z.string().max(200).nullable().optional()),
  }).optional().nullable(),
  working_hours: z.record(
    z.object({
      enabled: z.boolean(),
      open: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
      close: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    }),
  ).optional().nullable(),
  page_sections: z.object({
    hero: z.boolean().optional(),
    featured: z.boolean().optional(),
    listings: z.boolean().optional(),
    about: z.boolean().optional(),
    news: z.boolean().optional(),
    gallery: z.boolean().optional(),
    team: z.boolean().optional(),
    contact: z.boolean().optional(),
    footer: z.boolean().optional(),
  }).optional(),
  page_config: z.object({
    hero_headline: z.preprocess(emptyToNull, z.string().max(200).nullable().optional()),
    featured_count: z.number().int().min(3).max(12).optional(),
    listings_columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    show_listing_filters: z.boolean().optional(),
    show_listing_search: z.boolean().optional(),
    hero_style: z.enum(['centered', 'split', 'minimal']).optional(),
    hero_cta_text: z.preprocess(emptyToNull, z.string().max(100).nullable().optional()),
    button_shape: z.enum(['pill', 'soft', 'sharp']).optional(),
    seo_title: z.preprocess(emptyToNull, z.string().max(120).nullable().optional()),
    seo_description: z.preprocess(emptyToNull, z.string().max(160).nullable().optional()),
    announcement_text: z.preprocess(emptyToNull, z.string().max(300).nullable().optional()),
    announcement_color: z.enum(['accent', 'yellow', 'green', 'red', 'purple', 'orange', 'teal', 'dark']).optional(),
    currency: z.preprocess(emptyToNull, z.string().max(10).nullable().optional()),
    offer_label_1: z.preprocess(emptyToNull, z.string().max(50).nullable().optional()),
    offer_label_2: z.preprocess(emptyToNull, z.string().max(50).nullable().optional()),
  }).optional(),
}).optional()

const TenantDataSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  theme: z.string().max(20).optional(),
  business_type: z.string().max(30).optional(),
  custom_domain: z.string().max(253).optional(),
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      const first = error.issues[0]
      const path = first?.path?.join('.') || 'payload'
      return NextResponse.json(
        {
          error: `Invalid input at ${path}`,
          details: error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 },
      )
    }
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
  if (tenantFields?.theme) tenantUpdate.theme = tenantFields.theme
  if (Object.keys(tenantUpdate).length > 0) {
    await adminDb.collection('tenants').doc(session.tenantId).update(tenantUpdate)
  }

  const doc = await ref.get()
  await logMutation({ tenantId: session.tenantId, action: 'update', resource: 'profile', resourceId: session.tenantId, userId: session.uid })
  return NextResponse.json({ id: doc.id, ...doc.data() })
}
