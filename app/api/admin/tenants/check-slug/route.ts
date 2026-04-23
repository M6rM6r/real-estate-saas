export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  const slug = new URL(request.url).searchParams.get('slug')
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 })
  }

  const snap = await adminDb.collection('tenants').where('slug', '==', slug).limit(1).get()
  return NextResponse.json({ available: snap.empty })
}
