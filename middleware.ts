import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? 'fallback-dev-secret-32-characters!!'
)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const requestHeaders = new Headers(request.headers)
  const requestId = requestHeaders.get('x-request-id') ?? crypto.randomUUID()
  requestHeaders.set('x-request-id', requestId)

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
  // Allow both real Firebase sessions and demo sessions
  if (pathname.startsWith('/dashboard')) {
    const fbSession = request.cookies.get('fb_session')?.value
    const demoSession = request.cookies.get('demo_session')?.value
    if (!fbSession && !demoSession) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set('x-request-id', requestId)
  return response
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}
