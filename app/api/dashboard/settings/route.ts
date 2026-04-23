export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { z } from 'zod'

const SettingsSchema = z.object({
  // Branding
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  // Notification preferences
  email_notifications: z.boolean().optional(),
  notification_email: z.string().email().max(200).optional().nullable(),
  // Lead settings
  lead_auto_reply: z.boolean().optional(),
  lead_auto_reply_message: z.string().max(2000).optional().nullable(),
  // Page settings
  show_listings: z.boolean().optional(),
  show_gallery: z.boolean().optional(),
  show_news: z.boolean().optional(),
  show_announcements: z.boolean().optional(),
  show_contact_form: z.boolean().optional(),
  // SEO
  meta_title: z.string().max(100).optional().nullable(),
  meta_description: z.string().max(300).optional().nullable(),
})

export async function GET(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [tenantDoc, settingsDoc] = await Promise.all([
    adminDb.collection('tenants').doc(session.tenantId).get(),
    adminDb.collection('tenants').doc(session.tenantId).collection('settings').doc('main').get(),
  ])

  const tenant = tenantDoc.exists ? tenantDoc.data() : {}
  const settings = settingsDoc.exists ? settingsDoc.data() : {}

  // Merge tenant-level fields (primary_color) with settings subcollection
  return NextResponse.json({
    primary_color: tenant?.primary_color ?? '#3B82F6',
    email_notifications: false,
    notification_email: null,
    lead_auto_reply: false,
    lead_auto_reply_message: null,
    show_listings: true,
    show_gallery: true,
    show_news: true,
    show_announcements: true,
    show_contact_form: true,
    meta_title: null,
    meta_description: null,
    // Saved settings override defaults
    ...settings,
    // Tenant-level primary_color always wins
    primary_color: tenant?.primary_color ?? settings?.primary_color ?? '#3B82F6',
  })
}

export async function PATCH(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: z.infer<typeof SettingsSchema>
  try {
    body = SettingsSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { primary_color, ...settingsFields } = body

  const settingsRef = adminDb
    .collection('tenants')
    .doc(session.tenantId)
    .collection('settings')
    .doc('main')

  await settingsRef.set({ ...settingsFields, updatedAt: new Date() }, { merge: true })

  // Sync primary_color up to the tenant document so the public page picks it up
  if (primary_color) {
    await adminDb.collection('tenants').doc(session.tenantId).update({ primary_color })
  }

  const updated = await settingsRef.get()
  return NextResponse.json({ id: 'main', ...updated.data() })
}
