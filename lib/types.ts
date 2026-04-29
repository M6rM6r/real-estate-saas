export const PAGE_THEMES = {
  modern: {
    id: 'modern', label: 'عصري', labelEn: 'Modern',
    bg: '#0f1117', card: '#1a1d27', accent: '#2563eb', dark: true,
    navBg: 'rgba(15,17,23,0.97)', navBorder: '#2a2e3e',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.18), rgba(0,0,0,0.72))',
    heroCardBg: 'rgba(15,17,23,0.65)', heroCardBorder: 'rgba(255,255,255,0.15)', heroCardBlur: true,
    radius: '16px', cardBg: '#1a1d27', cardBorder: '#2a2e3e', cardShadow: '0 1px 4px rgba(0,0,0,0.4)',
    sectionAlt: '#13161e',
    headingFont: 'inherit',
  },
  luxury: {
    id: 'luxury', label: 'فاخر', labelEn: 'Luxury',
    bg: '#0a0a0a', card: '#141414', accent: '#c9a84c', dark: true,
    navBg: 'rgba(8,8,8,0.97)', navBorder: 'rgba(201,168,76,0.18)',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.88))',
    heroCardBg: 'rgba(10,8,4,0.78)', heroCardBorder: 'rgba(201,168,76,0.35)', heroCardBlur: false,
    radius: '6px', cardBg: '#141414', cardBorder: 'rgba(201,168,76,0.14)', cardShadow: 'none',
    sectionAlt: '#101010',
    headingFont: "Georgia, 'Times New Roman', serif",
  },
  nature: {
    id: 'nature', label: 'طبيعي', labelEn: 'Nature',
    bg: '#0a1a0e', card: '#162419', accent: '#16a34a', dark: true,
    navBg: 'rgba(10,26,14,0.97)', navBorder: '#2d4a32',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,40,10,0.25), rgba(0,40,10,0.80))',
    heroCardBg: 'rgba(10,26,14,0.82)', heroCardBorder: 'rgba(45,74,50,0.60)', heroCardBlur: true,
    radius: '26px', cardBg: '#162419', cardBorder: '#2d4a32', cardShadow: '0 2px 8px rgba(0,0,0,0.4)',
    sectionAlt: '#0e2113',
    headingFont: 'inherit',
  },
  ocean: {
    id: 'ocean', label: 'بحري', labelEn: 'Ocean',
    bg: '#060e1e', card: '#0d1b30', accent: '#0891b2', dark: true,
    navBg: 'rgba(6,14,30,0.97)', navBorder: '#1a3356',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,20,50,0.15), rgba(0,20,50,0.75))',
    heroCardBg: 'rgba(8,145,178,0.12)', heroCardBorder: 'rgba(186,230,253,0.40)', heroCardBlur: true,
    radius: '20px', cardBg: '#0d1b30', cardBorder: '#1a3356', cardShadow: '0 2px 8px rgba(0,0,0,0.4)',
    sectionAlt: '#091526',
    headingFont: 'inherit',
  },
  desert: {
    id: 'desert', label: 'صحراوي', labelEn: 'Desert',
    bg: '#1a0f02', card: '#241505', accent: '#d97706', dark: true,
    navBg: 'rgba(26,15,2,0.97)', navBorder: '#3d2810',
    heroOverlay: 'linear-gradient(to bottom, rgba(60,25,0,0.18), rgba(60,25,0,0.74))',
    heroCardBg: 'rgba(120,53,15,0.14)', heroCardBorder: 'rgba(253,230,138,0.40)', heroCardBlur: true,
    radius: '12px', cardBg: '#241505', cardBorder: '#3d2810', cardShadow: '0 2px 8px rgba(0,0,0,0.4)',
    sectionAlt: '#150c01',
    headingFont: 'inherit',
  },
  midnight: {
    id: 'midnight', label: 'بنفسجي', labelEn: 'Midnight',
    bg: '#0d0a1e', card: '#1a1433', accent: '#8b5cf6', dark: true,
    navBg: 'rgba(13,10,30,0.97)', navBorder: '#2d2050',
    heroOverlay: 'linear-gradient(to bottom, rgba(10,5,20,0.12), rgba(10,5,20,0.80))',
    heroCardBg: 'rgba(30,20,60,0.65)', heroCardBorder: 'rgba(139,92,246,0.35)', heroCardBlur: true,
    radius: '18px', cardBg: '#1a1433', cardBorder: '#2d2050', cardShadow: '0 2px 12px rgba(139,92,246,0.12)',
    sectionAlt: '#120f28',
    headingFont: 'inherit',
  },
} as const;
export type ThemeId = keyof typeof PAGE_THEMES;

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  status: 'active' | 'suspended';
  primary_color?: string;
  theme?: string;
  business_type?: string;
  custom_domain?: string;
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
  licence_numbers?: { label: string; number: string }[];
  primary_color?: string;
  contact_email?: string;
  contact_phone?: string;
  extra_phones?: string[];
  contact_address?: string;
  social_links?: {
    instagram?: string;
    x?: string;
    linkedin?: string;
    whatsapp?: string;
    snapchat?: string;
    tiktok?: string;
  };
  working_hours?: Record<string, { enabled: boolean; open: string; close: string }> | null;
  page_sections?: {
    hero?: boolean;
    featured?: boolean;
    listings?: boolean;
    about?: boolean;
    news?: boolean;
    gallery?: boolean;
    team?: boolean;
    contact?: boolean;
    footer?: boolean;
  };
  page_config?: {
    hero_headline?: string;
    featured_count?: number;
    listings_columns?: 2 | 3 | 4;
    show_listing_filters?: boolean;
    show_listing_search?: boolean;
    hero_style?: 'centered' | 'split' | 'minimal';
    hero_cta_text?: string;
    button_shape?: 'pill' | 'soft' | 'sharp';
    seo_title?: string;
    seo_description?: string;
    announcement_text?: string;
    announcement_color?: 'accent' | 'yellow' | 'green' | 'red' | 'purple' | 'orange' | 'teal' | 'dark';
    currency?: string;
    offer_label_1?: string;
    offer_label_2?: string;
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
  location_url?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  listing_status?: ListingStatus;
  offer_type?: 'sale' | 'rent' | null;
  property_type?: string | null;
  card_style?: 'standard' | 'featured' | 'compact' | null;
  features?: string[];
  published: boolean;
  published_at?: string;
  publish_at?: string;
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

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'archived';

export type Lead = {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  listing_id?: string;
  status: LeadStatus;
  notes?: string;
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
