export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { logMutation } from '@/lib/audit'
import { getLatencyBucket, getRequestId, logRouteError, logRouteInfo, logRouteStart } from '@/lib/observability'
import { FirestoreListingRepository } from '@/lib/repositories/listing-repository'
import { trackFunnelEvent } from '@/lib/funnel-events'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

const ListingSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  body: z.string().max(5000).optional(),
  notes: z.string().max(2000).optional().nullable(),
  price: z.number().positive().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  location_url: z.string().url().max(500).optional().nullable(),
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

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  logRouteStart(request, 'GET /api/dashboard/listings')
  try {
    const session = await getFirebaseSession(request)
    if (!session) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      response.headers.set('x-request-id', getRequestId(request))
      return response
    }

    const listings = await listingsRepo.findByTenant(session.tenantId)
    const response = NextResponse.json({
      data: listings.map(({ createdAt, ...rest }) => ({
        ...rest,
        created_at: createdAt?.toISOString() ?? null,
      })),
    })
    response.headers.set('x-request-id', getRequestId(request))
    logRouteInfo(request, 'GET /api/dashboard/listings', {
      message: 'Listings fetched',
      status: 200,
      durationMs: Date.now() - startedAt,
      latencyBucket: getLatencyBucket(Date.now() - startedAt),
      resultCount: listings.length,
      tenantId: session.tenantId,
    })
    return response
  } catch (error) {
    logRouteError(request, 'GET /api/dashboard/listings', error, {
      status: 500,
      durationMs: Date.now() - startedAt,
      latencyBucket: getLatencyBucket(Date.now() - startedAt),
    })
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    response.headers.set('x-request-id', getRequestId(request))
    return response
  }
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now()
  logRouteStart(request, 'POST /api/dashboard/listings')

  const session = await getFirebaseSession(request)
  if (!session) {
    const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    response.headers.set('x-request-id', getRequestId(request))
    return response
  }

  let body: z.infer<typeof ListingSchema>
  try {
    body = ListingSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  try {
    const { title, body: description, images, published, ...rest } = body
    const id = uuidv4()
    const existingCount = (await listingsRepo.findByTenant(session.tenantId)).length
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
    await listingsRepo.create(id, doc as Parameters<FirestoreListingRepository['create']>[1])
    await logMutation({ tenantId: session.tenantId, action: 'create', resource: 'listing', resourceId: id, userId: session.uid, after: doc as Record<string, unknown> })
    await trackFunnelEvent({
      name: 'listing_created',
      tenantId: session.tenantId,
      uid: session.uid,
      requestId: getRequestId(request),
      metadata: { listingId: id, published: !!published },
    })
    if (existingCount === 0) {
      await trackFunnelEvent({
        name: 'first_listing_created',
        tenantId: session.tenantId,
        uid: session.uid,
        requestId: getRequestId(request),
        metadata: { listingId: id },
      })
    }
    const tenantDoc = await adminDb.collection('tenants').doc(session.tenantId).get()
    const slug = tenantDoc.data()?.slug as string | undefined
    if (slug) revalidatePath(`/${slug}`)
    const response = NextResponse.json({ id, ...doc }, { status: 201 })
    response.headers.set('x-request-id', getRequestId(request))
    logRouteInfo(request, 'POST /api/dashboard/listings', {
      message: 'Listing created',
      status: 201,
      durationMs: Date.now() - startedAt,
      latencyBucket: getLatencyBucket(Date.now() - startedAt),
      tenantId: session.tenantId,
      listingId: id,
    })
    return response
  } catch (err) {
    logRouteError(request, 'POST /api/dashboard/listings', err, {
      status: 500,
      durationMs: Date.now() - startedAt,
      latencyBucket: getLatencyBucket(Date.now() - startedAt),
      tenantId: session.tenantId,
    })
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    response.headers.set('x-request-id', getRequestId(request))
    return response
  }
}
