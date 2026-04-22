export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  // Check if Firebase is configured
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY.includes('YOUR_PRIVATE_KEY_HERE')) {
    return NextResponse.json({
      error: 'Firebase Admin credentials not configured',
      message: 'Cannot send email digest without Firebase configuration',
    }, { status: 503 })
  }

  const tenantsSnap = await adminDb.collection('tenants').where('status', '==', 'active').get()

  for (const tenantDoc of tenantsSnap.docs) {
    const tenantId = tenantDoc.id

    const profilesSnap = await adminDb.collection('profiles').where('tenantId', '==', tenantId).limit(1).get()
    if (profilesSnap.empty || !profilesSnap.docs[0].data().email) continue

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const leadsSnap = await adminDb.collection('leads').where('tenantId', '==', tenantId).where('createdAt', '>=', yesterday).get()

    if (leadsSnap.empty) continue

    const leads = leadsSnap.docs.map(d => d.data())
    await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: profilesSnap.docs[0].data().email as string,
      subject: 'Daily Lead Digest',
      html: `<h1>Leads from last 24 hours</h1>${leads.map(l => `<p>${l.name}: ${l.email ?? ''} - ${l.message ?? ''}</p>`).join('')}`
    })
  }

  return NextResponse.json({ message: 'Sent' })
}