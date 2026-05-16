import type { Metadata } from 'next'
import { isInternalAppHost, normalizeHost } from '@/lib/login-branding'

type PublicPageProfile = {
  bio?: string | null
  cover_url?: string | null
  coverUrl?: string | null
  page_config?: {
    page_lang?: 'ar' | 'en'
    seo_title?: string | null
    seo_description?: string | null
  } | null
} | null

type PublicPageTenant = {
  name?: string | null
  slug?: string | null
  business_type?: string | null
} | null

const DEFAULT_APP_URL = 'https://real-estate-saas--rewrew7.us-east4.hosted.app'

export function getSchemaOrgType(businessType?: string | null) {
  switch (businessType) {
    case 'restaurant':
      return 'Restaurant'
    case 'salon':
      return 'BeautySalon'
    case 'retail':
      return 'Store'
    case 'services':
      return 'ProfessionalService'
    case 'car_dealer':
      return 'AutoDealer'
    case 'real_estate':
      return 'RealEstateAgent'
    default:
      return 'Organization'
  }
}

export function getConfiguredAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL).trim().replace(/\/+$/, '')
}

export function buildPublishedTenantPageUrl({
  host,
  slug,
  isCustomDomain,
}: {
  host?: string
  slug: string
  isCustomDomain: boolean
}): string {
  const normalizedHost = normalizeHost(host || '')

  if (isCustomDomain && normalizedHost && !isInternalAppHost(normalizedHost)) {
    return `https://${normalizedHost}`
  }

  return `${getConfiguredAppUrl()}/${slug}`
}

export function buildPublishedTenantOgImageUrl({
  host,
  slug,
  isCustomDomain,
  coverUrl,
}: {
  host?: string
  slug: string
  isCustomDomain: boolean
  coverUrl?: string | null
}): string {
  const trimmedCover = coverUrl?.trim()
  if (trimmedCover) return trimmedCover

  const normalizedHost = normalizeHost(host || '')
  if (isCustomDomain && normalizedHost && !isInternalAppHost(normalizedHost)) {
    return `https://${normalizedHost}/${slug}/opengraph-image`
  }

  return `${getConfiguredAppUrl()}/${slug}/opengraph-image`
}

export function buildPublishedTenantMetadata({
  tenant,
  profile,
  host,
  isCustomDomain,
}: {
  tenant: PublicPageTenant
  profile: PublicPageProfile
  host?: string
  isCustomDomain: boolean
}): Metadata {
  const slug = tenant?.slug?.trim() || ''
  const pageLang = profile?.page_config?.page_lang === 'en' ? 'en' : 'ar'
  const seoTitle = profile?.page_config?.seo_title?.trim() || tenant?.name?.trim() || slug
  const rawDescription = profile?.page_config?.seo_description?.trim()
    || profile?.bio?.trim()
    || (pageLang === 'ar' ? 'خدمات احترافية متميزة' : 'Professional business services')
  const seoDesc = rawDescription.length > 160 ? `${rawDescription.slice(0, 157)}...` : rawDescription
  const canonicalUrl = buildPublishedTenantPageUrl({ host, slug, isCustomDomain })
  const ogImageUrl = buildPublishedTenantOgImageUrl({
    host,
    slug,
    isCustomDomain,
    coverUrl: profile?.cover_url || profile?.coverUrl,
  })

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      type: 'website',
      locale: pageLang === 'ar' ? 'ar_SA' : 'en_US',
      url: canonicalUrl,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDesc,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
  }
}

export function buildPublishedTenantJsonLd({
  tenant,
  profile,
  host,
  isCustomDomain,
}: {
  tenant: PublicPageTenant
  profile: PublicPageProfile
  host?: string
  isCustomDomain: boolean
}) {
  const slug = tenant?.slug?.trim() || ''

  return {
    '@context': 'https://schema.org',
    '@type': getSchemaOrgType(tenant?.business_type),
    name: tenant?.name?.trim() || slug,
    description: profile?.bio?.trim() || 'Professional business services',
    url: buildPublishedTenantPageUrl({ host, slug, isCustomDomain }),
    ...(profile?.cover_url?.trim() ? { image: profile.cover_url.trim() } : {}),
  }
}