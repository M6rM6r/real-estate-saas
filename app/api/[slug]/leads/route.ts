export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params

  const snap = await adminDb.collection('tenants').where('slug', '==', slug).where('status', '==', 'active').limit(1).get()
  if (snap.empty) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  const tenantId = snap.docs[0].id
  const { name, phone, message, listing_id } = await request.json()

  await adminDb.collection('leads').doc(uuidv4()).set({
    tenantId,
    name: String(name).slice(0, 100),
    phone: String(phone).slice(0, 30),
    message: message ? String(message).slice(0, 2000) : null,
    listingId: listing_id ?? null,
    status: 'new',
    createdAt: new Date(),
  })

  return NextResponse.json({ success: true })
}