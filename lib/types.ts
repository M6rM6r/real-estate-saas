export const PAGE_THEMES = {
  modern: {
    id: 'modern', label: 'عصري', labelEn: 'Modern',
    bg: '#ffffff', card: '#f8fafc', accent: '#2563eb', dark: false,
    navBg: 'rgba(255,255,255,0.95)', navBorder: '#e2e8f0',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.18), rgba(0,0,0,0.72))',
    heroCardBg: 'rgba(255,255,255,0.12)', heroCardBorder: 'rgba(255,255,255,0.22)', heroCardBlur: true,
    radius: '16px', cardBg: '#ffffff', cardBorder: '#e2e8f0', cardShadow: '0 1px 4px rgba(0,0,0,0.07)',
    sectionAlt: '#f8fafc',
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
    bg: '#f0fdf4', card: '#ffffff', accent: '#16a34a', dark: false,
    navBg: 'rgba(240,253,244,0.96)', navBorder: '#bbf7d0',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,40,10,0.12), rgba(0,40,10,0.70))',
    heroCardBg: 'rgba(20,83,45,0.15)', heroCardBorder: 'rgba(187,247,208,0.35)', heroCardBlur: true,
    radius: '26px', cardBg: '#ffffff', cardBorder: '#bbf7d0', cardShadow: '0 2px 8px rgba(22,163,74,0.08)',
    sectionAlt: '#dcfce7',
    headingFont: 'inherit',
  },
  ocean: {
    id: 'ocean', label: 'بحري', labelEn: 'Ocean',
    bg: '#f0f9ff', card: '#ffffff', accent: '#0891b2', dark: false,
    navBg: 'rgba(240,249,255,0.96)', navBorder: '#bae6fd',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,20,50,0.15), rgba(0,20,50,0.75))',
    heroCardBg: 'rgba(8,145,178,0.12)', heroCardBorder: 'rgba(186,230,253,0.40)', heroCardBlur: true,
    radius: '20px', cardBg: '#ffffff', cardBorder: '#bae6fd', cardShadow: '0 2px 8px rgba(8,145,178,0.09)',
    sectionAlt: '#e0f2fe',
    headingFont: 'inherit',
  },
  desert: {
    id: 'desert', label: 'صحراوي', labelEn: 'Desert',
    bg: '#fffbeb', card: '#ffffff', accent: '#d97706', dark: false,
    navBg: 'rgba(255,251,235,0.96)', navBorder: '#fde68a',
    heroOverlay: 'linear-gradient(to bottom, rgba(60,25,0,0.18), rgba(60,25,0,0.74))',
    heroCardBg: 'rgba(120,53,15,0.14)', heroCardBorder: 'rgba(253,230,138,0.40)', heroCardBlur: true,
    radius: '12px', cardBg: '#ffffff', cardBorder: '#fde68a', cardShadow: '0 2px 8px rgba(217,119,6,0.09)',
    sectionAlt: '#fef3c7',
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
    snapchat?: string;
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
    announcement_color?: 'accent' | 'yellow' | 'green';
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
