import { listingSchema, newsSchema, profileSchema } from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('listingSchema', () => {
    it('should validate a valid listing', () => {
      const validListing = {
        title: 'Beautiful House',
        body: 'A nice house for sale',
        price: '500000',
        location: 'Downtown',
        bedrooms: 3,
        bathrooms: 2,
        area: 2000,
        status: 'available' as const,
        images: ['image1.jpg', 'image2.jpg'],
        published: true,
      }

      const result = listingSchema.safeParse(validListing)
      expect(result.success).toBe(true)
    })

    it('should reject listing without title', () => {
      const invalidListing = {
        body: 'A nice house for sale',
      }

      const result = listingSchema.safeParse(invalidListing)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path[0]).toBe('title')
      expect(result.error?.issues[0].message).toBe('Required')
    })

    it('should reject listing without body', () => {
      const invalidListing = {
        title: 'Beautiful House',
      }

      const result = listingSchema.safeParse(invalidListing)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path[0]).toBe('body')
      expect(result.error?.issues[0].message).toBe('Required')
    })

    it('should accept listing with minimal required fields', () => {
      const minimalListing = {
        title: 'House',
        body: 'Description',
      }

      const result = listingSchema.safeParse(minimalListing)
      expect(result.success).toBe(true)
    })
  })

  describe('newsSchema', () => {
    it('should validate a valid news item', () => {
      const validNews = {
        title: 'Market Update',
        body: 'Latest market news',
        coverImage: 'cover.jpg',
        published: true,
      }

      const result = newsSchema.safeParse(validNews)
      expect(result.success).toBe(true)
    })

    it('should reject news without title', () => {
      const invalidNews = {
        body: 'Latest market news',
      }

      const result = newsSchema.safeParse(invalidNews)
      expect(result.success).toBe(false)
    })

    it('should reject news without body', () => {
      const invalidNews = {
        title: 'Market Update',
      }

      const result = newsSchema.safeParse(invalidNews)
      expect(result.success).toBe(false)
    })
  })

  describe('profileSchema', () => {
    it('should validate a valid profile', () => {
      const validProfile = {
        name: 'John Doe',
        tagline: 'Real Estate Agent',
        bio: 'Experienced agent',
        licenceNo: '12345',
        whatsapp: '+1234567890',
        instagram: '@johndoe',
        x: '@johndoe',
        linkedin: 'johndoe',
      }

      const result = profileSchema.safeParse(validProfile)
      expect(result.success).toBe(true)
    })

    it('should reject profile without name', () => {
      const invalidProfile = {
        tagline: 'Real Estate Agent',
      }

      const result = profileSchema.safeParse(invalidProfile)
      expect(result.success).toBe(false)
    })

    it('should accept profile with only name', () => {
      const minimalProfile = {
        name: 'John Doe',
      }

      const result = profileSchema.safeParse(minimalProfile)
      expect(result.success).toBe(true)
    })
  })
})