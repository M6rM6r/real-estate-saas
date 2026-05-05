export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseSession } from '@/lib/auth-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { getLatencyBucket, getRequestId, logRouteError, logRouteInfo, logRouteStart } from '@/lib/observability'
import { FirestoreLeadRepository } from '@/lib/repositories/lead-repository'

const leadRepository = new FirestoreLeadRepository(adminDb)

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  logRouteStart(request, 'GET /api/dashboard/leads')
  try {
    const session = await getFirebaseSession(request)
    if (!session) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      response.headers.set('x-request-id', getRequestId(request))
      return response
    }

    const sinceParam = request.nextUrl.searchParams.get('since')
    let since: Date | undefined
    if (sinceParam) {
      const parsed = new Date(sinceParam)
      if (!isNaN(parsed.getTime())) since = parsed
    }

    const leads = await leadRepository.findByTenant(session.tenantId, { since })
    const response = NextResponse.json(leads.map(({ createdAt, ...rest }) => ({
      ...rest,
      created_at: createdAt?.toISOString() ?? null,
    })))
    response.headers.set('x-request-id', getRequestId(request))
    logRouteInfo(request, 'GET /api/dashboard/leads', {
      message: 'Leads fetched',
      status: 200,
      durationMs: Date.now() - startedAt,
      latencyBucket: getLatencyBucket(Date.now() - startedAt),
      tenantId: session.tenantId,
      resultCount: leads.length,
    })
    return response
  } catch (error) {
    logRouteError(request, 'GET /api/dashboard/leads', error, {
      status: 500,
      durationMs: Date.now() - startedAt,
      latencyBucket: getLatencyBucket(Date.now() - startedAt),
    })
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    response.headers.set('x-request-id', getRequestId(request))
    return response
  }
}
