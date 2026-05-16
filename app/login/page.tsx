import { headers } from 'next/headers';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { adminDb } from '@/lib/firebase-admin';
import LoginClient from './LoginClient';
import { findActiveTenantByHost } from '@/lib/tenant-domain';
import {
  buildLoginBranding,
  getRequestHost,
  type LoginProfileRecord,
  type LoginTenantRecord,
} from '@/lib/login-branding';

export const dynamic = 'force-dynamic';

async function resolveLoginContext() {
  const headersList = await headers();
  const host = getRequestHost(headersList);

  let tenant: LoginTenantRecord | null = null;
  let profile: LoginProfileRecord | null = null;

  try {
    const tenantMatch = await findActiveTenantByHost(host);
    if (tenantMatch) {
      tenant = { id: tenantMatch.id, ...tenantMatch.data } as LoginTenantRecord;

      const profileDoc = await adminDb
        .collection('tenants')
        .doc(tenantMatch.id)
        .collection('profiles')
        .doc(tenantMatch.id)
        .get();

      if (profileDoc.exists) {
        profile = profileDoc.data() as LoginProfileRecord;
      }
    }
  } catch (error) {
    console.error('Login tenant lookup failed:', error);
  }

  return {
    branding: buildLoginBranding({ tenant, profile, host }),
    tenantSlug: typeof tenant?.slug === 'string' ? tenant.slug.trim() : '',
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { branding } = await resolveLoginContext();

  return {
    title: branding.isTenantAware ? `${branding.brandName} — Login` : 'Wa9l — واصل',
    description: branding.brandSubtitle,
  };
}

export default async function LoginPage() {
  const { branding, tenantSlug } = await resolveLoginContext();
  if (tenantSlug) {
    redirect('/');
  }
  return <LoginClient branding={branding} />;
}