import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

const _redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim() ?? ''
const _redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ?? ''

const hasUpstash =
  _redisUrl &&
  !_redisUrl.includes('your-redis') &&
  !_redisUrl.includes('placeholder') &&
  _redisToken &&
  !_redisToken.includes('your-upstash') &&
  !_redisToken.includes('placeholder')

let redis: Redis | null = null
if (hasUpstash) {
  try {
    redis = new Redis({ url: _redisUrl, token: _redisToken })
  } catch {
    redis = null
  }
}

const limiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
    })
  : null

export async function rateLimit(request: NextRequest): Promise<NextResponse | null> {
  if (!limiter) return null // skip rate limiting if Redis not configured
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1'
  const { success } = await limiter.limit(ip)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  return null
}