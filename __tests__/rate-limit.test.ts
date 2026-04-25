// Ensure rate limiter is initialized in lib/rate-limit.ts
process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'

const mockLimiter = {
  limit: jest.fn().mockResolvedValue({ success: true }),
}

// Mock Next.js types
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    headers = {
      get: jest.fn(),
    }
  },
  NextResponse: {
    json: jest.fn().mockReturnValue({ status: 429 }),
  },
}))

// Mock Upstash Redis and Ratelimit
jest.mock('@upstash/ratelimit', () => {
  const MockRatelimit = jest.fn().mockImplementation(() => mockLimiter)
  ;(MockRatelimit as any).slidingWindow = jest.fn().mockReturnValue({})

  return {
    Ratelimit: MockRatelimit,
  }
})

jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({})),
}))

describe('rateLimit', () => {
  let mockRequest: any
  let rateLimit: (request: any) => Promise<any>

  beforeEach(() => {
    jest.resetModules()
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
    mockLimiter.limit.mockResolvedValue({ success: true })
    rateLimit = require('@/lib/rate-limit').rateLimit

    mockRequest = {
      headers: {
        get: jest.fn(),
      },
    }
  })

  it('should allow requests within rate limit', async () => {
    mockRequest.headers.get.mockReturnValue('127.0.0.1')

    const result = await rateLimit(mockRequest)

    expect(result).toBeNull()
  })

  it('should block requests exceeding rate limit', async () => {
    mockLimiter.limit.mockResolvedValueOnce({ success: false })

    const request = {
      headers: {
        get: jest.fn().mockReturnValue('127.0.0.1'),
      },
    }

    const result = await rateLimit(request as any)

    expect(result).toBeInstanceOf(Object)
    expect(result?.status).toBe(429)
  })

  it('should use x-forwarded-for header for IP detection', async () => {
    mockRequest.headers.get.mockImplementation((header: string) => {
      if (header === 'x-forwarded-for') return '192.168.1.1'
      return null
    })

    await rateLimit(mockRequest)

    expect(mockRequest.headers.get).toHaveBeenCalledWith('x-forwarded-for')
  })
})