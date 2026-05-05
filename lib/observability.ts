import type { NextRequest } from 'next/server'

type LogLevel = 'info' | 'error'

type LogPayload = {
  route: string
  requestId: string
  message: string
  durationMs?: number
  status?: number
  method?: string
  pathname?: string
  errorName?: string
  errorMessage?: string
  [key: string]: unknown
}

const REDACT_KEYS = new Set([
  'password',
  'token',
  'authorization',
  'cookie',
  'set-cookie',
  'secret',
  'privatekey',
  'apikey',
])

function emit(level: LogLevel, payload: LogPayload) {
  const entry = {
    level,
    timestamp: new Date().toISOString(),
    ...payload,
  }

  const line = JSON.stringify(entry)
  if (level === 'error') {
    console.error(line)
    return
  }
  console.info(line)
}

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitize)
  if (value && typeof value === 'object') {
    const src = value as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(src)) {
      if (REDACT_KEYS.has(key.toLowerCase())) {
        out[key] = '[REDACTED]'
      } else {
        out[key] = sanitize(val)
      }
    }
    return out
  }
  return value
}

export function getRequestId(request: NextRequest) {
  return request.headers.get('x-request-id') ?? 'unknown-request'
}

export function getLatencyBucket(durationMs: number) {
  if (durationMs < 100) return 'lt_100ms'
  if (durationMs < 300) return 'lt_300ms'
  if (durationMs < 1000) return 'lt_1s'
  if (durationMs < 3000) return 'lt_3s'
  return 'gte_3s'
}

export function logRouteStart(request: NextRequest, route: string, payload: Record<string, unknown> = {}) {
  emit('info', {
    route,
    requestId: getRequestId(request),
    message: 'Route start',
    method: request.method,
    pathname: request.nextUrl.pathname,
    ...(sanitize(payload) as Record<string, unknown>),
  })
}

export function logRouteInfo(request: NextRequest, route: string, payload: Omit<LogPayload, 'route' | 'requestId' | 'method' | 'pathname' | 'message'> & { message: string }) {
  emit('info', {
    route,
    requestId: getRequestId(request),
    message: payload.message,
    method: request.method,
    pathname: request.nextUrl.pathname,
    ...(sanitize(payload) as Record<string, unknown>),
  })
}

export function logRouteError(
  request: NextRequest,
  route: string,
  error: unknown,
  extra: Omit<LogPayload, 'route' | 'requestId' | 'method' | 'pathname' | 'message' | 'errorName' | 'errorMessage'> & { message?: string } = {},
) {
  const err = error instanceof Error ? error : new Error(String(error))
  emit('error', {
    route,
    requestId: getRequestId(request),
    method: request.method,
    pathname: request.nextUrl.pathname,
    message: extra.message ?? 'Unhandled route error',
    errorName: err.name,
    errorMessage: err.message,
    ...(sanitize(extra) as Record<string, unknown>),
  })
}