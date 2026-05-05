import type { Firestore } from 'firebase-admin/firestore'
import type { ListingEntity, ListingRepository } from './types'

function toListing(id: string, data: Record<string, unknown>): ListingEntity {
  return {
    id,
    tenantId: String(data.tenantId ?? ''),
    type: 'listing',
    title: (data.title as string | null | undefined) ?? null,
    body: (data.body as string | null | undefined) ?? null,
    notes: (data.notes as string | null | undefined) ?? null,
    images: Array.isArray(data.images) ? (data.images as string[]) : [],
    published: Boolean(data.published),
    publishedAt: data.publishedAt && typeof (data.publishedAt as { toDate?: () => Date }).toDate === 'function'
      ? (data.publishedAt as { toDate: () => Date }).toDate()
      : (data.publishedAt as Date | null | undefined) ?? null,
    createdAt: data.createdAt && typeof (data.createdAt as { toDate?: () => Date }).toDate === 'function'
      ? (data.createdAt as { toDate: () => Date }).toDate()
      : ((data.createdAt as Date | undefined) ?? new Date()),
    updatedAt: data.updatedAt && typeof (data.updatedAt as { toDate?: () => Date }).toDate === 'function'
      ? (data.updatedAt as { toDate: () => Date }).toDate()
      : (data.updatedAt as Date | undefined),
    price: (data.price as number | null | undefined) ?? null,
    location: (data.location as string | null | undefined) ?? null,
    location_url: (data.location_url as string | null | undefined) ?? null,
    bedrooms: (data.bedrooms as number | null | undefined) ?? null,
    bathrooms: (data.bathrooms as number | null | undefined) ?? null,
    area_sqm: (data.area_sqm as number | null | undefined) ?? null,
    listing_status: data.listing_status as ListingEntity['listing_status'],
    offer_type: (data.offer_type as ListingEntity['offer_type']) ?? null,
    property_type: (data.property_type as string | null | undefined) ?? null,
    card_style: (data.card_style as ListingEntity['card_style']) ?? null,
  }
}

export class FirestoreListingRepository implements ListingRepository {
  constructor(private readonly db: Firestore) {}

  async findByTenant(tenantId: string): Promise<ListingEntity[]> {
    const snap = await this.db
      .collection('posts')
      .where('tenantId', '==', tenantId)
      .where('type', '==', 'listing')
      .get()

    return snap.docs
      .map((doc) => toListing(doc.id, doc.data()))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async findById(id: string): Promise<ListingEntity | null> {
    const doc = await this.db.collection('posts').doc(id).get()
    if (!doc.exists) return null
    return toListing(doc.id, doc.data() as Record<string, unknown>)
  }

  async create(id: string, data: Omit<ListingEntity, 'id'>): Promise<void> {
    await this.db.collection('posts').doc(id).set(data)
  }

  async update(id: string, data: Partial<ListingEntity>): Promise<void> {
    await this.db.collection('posts').doc(id).update(data)
  }

  async delete(id: string): Promise<void> {
    await this.db.collection('posts').doc(id).delete()
  }
}
