export type DomainOption = {
  url: string;
  display: string;
}

export function toAbsoluteUrl(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withScheme);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    return '';
  }
}

export function buildDomainOptions(params: {
  customDomain?: unknown;
  extraDomains?: unknown[];
  hostedUrl: string;
  runtimeOrigin?: string;
  slug?: string;
}): DomainOption[] {
  const { customDomain, extraDomains = [], hostedUrl, runtimeOrigin, slug = '' } = params;

  const extraDomainUrls = extraDomains
    .map((entry: unknown) => {
      if (typeof entry === 'string') return toAbsoluteUrl(entry);
      if (entry && typeof entry === 'object') {
        const e = entry as Record<string, unknown>;
        return toAbsoluteUrl(e.url ?? e.domain ?? e.hostname ?? e.host ?? e.name);
      }
      return '';
    })
    .filter(Boolean) as string[];

  const customDomainUrl = toAbsoluteUrl(customDomain);
  const runtimeSlugUrl = runtimeOrigin ? toAbsoluteUrl(`${runtimeOrigin}${slug ? `/${slug}` : '/'}`) : '';

  return Array.from(new Set([
    customDomainUrl,
    ...extraDomainUrls,
    hostedUrl,
    runtimeSlugUrl,
  ].filter(Boolean))).map((url) => ({
    url,
    display: url.replace(/^https?:\/\//, ''),
  }));
}

export function pickSelectedDomainUrl(
  selectedDomainUrl: string,
  domainOptions: DomainOption[],
  fallbackUrl: string,
): string {
  return domainOptions.some((d) => d.url === selectedDomainUrl)
    ? selectedDomainUrl
    : domainOptions[0]?.url || fallbackUrl;
}