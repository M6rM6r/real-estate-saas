export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { logMutation } from '@/lib/audit'
import { getLatencyBucket, getRequestId, logRouteError, logRouteInfo, logRouteStart } from '@/lib/observability'
import { FirestoreListingRepository } from '@/lib/repositories/listing-repository'
import { z } from 'zod'

const UpdateListingSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  body: z.string().max(5000).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  price: z.number().positive().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  bedrooms: z.number().int().min(0).max(9999).optional().nullable(),
  bathrooms: z.number().int().min(0).max(1000000).optional().nullable(),
  area_sqm: z.number().positive().optional().nullable(),
  listing_status: z.enum(['available', 'sold', 'rented']).optional(),
  offer_type: z.enum(['sale', 'rent']).optional().nullable(),
  property_type: z.string().max(50).optional().nullable(),
  card_style: z.enum(['standard', 'featured', 'compact']).optional().nullable(),
  published: z.boolean().optional(),
  images: z.array(z.string().url()).max(20).optional(),
})

const listingsRepo = new FirestoreListingRepository(adminDb)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startedAt = Date.now()
  logRouteStart(request, 'PATCH /api/dashboard/listings/:id', { listingId: params.id })
  const session = await getFirebaseSession(request)
  if (!session) {
    const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    response.headers.set('x-request-id', getRequestId(request))
    return response
  }

  let body: z.infer<typeof UpdateListingSchema>
  try {
    body = UpdateListingSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // Verify the listing belongs to this tenant
  const doc = await listingsRepo.findById(params.id)
  if (!doc) {
    const response = NextResponse.json({ error: 'Not found' }, { status: 404 })
    response.headers.set('x-request-id', getRequestId(request))
    return response
  }
  if (doc.tenantId !== session.tenantId) {
    const response = NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    response.headers.set('x-request-id', getRequestId(request))
    return response
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

  await listingsRepo.update(params.id, updateData)
  await logMutation({ tenantId: session.tenantId, action: 'update', resource: 'listing', resourceId: params.id, userId: session.uid })
  const tenantDoc = await adminDb.collection('tenants').doc(session.tenantId).get()
  const slug = tenantDoc.data()?.slug as string | undefined
  if (slug) revalidatePath(`/${slug}`)
  const response = NextResponse.json({ id: params.id, ...updateData })
  response.headers.set('x-request-id', getRequestId(request))
  logRouteInfo(request, 'PATCH /api/dashboard/listings/:id', {
    message: 'Listing updated',
    status: 200,
    durationMs: Date.now() - startedAt,
    latencyBucket: getLatencyBucket(Date.now() - startedAt),
    tenantId: session.tenantId,
    listingId: params.id,
  })
  return response
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startedAt = Date.now()
  logRouteStart(request, 'DELETE /api/dashboard/listings/:id', { listingId: params.id })
  const session = await getFirebaseSession(request)
  if (!session) {
    const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    response.headers.set('x-request-id', getRequestId(request))
    return response
  }

  const doc = await listingsRepo.findById(params.id)
  if (!doc) {
    const response = NextResponse.json({ error: 'Not found' }, { status: 404 })
    response.headers.set('x-request-id', getRequestId(request))
    return response
  }
  if (doc.tenantId !== session.tenantId) {
    const response = NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    response.headers.set('x-request-id', getRequestId(request))
    return response
  }

  await logMutation({ tenantId: session.tenantId, action: 'delete', resource: 'listing', resourceId: params.id, userId: session.uid })
  await listingsRepo.delete(params.id)
  const tenantDoc2 = await adminDb.collection('tenants').doc(session.tenantId).get()
  const slug2 = tenantDoc2.data()?.slug as string | undefined
  if (slug2) revalidatePath(`/${slug2}`)
  const response = NextResponse.json({ success: true })
  response.headers.set('x-request-id', getRequestId(request))
  logRouteInfo(request, 'DELETE /api/dashboard/listings/:id', {
    message: 'Listing deleted',
    status: 200,
    durationMs: Date.now() - startedAt,
    latencyBucket: getLatencyBucket(Date.now() - startedAt),
    tenantId: session.tenantId,
    listingId: params.id,
  })
  return response
}
