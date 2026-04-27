export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireAdmin } from '@/lib/admin-auth'
import { Resend } from 'resend'

const EMAIL_FROM = process.env.RESEND_FROM_EMAIL ?? process.env.EMAIL_FROM_ADDRESS ?? (process.env.NODE_ENV === 'production' ? undefined : 'noreply@example.com')

export async function GET(request: NextRequest) {
  // Require admin authentication — unauthenticated callers cannot trigger bulk emails
  const denied = await requireAdmin(request)
  if (denied) return denied

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY is not configured' }, { status: 503 })
  }

  if (!EMAIL_FROM) {
    return NextResponse.json({
      error: 'RESEND_FROM_EMAIL environment variable is not set',
    }, { status: 503 })
  }

  // Check if Firebase is configured
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY.includes('YOUR_PRIVATE_KEY_HERE')) {
    return NextResponse.json({
      error: 'Firebase Admin credentials not configured',
      message: 'Cannot send email digest without Firebase configuration',
    }, { status: 503 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const tenantsSnap = await adminDb.collection('tenants').where('status', '==', 'active').get()
  let sent = 0

  for (const tenantDoc of tenantsSnap.docs) {
    const tenantId = tenantDoc.id

    const profilesSnap = await adminDb.collection('profiles').where('tenantId', '==', tenantId).limit(1).get()
    const profileData = profilesSnap.docs[0]?.data()
    const recipientEmail = profileData?.contact_email as string | undefined
    if (!recipientEmail) continue

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const leadsSnap = await adminDb.collection('leads').where('tenantId', '==', tenantId).where('createdAt', '>=', yesterday).get()

    if (leadsSnap.empty) continue

    const leads = leadsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Array<Record<string, unknown>>
    const agencyName = (tenantDoc.data().agency_name as string | undefined) ?? tenantId

    const rows = leads.map(l =>
      `<tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:8px 12px">${l.name ?? '-'}</td>
        <td style="padding:8px 12px">${l.phone ?? '-'}</td>
        <td style="padding:8px 12px">${l.email ?? '-'}</td>
        <td style="padding:8px 12px">${l.message ?? '-'}</td>
      </tr>`
    ).join('')

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1e293b">ملخص العملاء اليومي — ${agencyName}</h2>
        <p style="color:#64748b">${leads.length} عميل محتمل جديد في آخر 24 ساعة</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          <thead>
            <tr style="background:#f8fafc">
              <th style="padding:8px 12px;text-align:right;color:#475569">الاسم</th>
              <th style="padding:8px 12px;text-align:right;color:#475569">الهاتف</th>
              <th style="padding:8px 12px;text-align:right;color:#475569">البريد</th>
              <th style="padding:8px 12px;text-align:right;color:#475569">الرسالة</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`

    await resend.emails.send({
      from: EMAIL_FROM,
      to: recipientEmail,
      subject: `ملخص العملاء اليومي — ${agencyName}`,
      html,
    })
    sent++
  }

  return NextResponse.json({ message: 'Sent', sent })
}
