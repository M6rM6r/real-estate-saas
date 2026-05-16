'use client'

import type { ComponentType } from 'react'
import { ThemePageProps } from './themes/shared'
import ThemeModern from './themes/ThemeModern'
import ThemeLuxury from './themes/ThemeLuxury'
import ThemeNature from './themes/ThemeNature'
import ThemeOcean from './themes/ThemeOcean'
import ThemeDesert from './themes/ThemeDesert'
import ThemeMidnight from './themes/ThemeMidnight'

const THEME_COMPONENTS: Record<string, ComponentType<ThemePageProps>> = {
  modern: ThemeModern,
  luxury: ThemeLuxury,
  nature: ThemeNature,
  ocean: ThemeOcean,
  desert: ThemeDesert,
  midnight: ThemeMidnight,
  // Builder-only variants mapped to the closest premium base templates.
  minimal: ThemeModern,
  vintage: ThemeLuxury,
  neon: ThemeOcean,
  cosmic: ThemeMidnight,
}

const normalizeThemeId = (theme?: string | null) => theme?.trim().toLowerCase() ?? 'modern'

export function resolveThemeComponent(theme?: string | null): ComponentType<ThemePageProps> {
  const themeId = normalizeThemeId(theme)
  return THEME_COMPONENTS[themeId] ?? ThemeModern
}

export default function PublicAgencyPage(props: ThemePageProps) {
  const ThemeComponent = resolveThemeComponent(props.tenant.theme)
  return <ThemeComponent {...props} />
}
