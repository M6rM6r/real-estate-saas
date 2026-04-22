import { adminDb } from '@/lib/firebase-admin'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
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

  const [profilesSnap, listingsSnap, newsSnap, gallerySnap] = await Promise.all([
    adminDb.collection('profiles').where('tenantId', '==', tenantId).limit(1).get(),
    adminDb.collection('posts').where('tenantId', '==', tenantId).where('type', '==', 'listing').where('published', '==', true).orderBy('createdAt', 'desc').limit(9).get(),
    adminDb.collection('posts').where('tenantId', '==', tenantId).where('type', '==', 'news').where('published', '==', true).orderBy('createdAt', 'desc').limit(6).get(),
    adminDb.collection('media').where('tenantId', '==', tenantId).orderBy('sort_order').limit(12).get(),
  ])

  return (
    <PublicAgencyPage
      tenant={tenant}
      profile={profilesSnap.empty ? null : profilesSnap.docs[0].data() as any}
      listings={listingsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any}
      news={newsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any}
      gallery={gallerySnap.docs.map(d => ({ id: d.id, ...d.data() })) as any}
    />
  )
}
