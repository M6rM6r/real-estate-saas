import {
  buildPublishedTenantJsonLd,
  buildPublishedTenantMetadata,
  buildPublishedTenantOgImageUrl,
  buildPublishedTenantPageUrl,
  getConfiguredAppUrl,
} from '@/lib/public-page-metadata'

describe('public page metadata helpers', () => {
  it('uses the custom domain root as canonical URL', () => {
    expect(buildPublishedTenantPageUrl({
      host: 'm6r.finance',
      slug: 'scscsc',
      isCustomDomain: true,
    })).toBe('https://m6r.finance')
  })

  it('uses the app URL plus slug for platform domains', () => {
    expect(buildPublishedTenantPageUrl({
      host: 'wa9l.website',
      slug: 'scscsc',
      isCustomDomain: false,
    })).toBe(`${getConfiguredAppUrl()}/scscsc`)
  })

  it('builds a custom-domain og image fallback without the hosted app URL', () => {
    expect(buildPublishedTenantOgImageUrl({
      host: 'm6r.finance',
      slug: 'scscsc',
      isCustomDomain: true,
      coverUrl: '',
    })).toBe('https://m6r.finance/scscsc/opengraph-image')
  })

  it('builds metadata with custom-domain canonical and open graph URLs', () => {
    const metadata = buildPublishedTenantMetadata({
      tenant: { name: 'مطر العقارية', slug: 'scscsc' },
      profile: {
        bio: 'الخبرة والفخامة في كل تفصيل',
        page_config: {
          page_lang: 'ar',
          seo_title: 'مطر العقارية',
          seo_description: 'أفضل العقارات',
        },
      },
      host: 'm6r.finance',
      isCustomDomain: true,
    })

    expect(metadata.alternates?.canonical).toBe('https://m6r.finance')
    expect(metadata.openGraph?.url).toBe('https://m6r.finance')
    expect(metadata.twitter?.images).toEqual([{ url: 'https://m6r.finance/scscsc/opengraph-image', width: 1200, height: 630 }])
  })

  it('builds JSON-LD with the custom-domain root URL', () => {
    expect(buildPublishedTenantJsonLd({
      tenant: { name: 'مطر العقارية', slug: 'scscsc', business_type: 'real_estate' },
      profile: {
        bio: 'الخبرة والفخامة في كل تفصيل',
        cover_url: 'https://cdn.example.com/cover.webp',
      },
      host: 'm6r.finance',
      isCustomDomain: true,
    })).toEqual(expect.objectContaining({
      '@type': 'RealEstateAgent',
      url: 'https://m6r.finance',
      image: 'https://cdn.example.com/cover.webp',
    }))
  })
})