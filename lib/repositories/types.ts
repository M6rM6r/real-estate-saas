export type ListingEntity = {
  id: string
  tenantId: string
  type: 'listing'
  title: string | null
  body: string | null
  notes?: string | null
  images: string[]
  published: boolean
  publishedAt: Date | null
  createdAt: Date
  updatedAt?: Date
  price?: number | null
  location?: string | null
  location_url?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  area_sqm?: number | null
  listing_status?: 'available' | 'sold' | 'rented'
  offer_type?: 'sale' | 'rent' | null
  property_type?: string | null
  card_style?: 'standard' | 'featured' | 'compact' | null
}

export type LeadEntity = {
  id: string
  tenantId: string
  createdAt: Date | null
  [key: string]: unknown
}

export interface ListingRepository {
  findByTenant(tenantId: string): Promise<ListingEntity[]>
  findById(id: string): Promise<ListingEntity | null>
  create(id: string, data: Omit<ListingEntity, 'id'>): Promise<void>
  update(id: string, data: Partial<ListingEntity>): Promise<void>
  delete(id: string): Promise<void>
}

export interface LeadRepository {
  findByTenant(tenantId: string, options?: { since?: Date }): Promise<LeadEntity[]>
}
