import { adminDb } from '@/lib/firebase-admin'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Script from 'next/script'
import PublicAgencyPage from '@/components/PublicAgencyPage'
import PageViewTracker from '@/components/PageViewTracker'
import {
  buildPublishedTenantJsonLd,
  buildPublishedTenantMetadata,
  buildPublishedTenantPageUrl,
} from '@/lib/public-page-metadata'
import { findActiveTenantByHost } from '@/lib/tenant-domain'
import { getRequestHost } from '@/lib/login-branding'
import { isFeatureEnabled } from '@/lib/feature-flags'

const DEMO_SLUG = 'demo'
const SAUDI_CAR_DEMO_SLUG = 'saudi-cars-demo'
const LEGACY_DEMO_SLUG = 'luxury-homes-dubai'

export const dynamic = 'force-dynamic'

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 800): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === attempts - 1) throw err
      await new Promise(r => setTimeout(r, delayMs))
    }
  }
  throw new Error('unreachable')
}

const serialize = (obj: any): any => {
  if (obj === null || obj === undefined) return obj
  if (typeof obj?.toDate === 'function') return obj.toDate().toISOString()
  if (Array.isArray(obj)) return obj.map(serialize)
  if (typeof obj === 'object' && obj.constructor !== Object) return JSON.parse(JSON.stringify(obj))
  if (typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, serialize(v)]))
  }
  return obj
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params
  try {
  const headersList = await headers()
  const host = getRequestHost(headersList)

  let tenantSlug = slug
  let isCustomDomain = false

  // Check if the host matches a custom domain
  try {
    const tenantMatch = await findActiveTenantByHost(host)
    if (tenantMatch?.slug) {
      tenantSlug = tenantMatch.slug
      isCustomDomain = true
    }
  } catch (error) {
    // If custom domain lookup fails, continue with original slug
    console.error('Custom domain lookup failed:', error)
  }

  const tenantsSnap = await withRetry(() =>
    adminDb.collection('tenants').where('slug', '==', tenantSlug).where('status', '==', 'active').limit(1).get()
  , 3, 600)
  if (tenantsSnap.empty) {
    if (tenantSlug === DEMO_SLUG || tenantSlug === SAUDI_CAR_DEMO_SLUG || tenantSlug === LEGACY_DEMO_SLUG) {
      return { title: 'مجموعة صالح للسيارات — ديمو', description: 'ديمو صفحة معرض سيارات محلي في السعودية باستخدام أدوات بناء الصفحات.' }
    }
    return { title: 'Not Found' }
  }
  const tenant = { id: tenantsSnap.docs[0].id, ...tenantsSnap.docs[0].data() } as { id: string; name: string; slug: string }
  let profileData: any = null
  try {
    const profileDoc = await adminDb.collection('tenants').doc(tenant.id).collection('profiles').doc(tenant.id).get()
    if (profileDoc.exists) {
      profileData = profileDoc.data()
    } else {
      const fallback = await adminDb.collection('profiles').where('tenantId', '==', tenant.id).limit(1).get()
      if (!fallback.empty) profileData = fallback.docs[0].data()
    }
  } catch { /* metadata is best-effort */ }
  return buildPublishedTenantMetadata({
    tenant: { ...tenant, slug: tenantSlug },
    profile: profileData,
    host,
    isCustomDomain,
  })
  } catch {
    return { title: slug }
  }
}

// ── Demo data shown when the slug has no Firestore tenant ────────────────────

