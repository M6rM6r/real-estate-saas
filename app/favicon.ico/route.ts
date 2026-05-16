import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export function GET(request: Request) {
  const url = new URL('/favicon.svg', request.url)
  return NextResponse.redirect(url, { status: 307 })
}
