export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'

const PAGE_SIZE = 30

export async function GET(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') ?? ''
  const resource = searchParams.get('resource') ?? ''
  const cursor = searchParams.get('cursor') ?? ''

  let query = adminDb
    .collection('audit_logs')
    .where('tenant_id', '==', session.tenantId)
    .orderBy('created_at', 'desc')

  if (action) query = query.where('action', '==', action) as typeof query
  if (resource) query = query.where('resource', '==', resource) as typeof query

  if (cursor) {
    const cursorDoc = await adminDb.collection('audit_logs').doc(cursor).get()
    if (cursorDoc.exists) query = query.startAfter(cursorDoc) as typeof query
  }

  const snap = await query.limit(PAGE_SIZE + 1).get()

  const hasMore = snap.docs.length > PAGE_SIZE
  const docs = hasMore ? snap.docs.slice(0, PAGE_SIZE) : snap.docs

  const logs = docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      action: data.action,
      resource: data.resource,
      resource_id: data.resource_id,
      user_id: data.user_id,
      created_at: data.created_at?.toDate?.()?.toISOString() ?? null,
    }
  })

  return NextResponse.json({
    logs,
    hasMore,
    nextCursor: hasMore ? docs[docs.length - 1].id : null,
  })
}
