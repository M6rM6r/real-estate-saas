import { adminDb } from '@/lib/firebase-admin'
import { getLoginDomainCandidates, isInternalAppHost, normalizeHost } from '@/lib/login-branding'

const DOMAIN_FIELDS = ['custom_domain', 'custom_domains', 'domains', 'domain_aliases'] as const

type DomainField = (typeof DOMAIN_FIELDS)[number]

type TenantDomainMatch = {
  id: string
  slug: string
  data: FirebaseFirestore.DocumentData
}

const isArrayField = (field: DomainField) => field !== 'custom_domain'

const normalizeDomainValue = (value: string): string => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split(/[/?#]/)[0]
    .replace(/:\d+$/, '')

  return normalized.startsWith('www.') ? normalized.slice(4) : normalized
}

const extractDomainValues = (data: FirebaseFirestore.DocumentData): string[] => {
  const values: string[] = []

  for (const field of DOMAIN_FIELDS) {
    const raw = data?.[field]
    if (typeof raw === 'string') {
      values.push(raw)
      continue
    }

    if (Array.isArray(raw)) {
      values.push(...raw.filter((entry): entry is string => typeof entry === 'string'))
    }
  }

  return values
}

export async function findActiveTenantByHost(host: string): Promise<TenantDomainMatch | null> {
  const normalizedHost = normalizeHost(host)
  if (!normalizedHost || isInternalAppHost(host)) return null

  const candidates = getLoginDomainCandidates(host)
  const hostBare = normalizeDomainValue(normalizedHost)

  for (const candidate of candidates) {
    for (const field of DOMAIN_FIELDS) {
      const snap = await adminDb
        .collection('tenants')
        .where(field, isArrayField(field) ? 'array-contains' : '==', candidate)
        .limit(1)
        .get()

      if (snap.empty) continue

      const doc = snap.docs[0]
      const data = doc.data()
      const slug = typeof data?.slug === 'string' ? data.slug.trim() : ''

      if (data?.status !== 'active' || !slug) continue

      return {
        id: doc.id,
        slug,
        data,
      }
    }
  }

  // Fallback path for tenants that stored domains with inconsistent formatting.
  const activeTenants = await adminDb
    .collection('tenants')
    .where('status', '==', 'active')
    .limit(500)
    .get()

  for (const doc of activeTenants.docs) {
    const data = doc.data()
    const slug = typeof data?.slug === 'string' ? data.slug.trim() : ''
    if (!slug) continue

    const hasDomainMatch = extractDomainValues(data).some(rawDomain => {
      return normalizeDomainValue(rawDomain) === hostBare
    })

    if (!hasDomainMatch) continue

    return {
      id: doc.id,
      slug,
      data,
    }
  }

  return null
}