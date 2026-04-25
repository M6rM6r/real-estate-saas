export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

const ListingSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(5000).optional(),
  price: z.number().positive().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  bedrooms: z.number().int().min(0).optional().nullable(),
  bathrooms: z.number().int().min(0).optional().nullable(),
  area_sqm: z.number().positive().optional().nullable(),
  listing_status: z.enum(['available', 'sold', 'rented']).optional(),
  offer_type: z.enum(['sale', 'rent']).optional().nullable(),
  property_type: z.string().max(50).optional().nullable(),
  published: z.boolean().optional(),
  images: z.array(z.string().url()).max(20).optional(),
})

export async function GET(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const snap = await adminDb.collection('posts')
    .where('tenantId', '==', session.tenantId).where('type', '==', 'listing')
    .get()
  const docs = [...snap.docs].sort((a, b) => (b.data().createdAt?.toMillis?.() ?? 0) - (a.data().createdAt?.toMillis?.() ?? 0))
  return NextResponse.json({ data: docs.map(d => {
    const { createdAt, ...rest } = d.data()
    return { id: d.id, ...rest, created_at: createdAt?.toDate?.()?.toISOString() ?? null }
  }) })
}

export async function POST(request: NextRequest) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: z.infer<typeof ListingSchema>
  try {
    body = ListingSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  try {
    const { title, body: description, images, published, ...rest } = body
    const id = uuidv4()
    const doc = {
      tenantId: session.tenantId,
      type: 'listing',
      title,
      body: description ?? null,
      images: images ?? [],
      published: !!published,
      publishedAt: published ? new Date() : null,
      createdAt: new Date(),
      ...rest,
    }
    await adminDb.collection('posts').doc(id).set(doc)
    return NextResponse.json({ id, ...doc }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/dashboard/listings]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
