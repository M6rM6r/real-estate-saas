/**
 * Tests for GET /api/admin/metrics
 * Covers: demo mode, unconfigured Firebase, batched query path, error path
 */

// ── mocks (module-level, no resetModules) ─────────────────────────────────────

const mockGet = jest.fn()
const mockSelectGet = jest.fn()
const mockCountGet = jest.fn()

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn().mockImplementation((data: unknown, options?: { status?: number }) => {
      const status = options?.status ?? 200
      const headers = new Map<string, string>()
      return {
        status,
        headers: { set: (k: string, v: string) => headers.set(k, v) },
        json: () => Promise.resolve(data),
      }
    }),
  },
}))

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn((col: string) => {
      if (col === 'tenants') return { get: mockGet }
      if (col === 'posts') return { select: jest.fn().mockReturnValue({ get: mockSelectGet }) }
      if (col === 'media') return { count: jest.fn().mockReturnValue({ get: mockCountGet }) }
      return { get: mockGet }
    }),
  },
}))

jest.mock('@/lib/observability', () => ({
  getRequestId: jest.fn().mockReturnValue('test-req-id'),
  logRouteInfo: jest.fn(),
  logRouteError: jest.fn(),
}))

import { GET } from '@/app/api/admin/metrics/route'
import type { NextRequest } from 'next/server'

function makeRequest(): NextRequest {
  return {
    url: 'http://localhost/api/admin/metrics',
    headers: { get: jest.fn() },
    cookies: { get: jest.fn() },
    nextUrl: { searchParams: new URLSearchParams() },
  } as unknown as NextRequest
}

describe('GET /api/admin/metrics', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    mockGet.mockReset()
    mockSelectGet.mockReset()
    mockCountGet.mockReset()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns demo metrics when DEMO_MODE=true', async () => {
    process.env.DEMO_MODE = 'true'
    const res = await GET(makeRequest())
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data).toHaveProperty('totalAgencies')
    expect(data).toHaveProperty('topAgencies')
    expect(Array.isArray(data.topAgencies)).toBe(true)
  })

  it('returns 503 when Firebase credentials are missing', async () => {
    process.env.DEMO_MODE = 'false'
    delete process.env.FIREBASE_PROJECT_ID
    const res = await GET(makeRequest())
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data).toHaveProperty('error')
  })

  it('returns aggregated metrics from batched queries', async () => {
    process.env.DEMO_MODE = 'false'
    process.env.FIREBASE_PROJECT_ID = 'test-project'
    process.env.FIREBASE_CLIENT_EMAIL = 'test@test.iam.gserviceaccount.com'
    process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA\n-----END RSA PRIVATE KEY-----'

    mockGet.mockResolvedValue({
      docs: [{ id: 'tid', data: () => ({ name: 'Agency A', slug: 'agency-a', createdAt: '2025-01-15T00:00:00.000Z' }) }],
    })
    mockSelectGet.mockResolvedValue({
      docs: [{ data: () => ({ tenantId: 'tid', createdAt: new Date().toISOString() }) }],
    })
    mockCountGet.mockResolvedValue({ data: () => ({ count: 5 }) })

    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('totalAgencies')
    expect(data).toHaveProperty('agenciesPerMonth')
    expect(Array.isArray(data.agenciesPerMonth)).toBe(true)
  })

  it('returns 500 on unexpected Firestore error', async () => {
    process.env.DEMO_MODE = 'false'
    process.env.FIREBASE_PROJECT_ID = 'test-project'
    process.env.FIREBASE_CLIENT_EMAIL = 'test@test.iam.gserviceaccount.com'
    process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA\n-----END RSA PRIVATE KEY-----'

    mockGet.mockRejectedValue(new Error('Firestore unavailable'))
    mockSelectGet.mockRejectedValue(new Error('Firestore unavailable'))
    mockCountGet.mockRejectedValue(new Error('Firestore unavailable'))

    const res = await GET(makeRequest())
    expect(res.status).toBe(500)
  })
})
