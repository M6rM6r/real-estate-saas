import {
  extractPaytabsCheckoutUrl,
  extractPaytabsStatus,
  isBillingPaid,
  normalizeBillingStatus,
} from '@/lib/billing/paytabs'

describe('paytabs billing helpers', () => {
  it('normalizes billing status safely', () => {
    expect(normalizeBillingStatus('paid')).toBe('paid')
    expect(normalizeBillingStatus('pending')).toBe('pending')
    expect(normalizeBillingStatus('failed')).toBe('failed')
    expect(normalizeBillingStatus('unpaid')).toBe('unpaid')
    expect(normalizeBillingStatus('unknown')).toBe('unpaid')
    expect(normalizeBillingStatus(null)).toBe('unpaid')
  })

  it('detects paid status only', () => {
    expect(isBillingPaid('paid')).toBe(true)
    expect(isBillingPaid('pending')).toBe(false)
    expect(isBillingPaid('failed')).toBe(false)
  })

  it('extracts status from nested payment_result payload', () => {
    const parsed = extractPaytabsStatus({
      tran_ref: 'T123',
      cart_id: 'C123',
      payment_result: {
        response_status: 'A',
        response_code: '100',
        response_message: 'Authorized',
      },
    })

    expect(parsed).toEqual({
      responseStatus: 'A',
      responseCode: '100',
      responseMessage: 'Authorized',
      tranRef: 'T123',
      cartId: 'C123',
    })
  })

  it('extracts checkout URL from nested payloads', () => {
    expect(extractPaytabsCheckoutUrl({ redirect_url: 'https://checkout.example.com' })).toBe('https://checkout.example.com')
    expect(
      extractPaytabsCheckoutUrl({
        result: {
          payment_link: 'https://checkout.example.com/link',
        },
      }),
    ).toBe('https://checkout.example.com/link')
    expect(extractPaytabsCheckoutUrl({ result: { foo: 'bar' } })).toBe('')
  })
})
