export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { tenantId, name, phone, email, message, listingId } = body as {
    tenantId: string
    name: string
    phone: string
    email?: string
    message?: string
    listingId?: string
  }

  if (!tenantId || !name || !phone) {
    return NextResponse.json({ error: 'tenantId, name and phone are required' }, { status: 400 })
  }

  // Verify tenant exists and is active
  const tenantDoc = await adminDb.collection('tenants').doc(String(tenantId)).get()
  if (!tenantDoc.exists || tenantDoc.data()?.status !== 'active') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await adminDb.collection('leads').doc(uuidv4()).set({
    tenantId: String(tenantId),
    name: String(name).slice(0, 100),
    phone: String(phone).slice(0, 30),
    email: email ? String(email).slice(0, 200) : null,
    message: message ? String(message).slice(0, 2000) : null,
    listingId: listingId ?? null,
    status: 'new',
    createdAt: new Date(),
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
