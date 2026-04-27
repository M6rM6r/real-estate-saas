export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import { writeAdminLog } from '@/lib/audit'

if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_JWT_SECRET) {
  throw new Error('ADMIN_JWT_SECRET environment variable must be set in production')
}
const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? 'fallback-dev-secret-32-characters!!'
)

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request)
  if (limited) return limited

  let body: z.infer<typeof loginSchema>
  try {
    body = loginSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
  }

  const { email, password } = body
  const validEmail = process.env.ADMIN_EMAIL ?? ''
  const validPassword = process.env.ADMIN_PASSWORD ?? ''

  if (!validEmail || !validPassword) {
    return NextResponse.json({ error: 'Admin credentials not configured in environment' }, { status: 503 })
  }

  const emailMatch = timingSafeEqual(email, validEmail)
  const passwordMatch = timingSafeEqual(password, validPassword)

  if (!emailMatch || !passwordMatch) {
    await writeAdminLog('admin_login_failed', email, {
      metadata: { ip: request.headers.get('x-forwarded-for') ?? 'unknown' },
    })
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await new SignJWT({ email, role: 'super_admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(ADMIN_JWT_SECRET)

  await writeAdminLog('admin_login_success', email)

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