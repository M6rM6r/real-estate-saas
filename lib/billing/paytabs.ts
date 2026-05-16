import type { TenantBillingStatus } from '@/lib/types'

export type PaytabsStatus = {
  responseStatus: string
  responseCode: string
  responseMessage: string
  tranRef: string
  cartId: string
}

export function normalizeBillingStatus(value: unknown): TenantBillingStatus {
  if (value === 'paid' || value === 'pending' || value === 'failed' || value === 'unpaid') return value
  return 'unpaid'
}

export function isBillingPaid(value: unknown): boolean {
  return normalizeBillingStatus(value) === 'paid'
}

export function extractPaytabsStatus(payload: unknown): PaytabsStatus {
  const p = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>
  const paymentResult = (p.payment_result && typeof p.payment_result === 'object'
    ? p.payment_result
    : {}) as Record<string, unknown>

  return {
    responseStatus: String(paymentResult.response_status ?? p.respStatus ?? '').trim(),
    responseCode: String(paymentResult.response_code ?? p.respCode ?? '').trim(),
    responseMessage: String(paymentResult.response_message ?? p.respMessage ?? '').trim(),
    tranRef: String(p.tran_ref ?? p.tranRef ?? '').trim(),
    cartId: String(p.cart_id ?? p.cartId ?? '').trim(),
  }
}

const CHECKOUT_KEYS = [
  'redirect_url',
  'redirectUrl',
  'payment_url',
  'paymentUrl',
  'payment_link',
  'paymentLink',
  'url',
]

function findNestedUrl(input: unknown, depth = 0): string {
  if (depth > 4 || input == null) return ''
  if (typeof input === 'string') {
    return /^https?:\/\//i.test(input.trim()) ? input.trim() : ''
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      const found = findNestedUrl(item, depth + 1)
      if (found) return found
    }
    return ''
  }

  if (typeof input === 'object') {
    const obj = input as Record<string, unknown>

    for (const key of CHECKOUT_KEYS) {
      const candidate = obj[key]
      if (typeof candidate === 'string' && /^https?:\/\//i.test(candidate.trim())) {
        return candidate.trim()
      }
    }

    for (const value of Object.values(obj)) {
      const found = findNestedUrl(value, depth + 1)
      if (found) return found
    }
  }

  return ''
}

export function extractPaytabsCheckoutUrl(payload: unknown): string {
  return findNestedUrl(payload)
}
