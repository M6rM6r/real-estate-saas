export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { logMutation } from '@/lib/audit'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

const CreatePostSchema = z.object({
  type: z.enum(['listing', 'news', 'announcement']),
  title: z.string().min(1).max(300),
  body: z.string().max(20000).optional(),
  images: z.array(z.string().url()).max(20).optional(),
  price: z.number().positive().optional(),
  location: z.string().max(300).optional(),
  bedrooms: z.number().int().min(0).max(100).optional(),
  bathrooms: z.number().int().min(0).max(100).optional(),
  area_sqm: z.number().positive().optional(),
  listing_status: z.enum(['available', 'sold', 'rented']).optional(),
  offer_type: z.enum(['sale', 'rent']).nullable().optional(),
  property_type: z.string().max(100).nullable().optional(),
  published: z.boolean().optional().default(false),
  publish_at: z.string().datetime().optional().nullable(),
})

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

  let body: z.infer<typeof CreatePostSchema>
  try {
    body = CreatePostSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const id = uuidv4()
  const doc = { ...body, tenantId: session.tenantId, createdAt: new Date() }
  await adminDb.collection('posts').doc(id).set(doc)
  await logMutation({ tenantId: session.tenantId, action: 'create', resource: body.type as 'listing' | 'news' | 'announcement', resourceId: id, userId: session.uid })
  return NextResponse.json({ id, ...doc }, { status: 201 })
}
