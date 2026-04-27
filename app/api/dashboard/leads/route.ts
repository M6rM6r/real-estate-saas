export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sinceParam = request.nextUrl.searchParams.get('since')
  let query = adminDb.collection('leads')
    .where('tenantId', '==', session.tenantId)
    .orderBy('createdAt', 'desc') as FirebaseFirestore.Query

  if (sinceParam) {
    const sinceDate = new Date(sinceParam)
    if (!isNaN(sinceDate.getTime())) {
      query = query.where('createdAt', '>', sinceDate)
    }
  }

  const snap = await query.get()
  return NextResponse.json(snap.docs.map(d => {
    const { createdAt, ...rest } = d.data()
    return { id: d.id, ...rest, created_at: createdAt?.toDate?.()?.toISOString() ?? null }
  }))
}
