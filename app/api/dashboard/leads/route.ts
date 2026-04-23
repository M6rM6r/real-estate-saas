export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const snap = await adminDb.collection('leads').where('tenantId', '==', session.tenantId).orderBy('createdAt', 'desc').get()
  return NextResponse.json(snap.docs.map(d => {
    const { createdAt, ...rest } = d.data()
    return { id: d.id, ...rest, created_at: createdAt?.toDate?.()?.toISOString() ?? null }
  }))
}
