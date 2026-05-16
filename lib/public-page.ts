import { adminDb } from '@/lib/firebase-admin'
import type { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore'

type TenantPageData = {
  tenant: { id: string; name: string; slug: string; primary_color: string; [key: string]: unknown }
  tenantId: string
  profileData: unknown
  listingsData: any[]
  newsData: any[]
  galleryData: any[]
  teamData: any[]
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 800): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === attempts - 1) throw err
      await new Promise(r => setTimeout(r, delayMs))
    }
  }

  throw new Error('unreachable')
}

const serialize = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'object' && obj !== null && 'toDate' in obj && typeof (obj as any).toDate === 'function') return (obj as any).toDate().toISOString()
  if (Array.isArray(obj)) return obj.map(serialize)
  if (typeof obj === 'object' && obj.constructor !== Object) return JSON.parse(JSON.stringify(obj))
  if (typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, serialize(v)]))
  }

  return obj
}

const safeDecodeUrl = (value: unknown) => {
  if (typeof value !== 'string' || !value.includes('%')) return value
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const deepDecodeUrls = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(deepDecodeUrls)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepDecodeUrls(v)]))
  }

  return safeDecodeUrl(value)
}

export async function loadPublishedTenantPageDataBySlug(tenantSlug: string): Promise<TenantPageData | null> {
  const tenantsSnap = await withRetry(() =>
    adminDb.collection('tenants').where('slug', '==', tenantSlug).where('status', '==', 'active').limit(1).get()
  , 3, 600)

  if (tenantsSnap.empty) return null

  const tenantDoc = tenantsSnap.docs[0]
  const tenant = serialize({ id: tenantDoc.id, ...tenantDoc.data() }) as TenantPageData['tenant']
  const tenantId = tenantDoc.id

  const safe = <T,>(p: Promise<T>, fallback: T): Promise<T> => p.catch(() => fallback)
  const emptySnap = { docs: [], empty: true } as any

  const [profileDoc, fallbackProfilesSnap, listingsSnap, newsSnap, gallerySnap, usersSnap] = await Promise.all([
    safe(withRetry(() => adminDb.collection('tenants').doc(tenantId).collection('profiles').doc(tenantId).get(), 3, 600), { exists: false } as any),
    safe(withRetry(() => adminDb.collection('profiles').where('tenantId', '==', tenantId).limit(1).get(), 3, 600), emptySnap),
    safe(withRetry(() => adminDb.collection('posts').where('tenantId', '==', tenantId).where('type', '==', 'listing').where('published', '==', true).limit(50).get(), 3, 600), emptySnap),
    safe(withRetry(() => adminDb.collection('posts').where('tenantId', '==', tenantId).where('type', '==', 'news').where('published', '==', true).limit(20).get(), 3, 600), emptySnap),
    safe(withRetry(() => adminDb.collection('media').where('tenantId', '==', tenantId).limit(12).get(), 3, 600), emptySnap),
    safe(withRetry(() => adminDb.collection('users').where('tenantId', '==', tenantId).get(), 3, 600), emptySnap),
  ])

  const sortByDate = (docs: QueryDocumentSnapshot[]) =>
    [...docs].sort((a, b) => (b.data().createdAt?.toMillis?.() ?? 0) - (a.data().createdAt?.toMillis?.() ?? 0))

  const toDoc = (d: QueryDocumentSnapshot) => deepDecodeUrls(serialize({ id: d.id, ...d.data() })) as any

  const rawProfileData = profileDoc.exists
    ? serialize(profileDoc.data())
    : fallbackProfilesSnap.empty
      ? null
      : serialize(fallbackProfilesSnap.docs[0].data())

  const profileData = rawProfileData ? deepDecodeUrls(rawProfileData) : null

  return {
    tenant,
    tenantId,
    profileData,
    listingsData: sortByDate(listingsSnap.docs).slice(0, 9).map(toDoc),
    newsData: sortByDate(newsSnap.docs).slice(0, 6).map(toDoc),
    galleryData: gallerySnap.docs.sort((a: QueryDocumentSnapshot, b: QueryDocumentSnapshot) => (a.data().sort_order ?? 0) - (b.data().sort_order ?? 0)).map(toDoc),
    teamData: usersSnap.docs.map(toDoc),
  }
}