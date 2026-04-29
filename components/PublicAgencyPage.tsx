'use client'

import { ThemePageProps } from './themes/shared'
import ThemeModern from './themes/ThemeModern'
import ThemeLuxury from './themes/ThemeLuxury'
import ThemeNature from './themes/ThemeNature'
import ThemeOcean from './themes/ThemeOcean'
import ThemeDesert from './themes/ThemeDesert'
import ThemeMidnight from './themes/ThemeMidnight'
import ThemeSunset from './themes/ThemeSunset'
import ThemeSlate from './themes/ThemeSlate'

export default function PublicAgencyPage(props: ThemePageProps) {
  const theme = props.tenant.theme ?? 'modern'
  if (theme === 'luxury') return <ThemeLuxury {...props} />
  if (theme === 'nature') return <ThemeNature {...props} />
  if (theme === 'ocean') return <ThemeOcean {...props} />
  if (theme === 'desert') return <ThemeDesert {...props} />
  if (theme === 'midnight') return <ThemeMidnight {...props} />
  if (theme === 'sunset') return <ThemeSunset {...props} />
  if (theme === 'slate') return <ThemeSlate {...props} />
  return <ThemeModern {...props} />
}
