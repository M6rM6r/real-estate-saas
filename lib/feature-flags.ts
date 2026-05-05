export const FEATURE_FLAGS = {
  PYTHON_INTELLIGENCE: 'PYTHON_INTELLIGENCE',
  PHP_WEBHOOK_GATEWAY: 'PHP_WEBHOOK_GATEWAY',
  ADVANCED_OBSERVABILITY: 'ADVANCED_OBSERVABILITY',
  REPOSITORY_ADAPTERS: 'REPOSITORY_ADAPTERS',
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS

const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  PYTHON_INTELLIGENCE: false,
  PHP_WEBHOOK_GATEWAY: false,
  ADVANCED_OBSERVABILITY: true,
  REPOSITORY_ADAPTERS: true,
}

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const fromEnv = process.env[`FEATURE_${flag}`]
  if (fromEnv === 'true') return true
  if (fromEnv === 'false') return false
  return DEFAULT_FLAGS[flag]
}