const DEMO_DATA = {
  tenant: {
    id: 'demo',
    name: 'مجموعة صالح للسيارات',
    slug: DEMO_SLUG,
    primary_color: '#0f766e',
    status: 'active',
    theme: 'modern',
    business_type: 'retail',
  },
  profile: {
    bio: 'معرض سيارات محلي في المنطقة الشرقية، نوفر سيارات جديدة ومستعملة مفحوصة مع تمويل مرن وخدمة ما بعد البيع.',
    tagline: 'سيارتك القادمة تبدأ من هنا',
    logo_url: '',
    cover_url: 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=1600',
    contact_email: 'sales@salih-cars.sa',
    contact_phone: '+966138888001',
    extra_phones: ['+966559707955'],
    contact_address: 'الدمام - طريق الملك فهد - المنطقة الشرقية',
    social_links: {
      instagram: 'salihcars',
      whatsapp: '966559707955',
      linkedin: '',
      x: '',
      snapchat: '',
      tiktok: '',
    },
    working_hours: {
      sun: { enabled: true,  open: '09:00', close: '18:00' },
      mon: { enabled: true,  open: '09:00', close: '18:00' },
      tue: { enabled: true,  open: '09:00', close: '18:00' },
      wed: { enabled: true,  open: '09:00', close: '18:00' },
      thu: { enabled: true,  open: '09:00', close: '18:00' },
      fri: { enabled: false, open: '09:00', close: '13:00' },
      sat: { enabled: false, open: '09:00', close: '13:00' },
    },
    page_sections: {
      hero: true,
      listings: true,
      about: true,
      news: true,
      contact: true,
      working_hours: true,
      footer: true,
    },
    page_config: {
      hero_headline: 'عروض يومية على السيارات الجديدة والمستعملة مع إمكانية الحجز الفوري.',
      hero_style: 'centered',
      hero_cta_text: 'احجز تجربة قيادة',
      show_listing_filters: false,
      show_listing_search: true,
      show_listing_sort: false,
      listings_columns: 3,
      currency: 'SAR',
      page_lang: 'ar',
      announcement_text: '🚗 عرض الأسبوع: ضمان سنة كاملة + فحص شامل مجاني',
      announcement_color: 'teal',
    },
  },
  listings: [
    { id: 'l1', title: 'تويوتا كامري 2024 GLX', body: 'وكالة - عداد 0 كم - ضمان الوكيل - متوفر بعدة ألوان.', price: 118900, location: 'الدمام', bedrooms: null, bathrooms: null, area_sqm: null, listing_status: 'available', offer_type: 'sale', property_type: 'سيدان', images: ['https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: '2026-04-15T10:00:00Z' },
    { id: 'l2', title: 'هيونداي سوناتا 2023 سمارت', body: 'مستعملة نظيفة - فحص شامل - إمكانية التمويل حتى 60 شهر.', price: 89500, location: 'الخبر', bedrooms: null, bathrooms: null, area_sqm: null, listing_status: 'available', offer_type: 'sale', property_type: 'سيدان', images: ['https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: '2026-04-12T10:00:00Z' },
    { id: 'l3', title: 'فورد إكسبلورر 2022 XLT', body: 'عائلية 7 مقاعد - تاريخ صيانة واضح - بحالة ممتازة.', price: 132000, location: 'الدمام', bedrooms: null, bathrooms: null, area_sqm: null, listing_status: 'available', offer_type: 'sale', property_type: 'SUV', images: ['https://images.pexels.com/photos/193991/pexels-photo-193991.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: '2026-04-10T10:00:00Z' },
    { id: 'l4', title: 'كيا K5 2024 نص فل', body: 'جديدة بالكامل - شاشة ملاحة - كاميرا 360 - حساسات أمامية وخلفية.', price: 102300, location: 'القطيف', bedrooms: null, bathrooms: null, area_sqm: null, listing_status: 'available', offer_type: 'sale', property_type: 'سيدان', images: ['https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: '2026-04-09T10:00:00Z' },
    { id: 'l5', title: 'تويوتا لاندكروزر 2021 GXR', body: 'مفحوصة - بدون حوادث جسيمة - جاهزة للنقل الفوري.', price: 215000, location: 'الأحساء', bedrooms: null, bathrooms: null, area_sqm: null, listing_status: 'sold', offer_type: 'sale', property_type: 'SUV', images: ['https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: '2026-04-07T10:00:00Z' },
    { id: 'l6', title: 'شفروليه تاهو 2020 LT', body: 'صيانة دورية منتظمة - مناسبة للرحلات والعائلة - تمويل متاح.', price: 164000, location: 'الجبيل', bedrooms: null, bathrooms: null, area_sqm: null, listing_status: 'available', offer_type: 'sale', property_type: 'SUV', images: ['https://images.pexels.com/photos/248687/pexels-photo-248687.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: '2026-04-05T10:00:00Z' },
  ],
  news: [
    { id: 'n1', title: 'عروض تمويل خاصة حتى نهاية الشهر', body: 'احصل على موافقة مبدئية خلال دقائق بالتعاون مع بنوك محلية مختارة.', image_url: 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=600', images: [], published: true, created_at: '2026-04-01T10:00:00Z', price: null, location: null, bedrooms: null, bathrooms: null, area_sqm: null, listing_status: null },
    { id: 'n2', title: 'استلام فوري لسيارات مختارة', body: 'عدد محدود من موديلات 2024 متوفر للتسليم الفوري داخل المنطقة الشرقية.', image_url: 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=600', images: [], published: true, created_at: '2026-03-20T10:00:00Z', price: null, location: null, bedrooms: null, bathrooms: null, area_sqm: null, listing_status: null },
    { id: 'n3', title: 'خدمة فحص مجانية قبل الشراء', body: 'فحص شامل للسيارة مع تقرير واضح لبناء الثقة قبل إتمام الصفقة.', image_url: 'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=600', images: [], published: true, created_at: '2026-03-10T10:00:00Z', price: null, location: null, bedrooms: null, bathrooms: null, area_sqm: null, listing_status: null },
  ],
  gallery: [
    { id: 'g1', url: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'صالة العرض', sort_order: 0 },
    { id: 'g2', url: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'سيارات سيدان', sort_order: 1 },
    { id: 'g3', url: 'https://images.pexels.com/photos/193991/pexels-photo-193991.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'قسم SUV', sort_order: 2 },
    { id: 'g4', url: 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'موديلات جديدة', sort_order: 3 },
    { id: 'g5', url: 'https://images.pexels.com/photos/248687/pexels-photo-248687.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'قسم الفحص', sort_order: 4 },
    { id: 'g6', url: 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'واجهة المعرض', sort_order: 5 },
  ],
  team: [
    { id: 't1', email: 'faisal@salih-cars.sa', role: 'agent', display_name: 'فيصل العتيبي', photo_url: '', phone: '+966555111101' },
    { id: 't2', email: 'noura@salih-cars.sa', role: 'agent', display_name: 'نورة القحطاني', photo_url: '', phone: '+966555111102' },
  ],
}

export default async function AgencyPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const headersList = await headers()
  const host = getRequestHost(headersList)

  if (slug === LEGACY_DEMO_SLUG) {
    redirect(`/${SAUDI_CAR_DEMO_SLUG}`)
  }

  let tenantSlug = slug

  // Check if the host matches a custom domain
  try {
    const tenantMatch = await findActiveTenantByHost(host)
    if (tenantMatch?.slug) {
      tenantSlug = tenantMatch.slug
    }
  } catch (error) {
    // If custom domain lookup fails, continue with original slug
    console.error('Custom domain lookup failed:', error)
  }

  let tenantsSnap: any
  try {
    tenantsSnap = await withRetry(() =>
      adminDb.collection('tenants').where('slug', '==', tenantSlug).where('status', '==', 'active').limit(1).get()
    , 3, 600)
  } catch {
    tenantsSnap = { empty: true, docs: [] }
  }
  if (tenantsSnap.empty) {
    // Fallback static demo page only when there is no matching tenant.
    if (tenantSlug === DEMO_SLUG || tenantSlug === SAUDI_CAR_DEMO_SLUG) {
      return (
        <PublicAgencyPage
          tenant={{ ...DEMO_DATA.tenant, slug: tenantSlug } as any}
          profile={DEMO_DATA.profile as any}
          listings={DEMO_DATA.listings as any}
          news={DEMO_DATA.news as any}
          gallery={DEMO_DATA.gallery as any}
          team={DEMO_DATA.team as any}
        />
      )
    }
    notFound()
  }

  const tenantDoc = tenantsSnap.docs[0]
  const tenant = serialize({ id: tenantDoc.id, ...tenantDoc.data() }) as { id: string; name: string; slug: string; primary_color: string; [key: string]: unknown }
  if (isFeatureEnabled('PAYMENT_URL_LOCK')) {
    const isTenantPaid = tenant.paid === true || String(tenant.billing_status ?? '').toLowerCase() === 'paid'
    if (!isTenantPaid) {
      notFound()
    }
  }
  const tenantId = tenantDoc.id

  const safe = <T,>(p: Promise<T>, fallback: T): Promise<T> => p.catch(() => fallback)
  const emptySnap = { docs: [], empty: true } as any

  const [profileDoc, fallbackProfilesSnap, listingsSnap, newsSnap, gallerySnap, usersSnap] = await Promise.all([
    safe(withRetry(() => adminDb.collection('tenants').doc(tenantId).collection('profiles').doc(tenantId).get(), 3, 600), { exists: false } as any),
    safe(withRetry(() => adminDb.collection('profiles').where('tenantId', '==', tenantId).limit(1).get(), 3, 600), emptySnap),
    safe(withRetry(() => adminDb.collection('posts').where('tenantId', '==', tenantId).where('type', '==', 'listing').where('published', '==', true).limit(50).get(), 3, 600), emptySnap),
    safe(withRetry(() => adminDb.collection('posts').where('tenantId', '==', tenantId).where('type', '==', 'news').where('published', '==', true).limit(20).get(), 3, 600), emptySnap),
    safe(withRetry(() => adminDb.collection('media').where('tenantId', '==', tenantId).limit(12).get(), 3, 600), emptySnap),
    safe(withRetry(() => adminDb.collection('users').where('tenantId', '==', tenantId).get(), 3, 600), emptySnap),
  ])

  const sortByDate = (docs: any[]) =>
    [...docs].sort((a, b) => (b.data().createdAt?.toMillis?.() ?? 0) - (a.data().createdAt?.toMillis?.() ?? 0))

  const safeDecodeUrl = (value: unknown) => {
    if (typeof value !== 'string' || !value.includes('%')) return value
    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  }

  const deepDecodeUrls = (value: any): any => {
    if (Array.isArray(value)) return value.map(deepDecodeUrls)
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepDecodeUrls(v)]))
    }
    return safeDecodeUrl(value)
  }

  const toDoc = (d: any) => deepDecodeUrls(serialize({ id: d.id, ...d.data() }))

  const listingsData = sortByDate(listingsSnap.docs).slice(0, 9).map(toDoc)
  const rawProfileData = profileDoc.exists
    ? serialize(profileDoc.data())
    : fallbackProfilesSnap.empty
      ? null
      : serialize(fallbackProfilesSnap.docs[0].data())

  const profileData = rawProfileData ? deepDecodeUrls(rawProfileData) : null
  const canonicalUrl = buildPublishedTenantPageUrl({
    host,
    slug: tenantSlug,
    isCustomDomain: tenantSlug !== slug,
  })

  const jsonLd = {
    ...buildPublishedTenantJsonLd({
      tenant: { ...tenant, slug: tenantSlug },
      profile: profileData,
      host,
      isCustomDomain: tenantSlug !== slug,
    }),
    ...(profileData?.logo_url ? { logo: profileData.logo_url } : {}),
    ...(profileData?.contact_phone ? { telephone: profileData.contact_phone } : {}),
    ...(profileData?.contact_address ? { address: { '@type': 'PostalAddress', streetAddress: profileData.contact_address } } : {}),
    url: canonicalUrl,
  }

  return (
    <>
      <Script
        id="json-ld-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageViewTracker slug={slug} tenantId={tenantId} />
      <PublicAgencyPage
        tenant={tenant}
        profile={profileData}
        listings={listingsData}
        news={sortByDate(newsSnap.docs).slice(0, 6).map(toDoc)}
        gallery={gallerySnap.docs.sort((a: any, b: any) => (a.data().sort_order ?? 0) - (b.data().sort_order ?? 0)).map(toDoc)}
        team={usersSnap.docs.map(toDoc)}
      />
    </>
  )
}
