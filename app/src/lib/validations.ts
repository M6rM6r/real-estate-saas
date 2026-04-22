import { z } from 'zod'

export const listingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Description is required'),
  price: z.string().optional(),
  location: z.string().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  area: z.number().optional(),
  status: z.enum(['available', 'sold', 'rented']).default('available'),
  images: z.array(z.string()).default([]),
  published: z.boolean().default(false)
})

export const newsSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  coverImage: z.string().optional(),
  published: z.boolean().default(false)
})

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  tagline: z.string().optional(),
  bio: z.string().optional(),
  licenceNo: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  x: z.string().optional(),
  linkedin: z.string().optional()
})