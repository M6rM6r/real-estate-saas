export const PAGE_THEMES = {
  modern: {
    id: 'modern', label: 'Modern', labelEn: 'Modern', emoji: '✨', description: 'Clean & Professional',
    bg: '#0a0d16', card: '#121620', accent: '#6a829f', dark: true,
    navBg: 'rgba(10,13,22,0.97)', navBorder: '#1a2030',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.85))',
    heroCardBg: 'rgba(10,13,22,0.75)', heroCardBorder: 'rgba(106,130,159,0.16)', heroCardBlur: true,
    radius: '16px', cardBg: '#121620', cardBorder: '#1a2030',
    cardShadow: '0 2px 16px rgba(106,130,159,0.06), 0 1px 3px rgba(0,0,0,0.5)',
    sectionAlt: '#0e1119',
    headingFont: 'inherit', buttonShape: 'soft' as const,
  },
  luxury: {
    id: 'luxury', label: 'Luxury', labelEn: 'Luxury', emoji: '👑', description: 'Elegant & Timeless',
    bg: '#0a0905', card: '#12110d', accent: '#8a7a65', dark: true,
    navBg: 'rgba(10,9,5,0.98)', navBorder: 'rgba(138,122,101,0.15)',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.28), rgba(0,0,0,0.93))',
    heroCardBg: 'rgba(10,9,5,0.88)', heroCardBorder: 'rgba(138,122,101,0.22)', heroCardBlur: false,
    radius: '4px', cardBg: '#12110d', cardBorder: 'rgba(138,122,101,0.12)',
    cardShadow: '0 2px 12px rgba(138,122,101,0.04), 0 1px 3px rgba(0,0,0,0.6)',
    sectionAlt: '#0d0c0a',
    headingFont: "Georgia, 'Times New Roman', serif", buttonShape: 'sharp' as const,
  },
  nature: {
    id: 'nature', label: 'Nature', labelEn: 'Nature', emoji: '🌿', description: 'Organic & Calm',
    bg: '#08110d', card: '#0f1814', accent: '#78906f', dark: true,
    navBg: 'rgba(8,17,13,0.97)', navBorder: '#1a2a20',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,20,5,0.22), rgba(0,20,5,0.86))',
    heroCardBg: 'rgba(8,17,13,0.88)', heroCardBorder: 'rgba(120,144,111,0.20)', heroCardBlur: true,
    radius: '28px', cardBg: '#0f1814', cardBorder: '#1a2a20',
    cardShadow: '0 2px 16px rgba(120,144,111,0.06), 0 1px 3px rgba(0,0,0,0.5)',
    sectionAlt: '#0b1510',
    headingFont: 'inherit', buttonShape: 'pill' as const,
  },
  ocean: {
    id: 'ocean', label: 'Ocean', labelEn: 'Ocean', emoji: '🌊', description: 'Fluid & Dynamic',
    bg: '#05090f', card: '#0b141f', accent: '#6f8d98', dark: true,
    navBg: 'rgba(5,9,15,0.98)', navBorder: '#14232f',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,10,25,0.12), rgba(0,10,25,0.85))',
    heroCardBg: 'rgba(5,9,15,0.85)', heroCardBorder: 'rgba(111,141,152,0.18)', heroCardBlur: true,
    radius: '20px', cardBg: '#0b141f', cardBorder: '#14232f',
    cardShadow: '0 2px 16px rgba(111,141,152,0.06), 0 1px 3px rgba(0,0,0,0.5)',
    sectionAlt: '#081218',
    headingFont: 'inherit', buttonShape: 'soft' as const,
  },
  desert: {
    id: 'desert', label: 'Desert', labelEn: 'Desert', emoji: '🏜️', description: 'Warm & Bold',
    bg: '#120f0a', card: '#1a1410', accent: '#8f735d', dark: true,
    navBg: 'rgba(18,15,10,0.98)', navBorder: '#2a1f14',
    heroOverlay: 'linear-gradient(to bottom, rgba(40,15,0,0.15), rgba(40,15,0,0.85))',
    heroCardBg: 'rgba(18,15,10,0.82)', heroCardBorder: 'rgba(143,115,93,0.18)', heroCardBlur: true,
    radius: '10px', cardBg: '#1a1410', cardBorder: '#2a1f14',
    cardShadow: '0 2px 16px rgba(143,115,93,0.06), 0 1px 3px rgba(0,0,0,0.5)',
    sectionAlt: '#140f0a',
    headingFont: 'inherit', buttonShape: 'soft' as const,
  },
  midnight: {
    id: 'midnight', label: 'Midnight', labelEn: 'Midnight', emoji: '🌙', description: 'Bold & Mysterious',
    bg: '#0a0910', card: '#131128', accent: '#766d91', dark: true,
    navBg: 'rgba(10,9,16,0.98)', navBorder: '#1f1a35',
    heroOverlay: 'linear-gradient(to bottom, rgba(8,4,18,0.12), rgba(8,4,18,0.86))',
    heroCardBg: 'rgba(10,9,16,0.80)', heroCardBorder: 'rgba(118,109,145,0.20)', heroCardBlur: true,
    radius: '18px', cardBg: '#131128', cardBorder: '#1f1a35',
    cardShadow: '0 2px 18px rgba(118,109,145,0.08), 0 1px 3px rgba(0,0,0,0.5)',
    sectionAlt: '#0f0d1a',
    headingFont: 'inherit', buttonShape: 'soft' as const,
  },
  minimal: {
    id: 'minimal', label: 'Minimal', labelEn: 'Minimal', emoji: '◻️', description: 'Simple & Fast',
    bg: '#0d0d0d', card: '#1a1a1a', accent: '#707070', dark: true,
    navBg: 'rgba(13,13,13,0.98)', navBorder: '#2a2a2a',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.20), rgba(0,0,0,0.90))',
    heroCardBg: 'rgba(13,13,13,0.82)', heroCardBorder: 'rgba(112,112,112,0.15)', heroCardBlur: true,
    radius: '8px', cardBg: '#1a1a1a', cardBorder: '#2a2a2a',
    cardShadow: '0 1px 8px rgba(112,112,112,0.05), 0 1px 2px rgba(0,0,0,0.5)',
    sectionAlt: '#161616',
    headingFont: 'system-ui, sans-serif', buttonShape: 'sharp' as const,
  },
  vintage: {
    id: 'vintage', label: 'Vintage', labelEn: 'Vintage', emoji: '📼', description: 'Retro & Nostalgic',
    bg: '#1a1815', card: '#28211c', accent: '#ac8d75', dark: true,
    navBg: 'rgba(26,24,21,0.98)', navBorder: '#3d3530',
    heroOverlay: 'linear-gradient(to bottom, rgba(50,30,10,0.20), rgba(50,30,10,0.88))',
    heroCardBg: 'rgba(26,24,21,0.85)', heroCardBorder: 'rgba(172,141,117,0.22)', heroCardBlur: true,
    radius: '12px', cardBg: '#28211c', cardBorder: '#3d3530',
    cardShadow: '0 2px 14px rgba(172,141,117,0.06), 0 1px 3px rgba(0,0,0,0.5)',
    sectionAlt: '#1e1a16',
    headingFont: "'Courier New', monospace", buttonShape: 'soft' as const,
  },
  neon: {
    id: 'neon', label: 'Neon', labelEn: 'Neon', emoji: '⚡', description: 'Electric & Vibrant',
    bg: '#0a0a0f', card: '#12121a', accent: '#67c4a2', dark: true,
    navBg: 'rgba(10,10,15,0.98)', navBorder: '#1a1a28',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,50,30,0.15), rgba(0,50,30,0.85))',
    heroCardBg: 'rgba(10,10,15,0.80)', heroCardBorder: 'rgba(103,196,162,0.22)', heroCardBlur: true,
    radius: '14px', cardBg: '#12121a', cardBorder: '#1a1a28',
    cardShadow: '0 2px 20px rgba(103,196,162,0.08), 0 1px 3px rgba(0,0,0,0.5)',
    sectionAlt: '#0f0f16',
    headingFont: 'inherit', buttonShape: 'pill' as const,
  },
  cosmic: {
    id: 'cosmic', label: 'Cosmic', labelEn: 'Cosmic', emoji: '🌌', description: 'Futuristic & Dreamy',
    bg: '#0d0615', card: '#150f22', accent: '#9c7cc4', dark: true,
    navBg: 'rgba(13,6,21,0.98)', navBorder: '#241a3a',
    heroOverlay: 'linear-gradient(135deg, rgba(50,0,100,0.15), rgba(0,0,50,0.85))',
    heroCardBg: 'rgba(13,6,21,0.82)', heroCardBorder: 'rgba(156,124,196,0.22)', heroCardBlur: true,
    radius: '22px', cardBg: '#150f22', cardBorder: '#241a3a',
    cardShadow: '0 3px 18px rgba(156,124,196,0.08), 0 1px 3px rgba(0,0,0,0.5)',
    sectionAlt: '#12091d',
    headingFont: 'inherit', buttonShape: 'soft' as const,
  },
} as const;
export type ThemeId = keyof typeof PAGE_THEMES;

