import { adminAuth, adminDb } from '@/lib/firebase-admin'
import type { NextRequest } from 'next/server'

/**
 * Verifies a Firebase ID token from either:
 *   1. The `fb_session` httpOnly cookie (set by /api/auth/session after login)
 *   2. The `Authorization: Bearer <token>` header (for programmatic API access)
 *
 * Returns { uid, tenantId } or null if unauthorized.
 */
export async function getFirebaseSession(
  request: NextRequest
): Promise<{ uid: string; tenantId: string } | null> {
  // Prefer cookie (set by our own /api/auth/session endpoint)
  let idToken = request.cookies.get('fb_session')?.value ?? null

  // Fall back to Bearer header
  if (!idToken) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      idToken = authHeader.slice(7)
    }
  }

  if (!idToken) return null

  try {
    const decoded = await adminAuth.verifyIdToken(idToken)
    const uid = decoded.uid

    // Tenant mapping stored in Firestore: users/{uid} → { tenantId }
    const userDoc = await adminDb.collection('users').doc(uid).get()
    if (!userDoc.exists) return null

    const tenantId = userDoc.data()?.tenantId as string | undefined
    if (!tenantId) return null

    return { uid, tenantId }
  } catch {
    return null
  }
}
