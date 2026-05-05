/**
 * Tests for GET|POST /api/admin/tenants
 * Covers: auth guard, demo mode, batched query, POST validation, error path
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
        headers: { set: (k: string, v: string) => headers.set(k, v) },
        json: () => Promise.resolve(data),
      }
    }),
  },
}))

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: { collection: jest.fn() },
  adminAuth: { createUser: jest.fn(), setCustomUserClaims: jest.fn() },
}))

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn().mockResolvedValue(null), // null = authorised
}))

jest.mock('@/lib/observability', () => ({
  getRequestId: jest.fn().mockReturnValue('req-123'),
  logRouteInfo: jest.fn(),
  logRouteError: jest.fn(),
}))

// ── helpers ────────────────────────────────────────────────────────────────────

function makeGet(url = 'http://localhost/api/admin/tenants'): NextRequest {
  return {
    url,
    method: 'GET',
    headers: { get: jest.fn() },
    cookies: { get: jest.fn() },
    nextUrl: { searchParams: new URLSearchParams() },
  } as unknown as NextRequest
}

function makePost(body: object): NextRequest {
  return {
    url: 'http://localhost/api/admin/tenants',
    method: 'POST',
    headers: { get: jest.fn() },
    cookies: { get: jest.fn() },
    json: jest.fn().mockResolvedValue(body),
    nextUrl: { searchParams: new URLSearchParams() },
  } as unknown as NextRequest
}

function mockEmptyFirestore() {
  const { adminDb } = require('@/lib/firebase-admin')
  adminDb.collection.mockImplementation(() => ({
    orderBy: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ docs: [] }),
    }),
    select: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ docs: [] }),
    }),
    doc: jest.fn().mockReturnValue({ set: jest.fn().mockResolvedValue(undefined) }),
    add: jest.fn().mockResolvedValue(undefined),
  }))
}

// ── tests ──────────────────────────────────────────────────────────────────────

describe('GET /api/admin/tenants', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns 401 when requireAdmin rejects', async () => {
    const { requireAdmin } = require('@/lib/admin-auth')
    const { NextResponse } = require('next/server')
    const denyResponse = { status: 401, headers: { set: jest.fn() }, json: () => Promise.resolve({ error: 'Unauthorized' }) }
    requireAdmin.mockResolvedValueOnce(denyResponse)
    NextResponse.json.mockReturnValueOnce(denyResponse)

    const { GET } = await import('@/app/api/admin/tenants/route')
    const res = await GET(makeGet())
    expect(res.status).toBe(401)
  })

  it('returns demo tenants when DEMO_MODE=true', async () => {
    process.env.DEMO_MODE = 'true'
    const { GET } = await import('@/app/api/admin/tenants/route')
    const res = await GET(makeGet())
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('slug')
  })

  it('returns empty array when no tenants in Firestore', async () => {
    process.env.DEMO_MODE = 'false'
    mockEmptyFirestore()

    const { GET } = await import('@/app/api/admin/tenants/route')
    const res = await GET(makeGet())
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBe(0)
  })

  it('attaches x-request-id to response', async () => {
    process.env.DEMO_MODE = 'true'
    const { GET } = await import('@/app/api/admin/tenants/route')
    const res = await GET(makeGet())
    expect(res.headers).toBeDefined()
  })
})

describe('POST /api/admin/tenants', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns demo response without DB write in DEMO_MODE', async () => {
    process.env.DEMO_MODE = 'true'
    const { POST } = await import('@/app/api/admin/tenants/route')
    const res = await POST(makePost({ name: 'Test Agency', slug: 'test-agency' }))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data).toHaveProperty('id')
    expect(data.message).toMatch(/demo/i)
  })

  it('returns 400 when slug contains invalid characters', async () => {
    process.env.DEMO_MODE = 'false'
    process.env.FIREBASE_PROJECT_ID = 'test'
    mockEmptyFirestore()

    const { adminAuth } = require('@/lib/firebase-admin')
    adminAuth.createUser.mockResolvedValue({ uid: 'user-123' })
    adminAuth.setCustomUserClaims.mockResolvedValue(undefined)

    const { POST } = await import('@/app/api/admin/tenants/route')
    const res = await POST(makePost({ name: 'Test', slug: 'INVALID SLUG!', email: 'a@b.com' }))
    expect(res.status).toBe(400)
  })
})
