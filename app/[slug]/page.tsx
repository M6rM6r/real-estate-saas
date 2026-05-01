import { adminDb } from '@/lib/firebase-admin'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import PublicAgencyPage from '@/components/PublicAgencyPage'
import PageViewTracker from '@/components/PageViewTracker'

const DEMO_SLUG = 'luxury-homes-dubai'

export const revalidate = 60

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
  if (slug === DEMO_SLUG) {
    return { title: 'Luxury Homes Dubai — عقارات', description: 'Premium luxury real estate in Dubai' }
  }
  const tenantsSnap = await adminDb.collection('tenants').where('slug', '==', slug).where('status', '==', 'active').limit(1).get()
  if (tenantsSnap.empty) return { title: 'Not Found' }
  const tenant = { id: tenantsSnap.docs[0].id, ...tenantsSnap.docs[0].data() } as { id: string; name: string; slug: string }
  const profileDoc = await adminDb
    .collection('tenants')
    .doc(tenant.id)
    .collection('profiles')
    .doc(tenant.id)
    .get()
  const fallbackProfilesSnap = profileDoc.exists
    ? null
    : await adminDb.collection('profiles').where('tenantId', '==', tenant.id).limit(1).get()
  const profile = profileDoc.exists
    ? profileDoc.data()
    : fallbackProfilesSnap?.empty
      ? null
      : fallbackProfilesSnap?.docs[0].data()

  const seoTitle = (profile?.page_config as any)?.seo_title || `${tenant.name} — عقارات`
  const seoDesc = ((profile?.page_config as any)?.seo_description || (profile?.bio as string)) ?? 'خدمات عقارية متميزة'

  return {
    title: seoTitle,
    description: seoDesc,
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      images: profile?.cover_url ? [profile.cover_url as string] : [],
    },
  }
}

// ── Demo data shown when the slug has no Firestore tenant ────────────────────

