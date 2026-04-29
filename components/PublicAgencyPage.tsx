'use client'

import { ThemePageProps } from './themes/shared'
import ThemeModern from './themes/ThemeModern'
import ThemeLuxury from './themes/ThemeLuxury'
import ThemeNature from './themes/ThemeNature'
import ThemeOcean from './themes/ThemeOcean'
import ThemeDesert from './themes/ThemeDesert'
import ThemeMidnight from './themes/ThemeMidnight'

export default function PublicAgencyPage(props: ThemePageProps) {
  const theme = props.tenant.theme ?? 'modern'
  if (theme === 'luxury') return <ThemeLuxury {...props} />
  if (theme === 'nature') return <ThemeNature {...props} />
  if (theme === 'ocean') return <ThemeOcean {...props} />
  if (theme === 'desert') return <ThemeDesert {...props} />
  if (theme === 'midnight') return <ThemeMidnight {...props} />
  return <ThemeModern {...props} />
}
