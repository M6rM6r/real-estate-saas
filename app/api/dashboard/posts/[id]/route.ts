export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { logMutation } from '@/lib/audit'
import { z } from 'zod'

const UpdatePostSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  body: z.string().max(20000).optional().nullable(),
  images: z.array(z.string().url()).max(20).optional(),
  price: z.number().positive().optional().nullable(),
  location: z.string().max(300).optional().nullable(),
  bedrooms: z.number().int().min(0).max(100).optional().nullable(),
  bathrooms: z.number().int().min(0).max(100).optional().nullable(),
  area_sqm: z.number().positive().optional().nullable(),
  listing_status: z.enum(['available', 'sold', 'rented']).optional(),
  offer_type: z.enum(['sale', 'rent']).nullable().optional(),
  property_type: z.string().max(100).nullable().optional(),
  published: z.boolean().optional(),
  publish_at: z.string().datetime().optional().nullable(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: z.infer<typeof UpdatePostSchema>
  try {
    body = UpdatePostSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const ref = adminDb.collection('posts').doc(params.id)
  const doc = await ref.get()
  if (!doc.exists || doc.data()?.tenantId !== session.tenantId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await ref.update({ ...body, updatedAt: new Date() })
  const type = doc.data()?.type as 'listing' | 'news' | 'announcement' | undefined
  await logMutation({ tenantId: session.tenantId, action: 'update', resource: type ?? 'listing', resourceId: params.id, userId: session.uid })
  const updated = await ref.get()
  return NextResponse.json({ id: updated.id, ...updated.data() })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getFirebaseSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ref = adminDb.collection('posts').doc(params.id)
  const doc = await ref.get()
  if (!doc.exists || doc.data()?.tenantId !== session.tenantId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const type = doc.data()?.type as 'listing' | 'news' | 'announcement' | undefined
  await logMutation({ tenantId: session.tenantId, action: 'delete', resource: type ?? 'listing', resourceId: params.id, userId: session.uid })
  await ref.delete()
  return NextResponse.json({ success: true })
}