const DEMO_DATA = {
  tenant: {
    id: 'demo',
    name: 'Luxury Homes Dubai',
    slug: DEMO_SLUG,
    primary_color: '#8b5cf6',
    status: 'active',
    theme: 'midnight',
  },
  profile: {
    bio: 'Luxury Homes Dubai is an award-winning agency specialising in premium residential and commercial properties across Dubai.',
    tagline: 'اعثر على منزل أحلامك في دبي',
    logo_url: '',
    cover_url: 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=1600',
    contact_email: 'hello@luxuryhomesdubai.ae',
    contact_phone: '+971500000000',
    extra_phones: ['+966559707955'],
    contact_address: 'Dubai Marina, Dubai, UAE',
    social_links: {
      instagram: 'luxuryhomesdubai',
      whatsapp: '971500000000',
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
      hero_headline: 'اعثر على منزل أحلامك في دبي',
      hero_style: 'centered',
      hero_cta_text: 'تصفح العقارات',
      show_listing_filters: true,
      show_listing_search: true,
      listings_columns: 3,
      currency: 'AED',
    },
  },
  listings: [
    { id: 'l1', title: 'بنتهاوس مارينا', body: 'إطلالات بانورامية على المرسى من كل غرفة. تراس خاص على السطح مع مسبح لا نهاية له.', price: 12500000, location: 'Dubai Marina', bedrooms: 4, bathrooms: 4, area_sqm: 390, listing_status: 'available', offer_type: 'sale', property_type: 'penthouse', images: ['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: new Date().toISOString() },
    { id: 'l2', title: 'فيلا نخلة جميرا', body: 'فيلا على الشاطئ في جزيرة النخلة الشهيرة مع شاطئ خاص ومسبح ووصول مباشر للبحر.', price: 28000000, location: 'Palm Jumeirah', bedrooms: 6, bathrooms: 7, area_sqm: 790, listing_status: 'available', offer_type: 'sale', property_type: 'villa', images: ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: new Date().toISOString() },
    { id: 'l3', title: 'جناح وسط المدينة', body: 'إطلالات بانورامية على برج خليفة والنافورة. تشطيبات فاخرة ونظام منزل ذكي.', price: 5800000, location: 'Downtown Dubai', bedrooms: 2, bathrooms: 2, area_sqm: 167, listing_status: 'available', offer_type: 'sale', property_type: 'apartment', images: ['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: new Date().toISOString() },
    { id: 'l4', title: 'شقة بزنس باي', body: 'معيشة عصرية في قلب الحي التجاري. إطلالات على القناة، صالة رياضية وخدمة كونسيرج.', price: 3200000, location: 'Business Bay', bedrooms: 3, bathrooms: 3, area_sqm: 195, listing_status: 'sold', offer_type: 'sale', property_type: 'apartment', images: ['https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: new Date().toISOString() },
    { id: 'l5', title: 'دوبلكس جي بي آر', body: 'على بُعد خطوات من الشاطئ، يجمع هذا الدوبلكس بين الفخامة الداخلية والمعيشة في الهواء الطلق.', price: 9100000, location: 'Jumeirah Beach Residence', bedrooms: 3, bathrooms: 3, area_sqm: 279, listing_status: 'available', offer_type: 'rent', property_type: 'duplex', images: ['https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: new Date().toISOString() },
    { id: 'l6', title: 'قصر إمارات هيلز', body: 'قصر فاخر في أرقى عنوان في دبي. إطلالات على ملعب الغولف، غرفة سينما ومرافق للموظفين.', price: 45000000, location: 'Emirates Hills', bedrooms: 8, bathrooms: 9, area_sqm: 1300, listing_status: 'available', offer_type: 'sale', property_type: 'mansion', images: ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: new Date().toISOString() },
  ],
  news: [
    { id: 'n1', title: 'سوق العقارات في دبي يسجل أرقاماً قياسية في الربع الأول 2026', body: 'ارتفعت أحجام المعاملات بنسبة 34% على أساس سنوي مع تدفق استثمارات المستثمرين الدوليين إلى مناطق دبي مارينا وداون تاون والنخلة.', image_url: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600', images: [], published: true, created_at: new Date().toISOString(), price: null, location: null, bedrooms: null, bathrooms: null, area_sqm: null, listing_status: null },
    { id: 'n2', title: 'قواعد التأشيرة الذهبية الجديدة تعزز الطلب على العقارات الفاخرة', body: 'يُحفز برنامج التأشيرة لمدة 10 سنوات لملاك العقارات بقيمة 2 مليون درهم+ موجةً من الاستثمارات الأجنبية طويلة الأجل في الإمارات.', image_url: 'https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=600', images: [], published: true, created_at: new Date().toISOString(), price: null, location: null, bedrooms: null, bathrooms: null, area_sqm: null, listing_status: null },
    { id: 'n3', title: 'Luxury Homes Dubai تفوز بجائزة أفضل وكالة 2025', body: 'نفخر بحصولنا على لقب أفضل وكالة عقارات سكنية فاخرة في دبي للعام الثاني على التوالي في حفل جوائز الخليج للعقارات.', image_url: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=600', images: [], published: true, created_at: new Date().toISOString(), price: null, location: null, bedrooms: null, bathrooms: null, area_sqm: null, listing_status: null },
  ],
  gallery: [
    { id: 'g1', url: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'Marina Penthouse Living Room', sort_order: 0 },
    { id: 'g2', url: 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'Palm Jumeirah Aerial View', sort_order: 1 },
    { id: 'g3', url: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'Beachfront Villa Exterior', sort_order: 2 },
    { id: 'g4', url: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'Downtown Skyline at Night', sort_order: 3 },
    { id: 'g5', url: 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'JBR Beachfront Terrace', sort_order: 4 },
    { id: 'g6', url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'Emirates Hills Mansion Pool', sort_order: 5 },
  ],
  team: [
    { id: 't1', email: 'sarah@luxuryhomesdubai.ae', role: 'agent', display_name: 'Sarah Al-Mansouri', photo_url: '', phone: '+971500000001' },
    { id: 't2', email: 'james@luxuryhomesdubai.ae', role: 'agent', display_name: 'James Porter', photo_url: '', phone: '+971500000002' },
  ],
}

export default async function AgencyPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  // Serve static demo page for the demo slug (no Firestore needed)
  if (slug === DEMO_SLUG) {
    return (
      <PublicAgencyPage
        tenant={DEMO_DATA.tenant as any}
        profile={DEMO_DATA.profile as any}
        listings={DEMO_DATA.listings as any}
        news={DEMO_DATA.news as any}
        gallery={DEMO_DATA.gallery as any}
        team={DEMO_DATA.team as any}
      />
    )
  }

  const tenantsSnap = await adminDb.collection('tenants').where('slug', '==', slug).where('status', '==', 'active').limit(1).get()
  if (tenantsSnap.empty) notFound()

  const tenantDoc = tenantsSnap.docs[0]
  const tenant = serialize({ id: tenantDoc.id, ...tenantDoc.data() }) as { id: string; name: string; slug: string; primary_color: string; [key: string]: unknown }
  const tenantId = tenantDoc.id

  const [profileDoc, fallbackProfilesSnap, listingsSnap, newsSnap, gallerySnap, usersSnap] = await Promise.all([
    adminDb.collection('tenants').doc(tenantId).collection('profiles').doc(tenantId).get(),
    adminDb.collection('profiles').where('tenantId', '==', tenantId).limit(1).get(),
    adminDb.collection('posts').where('tenantId', '==', tenantId).where('type', '==', 'listing').where('published', '==', true).limit(50).get(),
    adminDb.collection('posts').where('tenantId', '==', tenantId).where('type', '==', 'news').where('published', '==', true).limit(20).get(),
    adminDb.collection('media').where('tenantId', '==', tenantId).limit(12).get(),
    adminDb.collection('users').where('tenantId', '==', tenantId).get(),
  ])

  const sortByDate = (docs: any[]) =>
    [...docs].sort((a, b) => (b.data().createdAt?.toMillis?.() ?? 0) - (a.data().createdAt?.toMillis?.() ?? 0))

  const toDoc = (d: any) => serialize({ id: d.id, ...d.data() })

  const listingsData = sortByDate(listingsSnap.docs).slice(0, 9).map(toDoc)
  const profileData = profileDoc.exists
    ? serialize(profileDoc.data())
    : fallbackProfilesSnap.empty
      ? null
      : serialize(fallbackProfilesSnap.docs[0].data())

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: tenant.name,
    description: profileData?.bio ?? 'Professional real estate services',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.rewrew7.web.app'}/${slug}`,
    ...(profileData?.logo_url ? { logo: profileData.logo_url } : {}),
    ...(profileData?.contact_phone ? { telephone: profileData.contact_phone } : {}),
    ...(profileData?.contact_address ? { address: { '@type': 'PostalAddress', streetAddress: profileData.contact_address } } : {}),
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
        gallery={gallerySnap.docs.sort((a, b) => (a.data().sort_order ?? 0) - (b.data().sort_order ?? 0)).map(toDoc)}
        team={usersSnap.docs.map(toDoc)}
      />
    </>
  )
}
