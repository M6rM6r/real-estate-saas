import { buildDomainOptions, pickSelectedDomainUrl, toAbsoluteUrl } from '@/app/dashboard/page-builder/utils'

describe('page builder domain utilities', () => {
  it('normalizes raw domain strings into https urls', () => {
    expect(toAbsoluteUrl('example.com')).toBe('https://example.com')
    expect(toAbsoluteUrl('https://example.com/')).toBe('https://example.com')
    expect(toAbsoluteUrl('')).toBe('')
    expect(toAbsoluteUrl(null)).toBe('')
  })

  it('builds a unique ordered list of domain options', () => {
    const options = buildDomainOptions({
      customDomain: 'custom.example.com',
      extraDomains: [
        'https://alpha.example.com',
        { domain: 'beta.example.com' },
        { url: 'https://alpha.example.com' },
        null,
      ],
      hostedUrl: 'https://wa9l.website/demo',
      runtimeOrigin: 'http://localhost:3000',
      slug: 'demo',
    })

    expect(options.map((o) => o.url)).toEqual([
      'https://custom.example.com',
      'https://alpha.example.com',
      'https://beta.example.com',
      'https://wa9l.website/demo',
      'http://localhost:3000/demo',
    ])
    expect(options[0].display).toBe('custom.example.com')
  })

  it('keeps the selected url when still valid and falls back otherwise', () => {
    const options = [
      { url: 'https://primary.example.com', display: 'primary.example.com' },
      { url: 'https://wa9l.website/demo', display: 'wa9l.website/demo' },
    ]

    expect(pickSelectedDomainUrl('https://primary.example.com', options, 'https://wa9l.website/demo')).toBe('https://primary.example.com')
    expect(pickSelectedDomainUrl('https://missing.example.com', options, 'https://wa9l.website/demo')).toBe('https://primary.example.com')
    expect(pickSelectedDomainUrl('', [], 'https://wa9l.website/demo')).toBe('https://wa9l.website/demo')
  })
})