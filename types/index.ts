export type Tenant = {
  id: string
  slug: string
  name: string
  status: 'active' | 'suspended'
  created_at: string
  features?: Record<string, boolean>
  primary_color?: string
}

export type User = {
  id: string
  tenant_id: string
  email: string
  role: 'agent' | 'admin'
}

export type Profile = {
  tenant_id: string
  logo_url?: string
  cover_url?: string
  bio?: string
  licence_no?: string
  social_links?: {
    instagram?: string
    x?: string
    linkedin?: string
    whatsapp?: string
    snapchat?: string
  }
}

export type Post = {
  id: string
  tenant_id: string
  type: 'listing' | 'news' | 'announcement'
  title: string
  body: string
  images: string[]
  published_at?: string
  created_at: string
}

export type Media = {
  id: string
  tenant_id: string
  url: string
  label: string
  sort_order: number
}

export type Lead = {
  id: string
  tenant_id: string
  name: string
  phone: string
  message: string
  listing_id?: string
  created_at: string
}

export type AdminLog = {
  id: string
  action: string
  target_id: string
  target_type: string
  performed_by: string
  created_at: string
}