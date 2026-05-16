import { GET } from '@/app/api/health/route'

// Mock observability
jest.mock('@/lib/observability', () => ({
  getRequestId: jest.fn().mockReturnValue('test-id'),
  logRouteStart: jest.fn(),
  logRouteInfo: jest.fn(),
  logRouteError: jest.fn(),
  getLatencyBucket: jest.fn().mockReturnValue('100ms'),
}))

// Mock Next.js Response
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      status: options?.status || 200,
      headers: { set: jest.fn() },
      json: () => Promise.resolve(data),
    })),
  },
}))

// Mock Firebase admin
jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({}),
      }),
    }),
  },
}))

describe('/api/health', () => {
  const mockRequest = {
    headers: {
      get: jest.fn().mockReturnValue('test-id'),
    },
    method: 'GET',
    nextUrl: { pathname: '/api/health' },
  } as any

  it('should return healthy status when database is accessible', async () => {
    const response = await GET(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('ok')
    expect(data.db).toBe(true)
    expect(data.ts).toBeDefined()
  })

  it('should return degraded status when database is not accessible', async () => {
    // Mock database failure
    const mockAdminDb = require('@/lib/firebase-admin').adminDb
    mockAdminDb.collection.mockReturnValue({
      limit: jest.fn().mockReturnValue({
        get: jest.fn().mockImplementation(() => Promise.reject(new Error('Database error'))),
      }),
    })

    const response = await GET(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('degraded')
    expect(data.db).toBe(false)
    expect(data.ts).toBeDefined()
  })
})