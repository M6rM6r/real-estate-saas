/**
 * Centralized Font Configuration System
 * Manages all typography across the application
 */

// Font family definitions - CSS variables injected via layout.tsx
export const FONT_FAMILIES = {
  cairo: 'var(--font-cairo)',
  inter: 'var(--font-inter)',
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI"',
} as const;

// Font stacks for different languages
export const FONT_STACKS = {
  // Primary: uses Cairo for Arabic, Inter for English
  sans: `${FONT_FAMILIES.inter}, ${FONT_FAMILIES.cairo}, ${FONT_FAMILIES.system}, sans-serif`,
  // Arabic-first stack
  arabic: `${FONT_FAMILIES.cairo}, sans-serif`,
  // Latin/English-first stack
  latin: `${FONT_FAMILIES.inter}, ${FONT_FAMILIES.system}, sans-serif`,
  // Monospace for technical content
  mono: 'Monaco, Menlo, Ubuntu Mono, monospace',
} as const;

// Typography scales for consistent sizing
export const FONT_SIZES = {
  // Headings
  h1: { size: '2.5rem', weight: 700, lineHeight: 1.2 }, // 40px
  h2: { size: '1.875rem', weight: 700, lineHeight: 1.25 }, // 30px
  h3: { size: '1.5rem', weight: 700, lineHeight: 1.25 }, // 24px
  h4: { size: '1.25rem', weight: 600, lineHeight: 1.3 }, // 20px
  h5: { size: '1.125rem', weight: 600, lineHeight: 1.3 }, // 18px
  h6: { size: '1rem', weight: 600, lineHeight: 1.35 }, // 16px

  // Body
  bodyLg: { size: '1.125rem', weight: 400, lineHeight: 1.6 }, // 18px
  body: { size: '1rem', weight: 400, lineHeight: 1.65 }, // 16px
  bodySm: { size: '0.9375rem', weight: 400, lineHeight: 1.6 }, // 15px
  bodyXs: { size: '0.875rem', weight: 400, lineHeight: 1.5 }, // 14px

  // UI
  button: { size: '1rem', weight: 500, lineHeight: 1.5 }, // 16px
  label: { size: '0.875rem', weight: 500, lineHeight: 1.5 }, // 14px
  caption: { size: '0.75rem', weight: 500, lineHeight: 1.4 }, // 12px

  // Tagline/subtitle
  tagline: { size: '1.125rem', weight: 500, lineHeight: 1.5 }, // 18px
  subtitle: { size: '1rem', weight: 500, lineHeight: 1.6 }, // 16px
} as const;

// Heading font options for themes
export const HEADING_FONT_OPTIONS = {
  cairo: FONT_FAMILIES.cairo,
  inter: FONT_FAMILIES.inter,
  serif: 'Georgia, "Times New Roman", serif',
  playfair: '"Playfair Display", serif',
  poppins: '"Poppins", sans-serif',
  montserrat: '"Montserrat", sans-serif',
} as const;

export type HeadingFontKey = keyof typeof HEADING_FONT_OPTIONS;

/**
 * Get heading font from config with fallback
 * @param configFont - Font from page config
 * @param themeFont - Font from theme defaults
 * @returns CSS font-family string
 */
export function getHeadingFont(
  configFont?: string | null,
  themeFont?: string | null
): string {
  if (configFont && HEADING_FONT_OPTIONS[configFont as HeadingFontKey]) {
    return HEADING_FONT_OPTIONS[configFont as HeadingFontKey];
  }
  if (themeFont && HEADING_FONT_OPTIONS[themeFont as HeadingFontKey]) {
    return HEADING_FONT_OPTIONS[themeFont as HeadingFontKey];
  }
  return FONT_FAMILIES.cairo; // Default to Cairo
}

/**
 * Typography utility styles for consistent application
 */
export const TYPOGRAPHY_CLASSES = {
  h1: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight',
  h2: 'text-3xl sm:text-4xl md:text-5xl font-bold leading-snug',
  h3: 'text-2xl sm:text-3xl font-bold leading-snug',
  h4: 'text-xl sm:text-2xl font-semibold leading-normal',
  h5: 'text-lg font-semibold leading-normal',
  h6: 'text-base font-semibold leading-normal',

  bodyLg: 'text-lg leading-relaxed',
  body: 'text-base leading-relaxed',
  bodySm: 'text-sm leading-relaxed',
  bodyXs: 'text-xs leading-relaxed',

  button: 'text-base font-medium',
  label: 'text-sm font-medium',
  caption: 'text-xs font-medium',

  tagline: 'text-lg font-medium',
  subtitle: 'text-base font-medium',
} as const;

/**
 * Get CSS style object for typography scale
 */
export function getTypographyStyle(scale: keyof typeof FONT_SIZES) {
  const config = FONT_SIZES[scale];
  return {
    fontSize: config.size,
    fontWeight: config.weight,
    lineHeight: config.lineHeight,
  } as const;
}

/**
 * Responsive font sizing for mobile-first design
 */
export const RESPONSIVE_FONTS = {
  heroTitle: {
    mobile: 'text-3xl',
    tablet: 'sm:text-4xl md:text-5xl',
    desktop: 'lg:text-6xl xl:text-7xl',
  },
  sectionHeading: {
    mobile: 'text-2xl',
    tablet: 'sm:text-3xl md:text-4xl',
    desktop: 'lg:text-5xl',
  },
  cardTitle: {
    mobile: 'text-lg',
    tablet: 'sm:text-xl md:text-2xl',
  },
  bodyText: {
    mobile: 'text-sm sm:text-base',
    tablet: 'md:text-lg',
  },
} as const;

/**
 * Combine heading font with Tailwind classes
 */
export function getHeadingClassName(
  scale: keyof typeof TYPOGRAPHY_CLASSES,
  headingFont?: string
): { className: string; style?: { fontFamily?: string } } {
  const baseClass = TYPOGRAPHY_CLASSES[scale];
  const style = headingFont ? { fontFamily: headingFont } : undefined;
  return { className: baseClass, ...(style && { style }) };
}
