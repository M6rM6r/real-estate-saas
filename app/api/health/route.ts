export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { getLatencyBucket, getRequestId, logRouteError, logRouteInfo, logRouteStart } from '@/lib/observability'

export const runtime = 'nodejs'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  logRouteStart(request, 'GET /api/health')
  let db = false
  try {
    await adminDb.collection('tenants').limit(1).get()
    db = true
  } catch {
    db = false
  }

  try {
    const status = db ? 'ok' : 'degraded'
    const payload = {
      status,
      db,
      ts: new Date().toISOString(),
      build: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? 'local',
      env: process.env.NODE_ENV ?? 'unknown',
      services: {
        firebaseAdmin: db ? 'up' : 'down',
        storage: process.env.FIREBASE_STORAGE_BUCKET ? 'configured' : 'missing-config',
      },
    }
    const response = NextResponse.json(payload, {
      status: db ? 200 : 503,
    })
    response.headers.set('x-request-id', getRequestId(request))
    logRouteInfo(request, 'GET /api/health', {
      message: 'Health probe served',
      status: db ? 200 : 503,
      durationMs: Date.now() - startedAt,
      latencyBucket: getLatencyBucket(Date.now() - startedAt),
      degraded: !db,
    })
    return response
  } catch (error) {
    logRouteError(request, 'GET /api/health', error, {
      status: 500,
      durationMs: Date.now() - startedAt,
      latencyBucket: getLatencyBucket(Date.now() - startedAt),
    })
    const response = NextResponse.json({ status: 'error', db: false, ts: new Date().toISOString() }, { status: 500 })
    response.headers.set('x-request-id', getRequestId(request))
    return response
  }
}
