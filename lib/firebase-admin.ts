import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getStorage, Storage } from 'firebase-admin/storage'

const hasCredentials =
  !!process.env.FIREBASE_PROJECT_ID &&
  !!process.env.FIREBASE_CLIENT_EMAIL &&
  !!process.env.FIREBASE_PRIVATE_KEY &&
  !process.env.FIREBASE_PRIVATE_KEY.includes('YOUR_PRIVATE_KEY')

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]
  if (!hasCredentials) return null

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\\\n/g, '\n'),
    }),
    // Prefer explicit env var; fall back to the modern Firebase Storage domain
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`,
  })
}

function requireApp() {
  const app = getAdminApp()
  if (!app) {
    throw new Error(
      'Firebase Admin credentials not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local'
    )
  }
  return app
}

// Lazy getters — only initialize when actually called at runtime
let _adminAuth: Auth | null = null
let _adminDb: Firestore | null = null
let _adminStorage: Storage | null = null

export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_t, prop) {
    if (!_adminAuth) _adminAuth = getAuth(requireApp())
    return (_adminAuth as any)[prop]
  },
})

export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_t, prop) {
    if (!_adminDb) _adminDb = getFirestore(requireApp())
    return (_adminDb as any)[prop]
  },
})

export const adminStorage: Storage = new Proxy({} as Storage, {
  get(_t, prop) {
    if (!_adminStorage) _adminStorage = getStorage(requireApp())
    return (_adminStorage as any)[prop]
  },
})

// Alias
export const firestore = adminDb
export const storage = adminStorage