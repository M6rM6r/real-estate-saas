export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

const LeadSchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1).max(100),
  phone: z.string().min(1).max(30),
  email: z.string().email().optional().or(z.literal('')),
  message: z.string().max(2000).optional(),
  listingId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request)
  if (limited) return limited

  let body: z.infer<typeof LeadSchema>
  try {
    const raw = await request.json()
    body = LeadSchema.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { tenantId, listingId } = body
  const name = sanitizeText(body.name)
  const phone = sanitizeText(body.phone)
  const email = body.email ? sanitizeText(body.email) : null
  const message = body.message ? sanitizeText(body.message) : null

  if (!name || !phone) {
    return NextResponse.json({ error: 'name and phone are required' }, { status: 400 })
  }

  try {
    // Verify tenant exists and is active
    const tenantDoc = await adminDb.collection('tenants').doc(tenantId).get()
    if (!tenantDoc.exists || tenantDoc.data()?.status !== 'active') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await adminDb.collection('leads').doc(uuidv4()).set({
      tenantId,
      name,
      phone,
      email,
      message,
      listingId: listingId ?? null,
      status: 'new',
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/leads]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
