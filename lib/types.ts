export const PAGE_THEMES = {
  modern: {
    id: 'modern', label: '1', labelEn: '1',
    bg: '#0b0f1a', card: '#141826', accent: '#2563eb', dark: true,
    navBg: 'rgba(11,15,26,0.97)', navBorder: '#1e2436',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.12), rgba(0,0,0,0.82))',
    heroCardBg: 'rgba(11,15,26,0.72)', heroCardBorder: 'rgba(37,99,235,0.28)', heroCardBlur: true,
    radius: '16px', cardBg: '#141826', cardBorder: '#1e2436',
    cardShadow: '0 2px 16px rgba(37,99,235,0.12), 0 1px 3px rgba(0,0,0,0.5)',
    sectionAlt: '#0f1320',
    headingFont: 'inherit',
  },
  luxury: {
    id: 'luxury', label: '2', labelEn: '2',
    bg: '#080808', card: '#111110', accent: '#c9a84c', dark: true,
    navBg: 'rgba(6,6,6,0.98)', navBorder: 'rgba(201,168,76,0.22)',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.92))',
    heroCardBg: 'rgba(8,7,4,0.85)', heroCardBorder: 'rgba(201,168,76,0.40)', heroCardBlur: false,
    radius: '4px', cardBg: '#111110', cardBorder: 'rgba(201,168,76,0.18)',
    cardShadow: '0 2px 12px rgba(201,168,76,0.08), 0 1px 3px rgba(0,0,0,0.6)',
    sectionAlt: '#0d0d0c',
    headingFont: "Georgia, 'Times New Roman', serif",
  },
  nature: {
    id: 'nature', label: '3', labelEn: '3',
    bg: '#081510', card: '#0f2017', accent: '#16a34a', dark: true,
    navBg: 'rgba(8,21,16,0.97)', navBorder: '#1e4028',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,30,8,0.20), rgba(0,30,8,0.84))',
    heroCardBg: 'rgba(8,21,16,0.86)', heroCardBorder: 'rgba(22,163,74,0.36)', heroCardBlur: true,
    radius: '28px', cardBg: '#0f2017', cardBorder: '#1e4028',
    cardShadow: '0 2px 16px rgba(22,163,74,0.12), 0 1px 3px rgba(0,0,0,0.5)',
    sectionAlt: '#0b1c12',
    headingFont: 'inherit',
  },
  ocean: {
    id: 'ocean', label: '4', labelEn: '4',
    bg: '#040c1c', card: '#0a1628', accent: '#0891b2', dark: true,
    navBg: 'rgba(4,12,28,0.98)', navBorder: '#112444',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,14,40,0.10), rgba(0,14,40,0.82))',
    heroCardBg: 'rgba(8,145,178,0.10)', heroCardBorder: 'rgba(103,232,249,0.35)', heroCardBlur: true,
    radius: '20px', cardBg: '#0a1628', cardBorder: '#112444',
    cardShadow: '0 2px 16px rgba(8,145,178,0.12), 0 1px 3px rgba(0,0,0,0.5)',
    sectionAlt: '#071120',
    headingFont: 'inherit',
  },
  desert: {
    id: 'desert', label: '5', labelEn: '5',
    bg: '#160d02', card: '#201000', accent: '#d97706', dark: true,
    navBg: 'rgba(22,13,2,0.98)', navBorder: '#3a2208',
    heroOverlay: 'linear-gradient(to bottom, rgba(50,18,0,0.12), rgba(50,18,0,0.82))',
    heroCardBg: 'rgba(110,45,8,0.18)', heroCardBorder: 'rgba(251,191,36,0.38)', heroCardBlur: true,
    radius: '10px', cardBg: '#201000', cardBorder: '#3a2208',
    cardShadow: '0 2px 16px rgba(217,119,6,0.12), 0 1px 3px rgba(0,0,0,0.5)',
    sectionAlt: '#130a00',
    headingFont: 'inherit',
  },
  midnight: {
    id: 'midnight', label: '6', labelEn: '6',
    bg: '#090614', card: '#130e28', accent: '#8b5cf6', dark: true,
    navBg: 'rgba(9,6,20,0.98)', navBorder: '#261a48',
    heroOverlay: 'linear-gradient(to bottom, rgba(8,4,18,0.08), rgba(8,4,18,0.84))',
    heroCardBg: 'rgba(28,16,58,0.72)', heroCardBorder: 'rgba(139,92,246,0.42)', heroCardBlur: true,
    radius: '18px', cardBg: '#130e28', cardBorder: '#261a48',
    cardShadow: '0 4px 22px rgba(139,92,246,0.16), 0 1px 3px rgba(0,0,0,0.5)',
    sectionAlt: '#0f0b22',
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
    telegram?: string;
    discord?: string;
  };
  working_hours?: Record<string, { enabled: boolean; open: string; close: string }> | null;
  page_sections?: {
    hero?: boolean;
    listings?: boolean;
    about?: boolean;
    news?: boolean;
    contact?: boolean;
    working_hours?: boolean;
    footer?: boolean;
    order?: Array<'hero' | 'listings' | 'about' | 'news' | 'contact' | 'working_hours' | 'footer'>;
  };
  page_config?: {
    hero_headline?: string;
    featured_count?: number;
    listings_columns?: 2 | 3 | 4;
    show_listing_filters?: boolean;
    show_listing_search?: boolean;
    show_listing_sort?: boolean;
    filter_label_all?: string;
    filter_label_all_types?: string;
    filter_label_all_status?: string;
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
    page_lang?: 'ar' | 'en';
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
  currency?: string;
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
  notes?: string;
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
