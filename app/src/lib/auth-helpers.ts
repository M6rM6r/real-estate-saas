import { adminAuth, adminDb } from '@/lib/firebase-admin'
import type { NextRequest } from 'next/server'

/**
 * Verifies a Firebase ID token from the Authorization header.
 * Returns { uid, tenantId } or null if unauthorized.
 */
export async function getFirebaseSession(
  request: NextRequest
): Promise<{ uid: string; tenantId: string } | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const idToken = authHeader.slice(7)
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