export type TenantBillingStatus = 'unpaid' | 'pending' | 'paid' | 'failed'
export type TenantSubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled'

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  status: 'active' | 'suspended';
  paid?: boolean;
  primary_color?: string;
  theme?: string;
  business_type?: string;
  custom_domain?: string;
  billing_status?: TenantBillingStatus;
  billing_provider?: 'paytabs' | string;
  billing_payment_ref?: string;
  billing_activation_source?: string;
  billing_last_paid_at?: string;
  billing_last_attempt_at?: string;
  billing_attempt_id?: string;
  billing_plan?: 'starter' | string;
  subscription_status?: TenantSubscriptionStatus;
  trial_started_at?: string;
  trial_expires_at?: string;
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
    headingFont?: string;
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
  billing: {
    paid: number;
    pending: number;
    failed: number;
    unpaid: number;
  };
  funnel: {
    signupCompleted30d: number;
    signupFailed30d: number;
    profileUpdated30d: number;
    firstListingCreated30d: number;
    paymentSessionStarted30d: number;
    paymentSucceeded30d: number;
    paymentFailed30d: number;
    signupToPaymentConversionPct30d: number;
  };
  agenciesPerMonth: { month: string; count: number }[];
  topAgencies: { name: string; slug: string; postCount: number }[];
  allAgencies: {
    id: string;
    name: string;
    slug: string;
    status: 'active' | 'suspended';
    postCount: number;
    listingCount: number;
    leadCount: number;
    agentCount: number;
    healthScore: number;
    primaryColor?: string;
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
