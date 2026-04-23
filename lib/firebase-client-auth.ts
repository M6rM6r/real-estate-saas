'use client'
import { auth } from '@/lib/firebase'

/**
 * Gets the current Firebase ID token for use in Authorization headers.
 * Returns null if not authenticated.
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  try {
    return await user.getIdToken()
  } catch {
    return null
  }
}

/**
 * Returns headers with Authorization: Bearer <token>
 * Returns null if not authenticated.
 */
export async function authHeaders(): Promise<Record<string, string> | null> {
  const token = await getIdToken()
  if (!token) return null
  return { Authorization: `Bearer ${token}` }
}
