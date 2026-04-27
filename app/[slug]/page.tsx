import { adminDb } from '@/lib/firebase-admin'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import PublicAgencyPage from '@/components/PublicAgencyPage'
import PageViewTracker from '@/components/PageViewTracker'

export const revalidate = 60

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
const DEMO_SLUG = 'luxury-homes-dubai'

const DEMO_DATA = {
  tenant: {
    id: 'demo',
    name: 'Luxury Homes Dubai',
    slug: DEMO_SLUG,
    primary_color: '#1d4ed8',
    status: 'active',
    page_sections: { listings: true, news: true, gallery: true, team: true, contact: true },
    page_config: { theme: 'modern', hero_title: 'Find Your Dream Home in Dubai', hero_subtitle: 'Premium real estate curated for discerning buyers and investors.' },
  },
  profile: {
    bio: 'Luxury Homes Dubai is an award-winning agency specialising in premium residential and commercial properties across Dubai.',
    logo_url: '',
    cover_url: 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=1600',
    contact_email: 'hello@luxuryhomesdubai.ae',
    contact_phone: '+971 4 000 0000',
    contact_address: 'Dubai Marina, Dubai, UAE',
    social_instagram: 'luxuryhomesdubai',
    social_linkedin: '',
  },
  listings: [
    { id: 'l1', title: 'Marina Penthouse', price: '12,500,000', currency: 'AED', bedrooms: 4, bathrooms: 4, area: 4200, area_unit: 'sqft', type: 'Penthouse', location: 'Dubai Marina', description: 'Breathtaking full-marina views from every room. Private rooftop terrace with infinity pool.', images: ['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, createdAt: new Date().toISOString() },
    { id: 'l2', title: 'Palm Jumeirah Villa', price: '28,000,000', currency: 'AED', bedrooms: 6, bathrooms: 7, area: 8500, area_unit: 'sqft', type: 'Villa', location: 'Palm Jumeirah', description: 'Iconic beachfront villa on the world-famous Palm, with private beach, pool, and direct sea access.', images: ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, createdAt: new Date().toISOString() },
    { id: 'l3', title: 'Downtown Sky Suite', price: '5,800,000', currency: 'AED', bedrooms: 2, bathrooms: 2, area: 1800, area_unit: 'sqft', type: 'Apartment', location: 'Downtown Dubai', description: 'Panoramic Burj Khalifa and Fountain views. High-end finishes, smart home system.', images: ['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, createdAt: new Date().toISOString() },
    { id: 'l4', title: 'Business Bay Tower Apt', price: '3,200,000', currency: 'AED', bedrooms: 3, bathrooms: 3, area: 2100, area_unit: 'sqft', type: 'Apartment', location: 'Business Bay', description: 'Modern living in the heart of the business district. Canal views, gym, and concierge.', images: ['https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, createdAt: new Date().toISOString() },
    { id: 'l5', title: 'JBR Beachfront Duplex', price: '9,100,000', currency: 'AED', bedrooms: 3, bathrooms: 3, area: 3000, area_unit: 'sqft', type: 'Duplex', location: 'Jumeirah Beach Residence', description: 'Steps from the beach, this duplex blends indoor luxury with open-air living terraces.', images: ['https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, createdAt: new Date().toISOString() },
    { id: 'l6', title: 'Emirates Hills Mansion', price: '45,000,000', currency: 'AED', bedrooms: 8, bathrooms: 9, area: 14000, area_unit: 'sqft', type: 'Mansion', location: 'Emirates Hills', description: 'Ultra-luxury mansion on the most prestigious address in Dubai. Golf course views, cinema room, staff quarters.', images: ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, createdAt: new Date().toISOString() },
  ],
  news: [
    { id: 'n1', title: 'Dubai Real Estate Market Hits Record Highs in Q1 2026', body: 'Transaction volumes surged 34% year-on-year as international investors poured capital into prime residential assets across Dubai Marina, Downtown, and the Palm.', image_url: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600', published: true, createdAt: new Date().toISOString() },
    { id: 'n2', title: 'New Golden Visa Rules Boost Luxury Property Demand', body: 'The updated 10-year visa programme for AED 2M+ property owners is driving a wave of long-term foreign investment into the UAE.', image_url: 'https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=600', published: true, createdAt: new Date().toISOString() },
    { id: 'n3', title: 'Luxury Homes Dubai Wins Best Agency Award 2025', body: 'We are proud to have been recognised as Dubai\'s top luxury residential agency for the second consecutive year at the Gulf Real Estate Awards.', image_url: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=600', published: true, createdAt: new Date().toISOString() },
  ],
  gallery: [
    { id: 'g1', url: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Marina Penthouse Living Room', sort_order: 0 },
    { id: 'g2', url: 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Palm Jumeirah Aerial View', sort_order: 1 },
    { id: 'g3', url: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Beachfront Villa Exterior', sort_order: 2 },
    { id: 'g4', url: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Downtown Skyline at Night', sort_order: 3 },
    { id: 'g5', url: 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'JBR Beachfront Terrace', sort_order: 4 },
    { id: 'g6', url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Emirates Hills Mansion Pool', sort_order: 5 },
  ],
  team: [
    { id: 't1', displayName: 'Sarah Al-Mansouri', role: 'Senior Property Consultant', avatar_url: '' },
    { id: 't2', displayName: 'James Porter', role: 'Luxury Specialist', avatar_url: '' },
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
    url: `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`,
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
