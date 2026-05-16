import { headers } from 'next/headers';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Script from 'next/script';
import PageViewTracker from '@/components/PageViewTracker';
import PublicAgencyPage from '@/components/PublicAgencyPage';
import { findActiveTenantByHost } from '@/lib/tenant-domain';
import { getRequestHost } from '@/lib/login-branding';
import { buildPublishedTenantJsonLd, buildPublishedTenantMetadata } from '@/lib/public-page-metadata';
import { loadPublishedTenantPageDataBySlug } from '@/lib/public-page';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = getRequestHost(headersList);

  try {
    const tenantMatch = await findActiveTenantByHost(host);
    if (!tenantMatch?.slug) {
      return {};
    }

    const pageData = await loadPublishedTenantPageDataBySlug(tenantMatch.slug);
    if (!pageData) {
      return {};
    }

    return buildPublishedTenantMetadata({
      tenant: pageData.tenant,
      profile: pageData.profileData as any,
      host,
      isCustomDomain: true,
    });
  } catch (error) {
    console.error('Home metadata lookup failed:', error);
    return {};
  }
}

export default async function Home() {
  const headersList = await headers();
  const host = getRequestHost(headersList);

  try {
    const tenantMatch = await findActiveTenantByHost(host);
    if (tenantMatch?.slug) {
      const pageData = await loadPublishedTenantPageDataBySlug(tenantMatch.slug);

      if (pageData) {
        const jsonLd = buildPublishedTenantJsonLd({
          tenant: pageData.tenant,
          profile: pageData.profileData as any,
          host,
          isCustomDomain: true,
        });

        return (
          <>
            <Script
              id="json-ld-org"
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PageViewTracker slug={tenantMatch.slug} tenantId={pageData.tenantId} />
            <PublicAgencyPage
              tenant={pageData.tenant}
              profile={pageData.profileData as any}
              listings={pageData.listingsData}
              news={pageData.newsData}
              gallery={pageData.galleryData}
              team={pageData.teamData}
            />
          </>
        );
      }
    }
  } catch (error) {
    console.error('Home tenant lookup failed:', error);
  }

  redirect('/login');
}
