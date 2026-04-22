export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'listing'
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 12

  const snap = await adminDb
    .collection('posts')
    .where('tenantId', '==', session.tenantId)
    .where('type', '==', type)
    .orderBy('createdAt', 'desc')
    .get()

  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  const data = all.slice((page - 1) * limit, page * limit)
  return NextResponse.json({ data, count: all.length, page, limit })
}

export async function POST(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const id = uuidv4()
  const doc = { ...body, tenantId: session.tenantId, createdAt: new Date() }
  await adminDb.collection('posts').doc(id).set(doc)
  return NextResponse.json({ id, ...doc }, { status: 201 })
}
