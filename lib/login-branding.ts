export type LoginLang = 'ar' | 'en'

export type LoginTenantRecord = {
  id?: string
  name?: string | null
  slug?: string | null
  primary_color?: string | null
  custom_domain?: string | null
  theme?: string | null
  status?: string | null
}

export type LoginProfileRecord = {
  logo_url?: string | null
  cover_url?: string | null
  tagline?: string | null
  bio?: string | null
  page_config?: {
    page_lang?: LoginLang
  } | null
}

export type LoginBranding = {
  brandName: string
  brandSubtitle: string
  footer: string
  logoUrl: string
  backgroundImage: string
  accentColor: string
  initialLang: LoginLang
  tenantBadge: string | null
  isTenantAware: boolean
}

const DEFAULT_BRAND_NAME = 'Wa9l'
const DEFAULT_SUBTITLE = {
  ar: 'المنصة الإحترافية لإدارة المواقع الإلكترونية',
  en: 'The professional platform for managing business websites',
} satisfies Record<LoginLang, string>

export function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/:\d+$/, '')
}

export function getRequestHost(headersList: Headers): string {
  const forwardedHost = headersList.get('x-forwarded-host')
  if (forwardedHost) {
    const primaryForwardedHost = forwardedHost.split(',')[0]?.trim()
    if (primaryForwardedHost) return primaryForwardedHost
  }

  const requestHost = headersList.get('x-request-host')?.trim()
  if (requestHost) return requestHost

  const originalHost = headersList.get('x-original-host')?.trim()
  if (originalHost) return originalHost

  return headersList.get('host')?.trim() || ''
}

export function getLoginDomainCandidates(host: string): string[] {
  const normalized = normalizeHost(host)
  if (!normalized) return []
  const bare = normalized.startsWith('www.') ? normalized.slice(4) : normalized
  const www = bare.startsWith('www.') ? bare : `www.${bare}`

  return Array.from(new Set([
    normalized,
    bare,
    www,
    `http://${normalized}`,
    `https://${normalized}`,
    `http://${bare}`,
    `https://${bare}`,
    `http://${www}`,
    `https://${www}`,
    `${normalized}/`,
    `${bare}/`,
    `${www}/`,
    `https://${normalized}/`,
    `https://${bare}/`,
    `https://${www}/`,
  ]))
}

export function isInternalAppHost(host: string): boolean {
  const normalized = normalizeHost(host)
  return (
    !normalized ||
    normalized.startsWith('localhost') ||
    normalized === '127.0.0.1' ||
    normalized === '0.0.0.0' ||
    normalized.endsWith('vercel.app') ||
    normalized.endsWith('web.app')
  )
}

export function buildLoginBranding({
  tenant,
  profile,
  host,
}: {
  tenant?: LoginTenantRecord | null
  profile?: LoginProfileRecord | null
  host?: string
}): LoginBranding {
  const normalizedHost = host ? normalizeHost(host) : ''
  const initialLang: LoginLang = profile?.page_config?.page_lang === 'en' ? 'en' : 'ar'
  const brandName = tenant?.name?.trim() || DEFAULT_BRAND_NAME
  const tenantBadge = !tenant ? null : (tenant.custom_domain?.trim() || normalizedHost || tenant.slug?.trim() || null)
  const subtitle =
    profile?.tagline?.trim() ||
    profile?.bio?.trim() ||
    (tenant
      ? initialLang === 'ar'
        ? `تسجيل الدخول إلى ${brandName}`
        : `Sign in to ${brandName}`
      : DEFAULT_SUBTITLE[initialLang])

  return {
    brandName,
    brandSubtitle: subtitle,
    footer: initialLang === 'ar'
      ? `© 2026 ${brandName} — جميع الحقوق محفوظة.`
      : `© 2026 ${brandName}. All rights reserved.`,
    logoUrl: profile?.logo_url?.trim() || '/logo.png',
    backgroundImage: profile?.cover_url?.trim() || '/gemini-bg.png',
    accentColor: tenant?.primary_color?.trim() || '#0ea5e9',
    initialLang,
    tenantBadge,
    isTenantAware: Boolean(tenant),
  }
}