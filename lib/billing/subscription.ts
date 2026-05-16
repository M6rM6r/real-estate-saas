type TrialStateInput = {
  trial_expires_at?: string | null
  trial_started_at?: string | null
  subscription_status?: string | null
  billing_status?: string | null
}

export type TenantTrialState = {
  isTrialConfigured: boolean
  isTrialActive: boolean
  isTrialExpired: boolean
  daysLeft: number
  expiresAt: string | null
  subscriptionStatus: string
}

function toDate(value?: string | null): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function getTenantTrialState(input: TrialStateInput): TenantTrialState {
  const subscriptionStatus = String(input.subscription_status ?? '').toLowerCase() || 'unknown'
  const expiresDate = toDate(input.trial_expires_at)
  const now = new Date()
  const billingStatus = String(input.billing_status ?? '').toLowerCase()

  const isTrialConfigured = Boolean(expiresDate)
  const isPaid = billingStatus === 'paid'
  const isTrialActive = Boolean(
    !isPaid &&
      expiresDate &&
      expiresDate.getTime() > now.getTime() &&
      (subscriptionStatus === 'trial' || subscriptionStatus === 'active' || subscriptionStatus === 'unknown'),
  )

  const isTrialExpired = Boolean(
    !isPaid &&
      expiresDate &&
      expiresDate.getTime() <= now.getTime() &&
      (subscriptionStatus === 'trial' || subscriptionStatus === 'expired' || subscriptionStatus === 'unknown'),
  )

  const daysLeft = isTrialActive && expiresDate
    ? Math.max(0, Math.ceil((expiresDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
    : 0

  return {
    isTrialConfigured,
    isTrialActive,
    isTrialExpired,
    daysLeft,
    expiresAt: expiresDate ? expiresDate.toISOString() : null,
    subscriptionStatus,
  }
}
