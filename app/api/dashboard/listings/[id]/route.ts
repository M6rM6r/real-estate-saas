export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { z } from 'zod'

const UpdateListingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().max(5000).optional().nullable(),
  price: z.number().positive().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  bedrooms: z.number().int().min(0).optional().nullable(),
  bathrooms: z.number().int().min(0).optional().nullable(),
  area_sqm: z.number().positive().optional().nullable(),
  listing_status: z.enum(['available', 'sold', 'rented']).optional(),
  offer_type: z.enum(['sale', 'rent']).optional().nullable(),
  property_type: z.string().max(50).optional().nullable(),
  card_style: z.enum(['standard', 'featured', 'compact']).optional().nullable(),
  published: z.boolean().optional(),
  images: z.array(z.string().url()).max(20).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: z.infer<typeof UpdateListingSchema>
  try {
    body = UpdateListingSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // Verify the listing belongs to this tenant
  const doc = await adminDb.collection('posts').doc(params.id).get()
  if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (doc.data()?.tenantId !== session.tenantId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, body: description, images, published, ...rest } = body
  const updateData: Record<string, unknown> = { ...rest, updatedAt: new Date() }
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.body = description
  if (images !== undefined) updateData.images = images
  if (published !== undefined) {
    updateData.published = published
    updateData.publishedAt = published ? new Date() : null
  }

  await adminDb.collection('posts').doc(params.id).update(updateData)
  return NextResponse.json({ id: params.id, ...updateData })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doc = await adminDb.collection('posts').doc(params.id).get()
  if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (doc.data()?.tenantId !== session.tenantId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await adminDb.collection('posts').doc(params.id).delete()
  return NextResponse.json({ success: true })
}
