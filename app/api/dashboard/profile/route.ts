export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { z } from 'zod'

const ProfileSchema = z.object({
  display_name: z.string().max(100).optional(),
  bio: z.string().max(2000).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().max(200).optional(),
  website: z.string().url().max(300).optional().nullable(),
  logo_url: z.string().url().max(500).optional().nullable(),
  cover_url: z.string().url().max(500).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  social_links: z
    .object({
      instagram: z.string().max(200).optional(),
      facebook: z.string().max(200).optional(),
      twitter: z.string().max(200).optional(),
      linkedin: z.string().max(200).optional(),
      whatsapp: z.string().max(30).optional(),
    })
    .optional(),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
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

  let body: z.infer<typeof ProfileSchema>
  try {
    body = ProfileSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { primary_color, ...profileFields } = body

  const ref = adminDb
    .collection('tenants')
    .doc(session.tenantId)
    .collection('profiles')
    .doc(session.tenantId)

  const update = { ...profileFields, updatedAt: new Date() }
  await ref.set(update, { merge: true })

  // If primary_color provided, update tenant document too
  if (primary_color) {
    await adminDb.collection('tenants').doc(session.tenantId).update({ primary_color })
  }

  const doc = await ref.get()
  return NextResponse.json({ id: doc.id, ...doc.data() })
}
