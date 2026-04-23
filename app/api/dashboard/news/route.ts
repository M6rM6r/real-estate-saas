export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

const PostSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(10000).optional().nullable(),
  images: z.array(z.string().url()).max(10).optional(),
  published: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const snap = await adminDb.collection('posts')
    .where('tenantId', '==', session.tenantId).where('type', '==', 'news')
    .orderBy('createdAt', 'desc').get()
  return NextResponse.json(snap.docs.map(d => {
    const { createdAt, ...rest } = d.data()
    return { id: d.id, ...rest, created_at: createdAt?.toDate?.()?.toISOString() ?? null }
  }))
}

export async function POST(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: z.infer<typeof PostSchema>
  try {
    body = PostSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const id = uuidv4()
  const doc = {
    tenantId: session.tenantId,
    type: 'news',
    title: body.title,
    body: body.body ?? null,
    images: body.images ?? [],
    published: !!body.published,
    publishedAt: body.published ? new Date() : null,
    createdAt: new Date(),
  }
  await adminDb.collection('posts').doc(id).set(doc)
  return NextResponse.json({ id, ...doc }, { status: 201 })
}
