import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? 'fallback-dev-secret-32-characters!!'
)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Super admin routes ──────────────────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('admin_session')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    try {
      await jwtVerify(token, ADMIN_JWT_SECRET)
    } catch {
      const res = NextResponse.redirect(new URL('/admin/login', request.url))
      res.cookies.delete('admin_session')
      return res
    }
  }

  // ── Agency dashboard routes ─────────────────────────────
  // Firebase stores the ID token in a cookie we set ourselves called 'fb_session'
  if (pathname.startsWith('/dashboard')) {
    const fbSession = request.cookies.get('fb_session')?.value
    if (!fbSession) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}
