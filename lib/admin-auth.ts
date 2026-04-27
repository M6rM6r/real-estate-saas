import { jwtVerify } from 'jose'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_JWT_SECRET) {
  throw new Error('ADMIN_JWT_SECRET environment variable must be set in production')
}
const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? 'fallback-dev-secret-32-characters!!'
)

/**
 * Verifies the admin_session cookie. Returns null if valid, or a 401 response if not.
 * Usage: const denied = await requireAdmin(request); if (denied) return denied
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get('admin_session')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    await jwtVerify(token, ADMIN_JWT_SECRET)
    return null
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
