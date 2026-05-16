import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { adminDb } from '@/lib/firebase-admin'
import SignupClient from './SignupClient'
import { findActiveTenantByHost } from '@/lib/tenant-domain'
import {
  buildLoginBranding,
  getRequestHost,
  type LoginProfileRecord,
  type LoginTenantRecord,
} from '@/lib/login-branding'

export const dynamic = 'force-dynamic'

async function resolveSignupContext() {
  const headersList = await headers()
  const host = getRequestHost(headersList)

  let tenant: LoginTenantRecord | null = null
  let profile: LoginProfileRecord | null = null

  try {
    const tenantMatch = await findActiveTenantByHost(host)
    if (tenantMatch) {
      tenant = { id: tenantMatch.id, ...tenantMatch.data } as LoginTenantRecord

      const profileDoc = await adminDb
        .collection('tenants')
        .doc(tenantMatch.id)
        .collection('profiles')
        .doc(tenantMatch.id)
        .get()

      if (profileDoc.exists) {
        profile = profileDoc.data() as LoginProfileRecord
      }
    }
  } catch (error) {
    console.error('Signup tenant lookup failed:', error)
  }

  return {
    branding: buildLoginBranding({ tenant, profile, host }),
    tenantSlug: typeof tenant?.slug === 'string' ? tenant.slug.trim() : '',
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { branding } = await resolveSignupContext()

  return {
    title: branding.isTenantAware ? `${branding.brandName} — Sign up` : 'Wa9l — Create account',
    description: branding.brandSubtitle,
  }
}

export default async function SignupPage() {
  const { branding, tenantSlug } = await resolveSignupContext()
  if (tenantSlug) {
    redirect('/login')
  }
  return <SignupClient branding={branding} />
}