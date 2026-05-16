import { getTenantTrialState } from '@/lib/billing/subscription'

describe('tenant trial state', () => {
  it('detects active trial and computes days left', () => {
    const expires = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    const state = getTenantTrialState({
      subscription_status: 'trial',
      trial_expires_at: expires,
      billing_status: 'unpaid',
    })

    expect(state.isTrialConfigured).toBe(true)
    expect(state.isTrialActive).toBe(true)
    expect(state.isTrialExpired).toBe(false)
    expect(state.daysLeft).toBeGreaterThanOrEqual(1)
  })

  it('detects expired trial', () => {
    const expires = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const state = getTenantTrialState({
      subscription_status: 'trial',
      trial_expires_at: expires,
      billing_status: 'unpaid',
    })

    expect(state.isTrialActive).toBe(false)
    expect(state.isTrialExpired).toBe(true)
    expect(state.daysLeft).toBe(0)
  })

  it('disables trial gating when already paid', () => {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const state = getTenantTrialState({
      subscription_status: 'active',
      trial_expires_at: expires,
      billing_status: 'paid',
    })

    expect(state.isTrialActive).toBe(false)
    expect(state.isTrialExpired).toBe(false)
    expect(state.daysLeft).toBe(0)
  })
})
