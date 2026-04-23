import { adminDb } from '@/lib/firebase-admin'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import PublicAgencyPage from '@/components/PublicAgencyPage'

export const revalidate = 60

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params
  const tenantsSnap = await adminDb.collection('tenants').where('slug', '==', slug).where('status', '==', 'active').limit(1).get()
  if (tenantsSnap.empty) return { title: 'Not Found' }
  const tenant = { id: tenantsSnap.docs[0].id, ...tenantsSnap.docs[0].data() } as { id: string; name: string; slug: string }
  const profilesSnap = await adminDb.collection('profiles').where('tenantId', '==', tenant.id).limit(1).get()
  const profile = profilesSnap.empty ? null : profilesSnap.docs[0].data()

  return {
    title: `${tenant.name} — Real Estate`,
    description: (profile?.bio as string) ?? 'Professional real estate services',
    openGraph: {
      title: tenant.name,
      description: (profile?.bio as string) ?? '',
      images: profile?.cover_url ? [profile.cover_url as string] : [],
    },
  }
}

export default async function AgencyPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  const tenantsSnap = await adminDb.collection('tenants').where('slug', '==', slug).where('status', '==', 'active').limit(1).get()
  if (tenantsSnap.empty) notFound()

  const tenantDoc = tenantsSnap.docs[0]
  const tenant = { id: tenantDoc.id, ...tenantDoc.data() } as { id: string; name: string; slug: string; primary_color: string; [key: string]: unknown }
  const tenantId = tenantDoc.id

  const [profilesSnap, listingsSnap, newsSnap, gallerySnap, usersSnap] = await Promise.all([
    adminDb.collection('profiles').where('tenantId', '==', tenantId).limit(1).get(),
    adminDb.collection('posts').where('tenantId', '==', tenantId).where('type', '==', 'listing').where('published', '==', true).orderBy('createdAt', 'desc').limit(9).get(),
    adminDb.collection('posts').where('tenantId', '==', tenantId).where('type', '==', 'news').where('published', '==', true).orderBy('createdAt', 'desc').limit(6).get(),
    adminDb.collection('media').where('tenantId', '==', tenantId).orderBy('sort_order').limit(12).get(),
    adminDb.collection('users').where('tenantId', '==', tenantId).get(),
  ])

  const listingsData = listingsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[]
  const profileData = profilesSnap.empty ? null : profilesSnap.docs[0].data() as any

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
      <PublicAgencyPage
        tenant={tenant}
        profile={profileData}
        listings={listingsData}
        news={newsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any}
        gallery={gallerySnap.docs.map(d => ({ id: d.id, ...d.data() })) as any}
        team={usersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any}
      />
    </>
  )
}
