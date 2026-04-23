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
  const mockLimiter = {
    limit: jest.fn().mockResolvedValue({ success: true }),
  }

  const MockRatelimit = jest.fn().mockImplementation(() => mockLimiter)
  MockRatelimit.slidingWindow = jest.fn().mockReturnValue({})

  return {
    Ratelimit: MockRatelimit,
  }
})

jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({})),
}))

import { rateLimit } from '@/lib/rate-limit'

describe('rateLimit', () => {
  let mockRequest: any

  beforeEach(() => {
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
    // Get the mocked limiter instance
    const ratelimitModule = require('@upstash/ratelimit')
    const mockInstance = ratelimitModule.Ratelimit.mock.results[0].value
    mockInstance.limit.mockResolvedValueOnce({ success: false })

    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue('127.0.0.1'),
      },
    }

    const result = await rateLimit(mockRequest as any)

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