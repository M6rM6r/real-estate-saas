export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          slug: string
          name: string
          status: 'active' | 'suspended'
          features: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          status?: 'active' | 'suspended'
          features?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          status?: 'active' | 'suspended'
          features?: Json
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          tenant_id: string | null
          email: string
          role: 'agent' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          tenant_id?: string | null
          email: string
          role?: 'agent' | 'admin'
          created_at?: string
        }
        Update: {
          tenant_id?: string | null
          email?: string
          role?: 'agent' | 'admin'
        }
      }
      profiles: {
        Row: {
          id: string
          tenant_id: string
          logo_url: string | null
          cover_url: string | null
          bio: string | null
          tagline: string | null
          licence_no: string | null
          primary_color: string
          preferred_lang: 'en' | 'ar'
          contact_email: string | null
          contact_phone: string | null
          address: string | null
          working_hours: Json
          social_links: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          logo_url?: string | null
          cover_url?: string | null
          bio?: string | null
          tagline?: string | null
          licence_no?: string | null
          primary_color?: string
          preferred_lang?: 'en' | 'ar'
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          working_hours?: Json
          social_links?: Json
        }
        Update: {
          logo_url?: string | null
          cover_url?: string | null
          bio?: string | null
          tagline?: string | null
          licence_no?: string | null
          primary_color?: string
          preferred_lang?: 'en' | 'ar'
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          working_hours?: Json
          social_links?: Json
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          tenant_id: string
          type: 'listing' | 'news' | 'announcement'
          title: string
          body: string | null
          images: Json
          price: number | null
          location: string | null
          bedrooms: number | null
          bathrooms: number | null
          area_sqm: number | null
          listing_status: 'available' | 'sold' | 'rented' | null
          published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          type: 'listing' | 'news' | 'announcement'
          title: string
          body?: string | null
          images?: Json
          price?: number | null
          location?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          area_sqm?: number | null
          listing_status?: 'available' | 'sold' | 'rented' | null
          published?: boolean
          published_at?: string | null
        }
        Update: {
          type?: 'listing' | 'news' | 'announcement'
          title?: string
          body?: string | null
          images?: Json
          price?: number | null
          location?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          area_sqm?: number | null
          listing_status?: 'available' | 'sold' | 'rented' | null
          published?: boolean
          published_at?: string | null
          updated_at?: string
        }
      }
      media: {
        Row: {
          id: string
          tenant_id: string
          url: string
          label: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          url: string
          label?: string | null
          sort_order?: number
        }
        Update: {
          url?: string
          label?: string | null
          sort_order?: number
        }
      }
      leads: {
        Row: {
          id: string
          tenant_id: string
          listing_id: string | null
          name: string
          phone: string
          message: string | null
          status: 'new' | 'contacted' | 'closed'
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          listing_id?: string | null
          name: string
          phone: string
          message?: string | null
          status?: 'new' | 'contacted' | 'closed'
        }
        Update: {
          status?: 'new' | 'contacted' | 'closed'
        }
      }
      page_views: {
        Row: {
          id: number
          tenant_id: string
          listing_id: string | null
          viewed_at: string
        }
        Insert: {
          tenant_id: string
          listing_id?: string | null
          viewed_at?: string
        }
        Update: Record<string, never>
      }
      admin_logs: {
        Row: {
          id: string
          action: string
          target_id: string | null
          target_type: string | null
          performed_by: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          action: string
          target_id?: string | null
          target_type?: string | null
          performed_by: string
          metadata?: Json | null
        }
        Update: Record<string, never>
      }
    }
  }
}

// Convenience aliases
export type Tenant = Database['public']['Tables']['tenants']['Row']
export type TenantInsert = Database['public']['Tables']['tenants']['Insert']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type PostInsert = Database['public']['Tables']['posts']['Insert']
export type Media = Database['public']['Tables']['media']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type AdminLog = Database['public']['Tables']['admin_logs']['Row']

export interface SocialLinks {
  instagram?: string
  x?: string
  linkedin?: string
  whatsapp?: string
}

export interface WorkingHours {
  monday?: DaySchedule
  tuesday?: DaySchedule
  wednesday?: DaySchedule
  thursday?: DaySchedule
  friday?: DaySchedule
  saturday?: DaySchedule
  sunday?: DaySchedule
}

export interface DaySchedule {
  active: boolean
  open?: string
  close?: string
}

export interface TenantFeatures {
  ai_descriptions?: boolean
  lead_capture?: boolean
  analytics?: boolean
  comparison_tool?: boolean
}
