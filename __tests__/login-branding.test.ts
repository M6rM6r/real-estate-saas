import { buildLoginBranding, getLoginDomainCandidates, getRequestHost, isInternalAppHost, normalizeHost } from '@/lib/login-branding';

describe('login branding helpers', () => {
  it('normalizes host values and strips ports', () => {
    expect(normalizeHost('M6R.finance:443')).toBe('m6r.finance');
    expect(normalizeHost(' https://Example.com:3000 ')).toBe('example.com');
  });

  it('detects internal app hosts', () => {
    expect(isInternalAppHost('localhost:3001')).toBe(true);
    expect(isInternalAppHost('127.0.0.1')).toBe(true);
    expect(isInternalAppHost('m6r.finance')).toBe(false);
  });

  it('creates common custom-domain candidates', () => {
    expect(getLoginDomainCandidates('https://m6r.finance:443')).toEqual(expect.arrayContaining([
      'm6r.finance',
      'www.m6r.finance',
      'http://m6r.finance',
      'https://m6r.finance',
      'http://www.m6r.finance',
      'https://www.m6r.finance',
      'm6r.finance/',
      'www.m6r.finance/',
      'https://m6r.finance/',
      'https://www.m6r.finance/',
    ]));
  });

  it('prefers x-forwarded-host when resolving request host', () => {
    const headers = new Headers({
      host: 'real-estate-saas--rewrew7.us-east4.hosted.app',
      'x-forwarded-host': 'm6r.finance',
    });

    expect(getRequestHost(headers)).toBe('m6r.finance');
  });

  it('prefers x-forwarded-host over x-request-host', () => {
    const headers = new Headers({
      host: 'real-estate-saas--rewrew7.us-east4.hosted.app',
      'x-forwarded-host': 'old-domain.example',
      'x-request-host': 'm6r.finance',
    });

    expect(getRequestHost(headers)).toBe('old-domain.example');
  });

  it('builds tenant-aware branding from tenant and profile data', () => {
    const branding = buildLoginBranding({
      host: 'm6r.finance:443',
      tenant: {
        name: 'M6R Finance',
        primary_color: '#d97706',
        custom_domain: 'm6r.finance',
        slug: 'scscsc',
      },
      profile: {
        logo_url: 'https://cdn.example.com/logo.png',
        cover_url: 'https://cdn.example.com/bg.png',
        tagline: 'Welcome back',
        page_config: { page_lang: 'en' },
      },
    });

    expect(branding.isTenantAware).toBe(true);
    expect(branding.brandName).toBe('M6R Finance');
    expect(branding.brandSubtitle).toBe('Welcome back');
    expect(branding.logoUrl).toBe('https://cdn.example.com/logo.png');
    expect(branding.backgroundImage).toBe('https://cdn.example.com/bg.png');
    expect(branding.accentColor).toBe('#d97706');
    expect(branding.initialLang).toBe('en');
    expect(branding.tenantBadge).toBe('m6r.finance');
  });

  it('falls back to Wa9l defaults when no tenant is resolved', () => {
    const branding = buildLoginBranding({ host: 'localhost:3001' });

    expect(branding.isTenantAware).toBe(false);
    expect(branding.brandName).toBe('Wa9l');
    expect(branding.logoUrl).toBe('/logo.png');
    expect(branding.backgroundImage).toBe('/gemini-bg.png');
    expect(branding.tenantBadge).toBeNull();
    expect(branding.footer).toContain('Wa9l');
  });
});