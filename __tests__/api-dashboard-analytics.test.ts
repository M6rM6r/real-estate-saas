/**
 * Tests for GET /api/dashboard/analytics
 * Covers: auth guard, period params (7d / 30d / 12m), error path
 */
import { NextRequest } from 'next/server'

// ── mocks ─────────────────────────────────────────────────────────────────────

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => {
      const status = options?.status ?? 200
      const headers = new Map<string, string>()
      return {
        status,
        headers: {
          set: (k: string, v: string) => headers.set(k, v),
          get: (k: string) => headers.get(k),
        },
        json: () => Promise.resolve(data),
      }
    }),
  },
}))

jest.mock('@/lib/auth-helpers', () => ({
  getFirebaseSession: jest.fn(),
}))

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: { collection: jest.fn() },
}))

jest.mock('@/lib/observability', () => ({
  getRequestId: jest.fn().mockReturnValue('req-analytics'),
  logRouteInfo: jest.fn(),
  logRouteError: jest.fn(),
}))

// ── helpers ────────────────────────────────────────────────────────────────────

function makeRequest(period?: string): NextRequest {
  const params = period ? `?period=${period}` : ''
  return {
    url: `http://localhost/api/dashboard/analytics${params}`,
    headers: { get: jest.fn() },
    cookies: { get: jest.fn() },
    nextUrl: { searchParams: new URLSearchParams(period ? { period } : {}) },
  } as unknown as NextRequest
}

function mockFirestoreSuccess(pageViewDocs: object[] = []) {
  const { adminDb } = require('@/lib/firebase-admin')
  const countResult = { data: () => ({ count: pageViewDocs.length }) }
  adminDb.collection.mockImplementation(() => ({
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ docs: pageViewDocs.map((d) => ({ data: () => d })) }),
    count: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue(countResult) }),
  }))
}

// ── tests ──────────────────────────────────────────────────────────────────────

describe('GET /api/dashboard/analytics', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    const { getFirebaseSession } = require('@/lib/auth-helpers')
    getFirebaseSession.mockResolvedValue({ tenantId: 'tenant-abc', uid: 'user-1' })
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns 401 when session is missing', async () => {
    const { getFirebaseSession } = require('@/lib/auth-helpers')
    getFirebaseSession.mockResolvedValueOnce(null)

    const { GET } = await import('@/app/api/dashboard/analytics/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data).toHaveProperty('error')
  })

  it('returns analytics with default 30d period', async () => {
    mockFirestoreSuccess()

    const { GET } = await import('@/app/api/dashboard/analytics/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('pageViews')
    expect(data).toHaveProperty('totalViews')
    expect(data).toHaveProperty('totalLeads')
    expect(data.period).toBe('30d')
    expect(data.labelFormat).toBe('day')
  })

  it('returns analytics with 7d period', async () => {
    mockFirestoreSuccess()

    const { GET } = await import('@/app/api/dashboard/analytics/route')
    const res = await GET(makeRequest('7d'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.period).toBe('7d')
    expect(data.labelFormat).toBe('day')
  })

  it('returns analytics with 12m period and month grouping', async () => {
    mockFirestoreSuccess([
      { createdAt: { toDate: () => new Date('2025-01-10') } },
      { createdAt: { toDate: () => new Date('2025-02-15') } },
    ])

    const { GET } = await import('@/app/api/dashboard/analytics/route')
    const res = await GET(makeRequest('12m'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.period).toBe('12m')
    expect(data.labelFormat).toBe('month')
    // buckets should be grouped by YYYY-MM
    if (data.pageViews.length > 0) {
      expect(data.pageViews[0].date).toMatch(/^\d{4}-\d{2}$/)
    }
  })

  it('returns 500 on Firestore error', async () => {
    const { adminDb } = require('@/lib/firebase-admin')
    adminDb.collection.mockImplementation(() => ({
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      get: jest.fn().mockImplementation(() => Promise.reject(new Error('Firestore down'))),
      count: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: () => ({ count: 0 }) }),
      }),
    }))

    const { GET } = await import('@/app/api/dashboard/analytics/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data).toHaveProperty('error')
  })
})
