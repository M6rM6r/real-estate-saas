import { cleanup, render, screen } from '@testing-library/react'
import PublicAgencyPage from '@/components/PublicAgencyPage'

jest.mock('@/components/themes/ThemeModern', () => ({
  __esModule: true,
  default: () => <div data-testid="theme-modern">modern</div>,
}))

jest.mock('@/components/themes/ThemeLuxury', () => ({
  __esModule: true,
  default: () => <div data-testid="theme-luxury">luxury</div>,
}))

jest.mock('@/components/themes/ThemeNature', () => ({
  __esModule: true,
  default: () => <div data-testid="theme-nature">nature</div>,
}))

jest.mock('@/components/themes/ThemeOcean', () => ({
  __esModule: true,
  default: () => <div data-testid="theme-ocean">ocean</div>,
}))

jest.mock('@/components/themes/ThemeDesert', () => ({
  __esModule: true,
  default: () => <div data-testid="theme-desert">desert</div>,
}))

jest.mock('@/components/themes/ThemeMidnight', () => ({
  __esModule: true,
  default: () => <div data-testid="theme-midnight">midnight</div>,
}))

const baseProps = {
  tenant: {
    id: 't1',
    name: 'Demo Tenant',
    slug: 'demo-tenant',
    primary_color: '#000000',
    theme: 'modern',
  },
  profile: null,
  listings: [],
  news: [],
  gallery: [],
  team: [],
} as any

const renderWithTheme = (theme?: string | null) => {
  cleanup()
  render(
    <PublicAgencyPage
      {...baseProps}
      tenant={{
        ...baseProps.tenant,
        theme,
      }}
    />,
  )
}

describe('PublicAgencyPage theme routing', () => {
  it('renders direct theme components', () => {
    renderWithTheme('luxury')
    expect(screen.getByTestId('theme-luxury')).toBeInTheDocument()
  })

  it('maps builder variants to premium base templates', () => {
    renderWithTheme('minimal')
    expect(screen.getByTestId('theme-modern')).toBeInTheDocument()

    renderWithTheme('vintage')
    expect(screen.getByTestId('theme-luxury')).toBeInTheDocument()

    renderWithTheme('neon')
    expect(screen.getByTestId('theme-ocean')).toBeInTheDocument()

    renderWithTheme('cosmic')
    expect(screen.getByTestId('theme-midnight')).toBeInTheDocument()
  })

  it('normalizes case/whitespace and falls back to modern for unknown values', () => {
    renderWithTheme('  MIDNIGHT  ')
    expect(screen.getByTestId('theme-midnight')).toBeInTheDocument()

    renderWithTheme('unsupported-theme')
    expect(screen.getByTestId('theme-modern')).toBeInTheDocument()

    renderWithTheme(undefined)
    expect(screen.getByTestId('theme-modern')).toBeInTheDocument()
  })
})
