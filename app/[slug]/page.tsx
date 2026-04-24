import { adminDb } from '@/lib/firebase-admin'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import PublicAgencyPage from '@/components/PublicAgencyPage'

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
