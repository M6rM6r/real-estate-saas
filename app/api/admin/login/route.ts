export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { firestore } from '@/lib/firebase-admin'

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? 'fallback-dev-secret-32-characters!!'
)

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email = '', password = '' } = body
  const validEmail = process.env.ADMIN_EMAIL ?? ''
  const validPassword = process.env.ADMIN_PASSWORD ?? ''

  if (!timingSafeEqual(email, validEmail) || !timingSafeEqual(password, validPassword)) {
    // Skip Firestore logging in demo mode
    if (process.env.DEMO_MODE !== 'true') {
      try {
        await firestore.collection('admin_logs').add({
          action: 'admin_login_failed',
          performedBy: email || 'unknown',
          metadata: { ip: request.headers.get('x-forwarded-for') ?? 'unknown' },
          createdAt: new Date(),
        })
      } catch { /* ignore Firestore errors */ }
    }
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await new SignJWT({ email, role: 'super_admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(ADMIN_JWT_SECRET)

  // Skip Firestore logging in demo mode
  if (process.env.DEMO_MODE !== 'true') {
    try {
      await firestore.collection('admin_logs').add({
        action: 'admin_login_success',
        performedBy: email,
        createdAt: new Date(),
      })
    } catch { /* ignore Firestore errors */ }
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_session')
  return response
}