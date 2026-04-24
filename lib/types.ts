export const PAGE_THEMES = {
  modern:  { id: 'modern',  label: 'عصري',    labelEn: 'Modern',  bg: '#ffffff', card: '#f8fafc', accent: '#2563eb', dark: false },
  luxury:  { id: 'luxury',  label: 'فاخر',     labelEn: 'Luxury',  bg: '#0f0f0f', card: '#1a1a1a', accent: '#c9a84c', dark: true  },
  nature:  { id: 'nature',  label: 'طبيعي',   labelEn: 'Nature',  bg: '#f0fdf4', card: '#ffffff', accent: '#16a34a', dark: false },
  ocean:   { id: 'ocean',   label: 'بحري',     labelEn: 'Ocean',   bg: '#f0f9ff', card: '#ffffff', accent: '#0891b2', dark: false },
  desert:  { id: 'desert',  label: 'صحراوي',  labelEn: 'Desert',  bg: '#fffbeb', card: '#ffffff', accent: '#d97706', dark: false },
} as const;
export type ThemeId = keyof typeof PAGE_THEMES;

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  status: 'active' | 'suspended';
  primary_color?: string;
  theme?: string;
  created_at: string;
  features?: Record<string, boolean>;
};

export type Profile = {
  tenant_id: string;
  logo_url?: string;
  cover_url?: string;
  bio?: string;
  tagline?: string;
  licence_no?: string;
  primary_color?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  social_links?: {
    instagram?: string;
    x?: string;
    linkedin?: string;
    whatsapp?: string;
  };
};

export type ListingStatus = 'available' | 'sold' | 'rented';

export type Post = {
  id: string;
  tenant_id: string;
  type: 'listing' | 'news' | 'announcement';
  title: string;
  body: string;
  images: string[];
  price?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  listing_status?: ListingStatus;
  published: boolean;
  published_at?: string;
  created_at: string;
  updated_at?: string;
};

export type Media = {
  id: string;
  tenant_id: string;
  url: string;
  filename?: string;
  label?: string;
  size?: number;
  sort_order: number;
  created_at?: string;
};

export type LeadStatus = 'new' | 'contacted' | 'closed';

export type Lead = {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  listing_id?: string;
  status: LeadStatus;
  created_at: string;
};

export type AdminLog = {
  id: string;
  action: string;
  target_id: string;
  target_type: string;
  performed_by: string;
  metadata?: Record<string, unknown>;
  created_at: string;
};

export type AnalyticsData = {
  pageViews: { date: string; views: number }[];
  totalViews: number;
  totalLeads: number;
};

export type AdminMetrics = {
  totalAgencies: number;
  totalPosts: number;
  totalMedia: number;
  agenciesPerMonth: { month: string; count: number }[];
  topAgencies: { name: string; slug: string; postCount: number }[];
  allAgencies: {
    id: string;
    name: string;
    slug: string;
    status: 'active' | 'suspended';
    postCount: number;
    created_at: string;
  }[];
};

export type PublicPageData = {
  tenant: Tenant & { primary_color: string };
  profile: Profile;
  listings: Post[];
  news?: Post[];
  gallery?: Media[];
  team?: { id: string; email: string; role: string }[];
};
