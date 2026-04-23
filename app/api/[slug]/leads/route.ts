export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sanitizeText } from '@/lib/sanitize'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

const LeadSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(1).max(30),
  email: z.string().email().optional().or(z.literal('')),
  message: z.string().max(2000).optional(),
  listing_id: z.string().max(100).optional(),
})

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  // Rate-limit public lead submissions per IP
  const limited = await rateLimit(request)
  if (limited) return limited

  const { slug } = params

  const snap = await adminDb
    .collection('tenants')
    .where('slug', '==', slug)
    .where('status', '==', 'active')
    .limit(1)
    .get()

  if (snap.empty) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: z.infer<typeof LeadSchema>
  try {
    body = LeadSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const tenantId = snap.docs[0].id
  const name = sanitizeText(body.name)
  const phone = sanitizeText(body.phone)
  const email = body.email ? sanitizeText(body.email) : null
  const message = body.message ? sanitizeText(body.message) : null

  if (!name || !phone) {
    return NextResponse.json({ error: 'name and phone are required' }, { status: 400 })
  }

  await adminDb.collection('leads').doc(uuidv4()).set({
    tenantId,
    name,
    phone,
    email,
    message,
    listingId: body.listing_id ?? null,
    status: 'new',
    createdAt: new Date(),
  })

  return NextResponse.json({ success: true }, { status: 201 })
}