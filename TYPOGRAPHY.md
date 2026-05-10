# Typography & Font System

Centralized font management for consistent typography across all templates and pages.

## Quick Start

### Import and Use

```typescript
import { 
  getHeadingFont, 
  FONT_STACKS, 
  FONT_SIZES,
  TYPOGRAPHY_CLASSES,
  getTypographyStyle 
} from '@/lib/fonts'

// Get heading font with fallback
const headingFont = getHeadingFont(pageConfig.headingFont, themeFont)

// Apply typography style inline
<h1 style={getTypographyStyle('h1')}>Title</h1>

// Use predefined Tailwind classes
<h1 className={TYPOGRAPHY_CLASSES.h1}>Title</h1>
```

## Font Configuration

### Root Fonts (Tailwind)

Configured in `tailwind.config.ts`:

- `font-sans`: Inter (default) + Cairo as fallback
- `font-arabic`: Cairo (Arabic-first)
- `font-latin`: Inter (English-first)

### CSS Variables (layout.tsx)

- `--font-cairo`: Cairo Google Font (weights: 300-800)
- `--font-inter`: Inter Google Font (weights: 300-800)

## Available Heading Fonts

```typescript
HEADING_FONT_OPTIONS = {
  cairo: 'var(--font-cairo)',      // Arabic-optimized serif
  inter: 'var(--font-inter)',      // Modern sans-serif
  serif: 'Georgia, Times New Roman',
  playfair: 'Playfair Display',    // Elegant display
  poppins: 'Poppins',              // Round geometric
  montserrat: 'Montserrat',        // Urban bold
}
```

## Typography Scale

### Headings

| Scale | Size           | Weight | Usage              |
| ----- | -------------- | ------ | ------------------ |
| h1    | 40px (2.5rem)  | 700    | Page titles, hero  |
| h2    | 30px (1.875rem)| 700    | Section headers    |
| h3    | 24px (1.5rem)  | 700    | Subsections        |
| h4    | 20px (1.25rem) | 600    | Card titles        |
| h5    | 18px (1.125rem)| 600    | Smaller headings   |
| h6    | 16px (1rem)    | 600    | Label headings     |

### Body Text

| Scale  | Size               | Weight | Line Height | Usage              |
| ------ | ------------------ | ------ | ----------- | ------------------ |
| bodyLg | 18px (1.125rem)    | 400    | 1.6         | Large paragraphs   |
| body   | 16px (1rem)        | 400    | 1.65        | Default text       |
| bodySm | 15px (0.9375rem)   | 400    | 1.6         | Small text         |
| bodyXs | 14px (0.875rem)    | 400    | 1.5         | Caption text       |

### UI Elements

| Scale    | Size | Weight | Usage                 |
| -------- | ---- | ------ | --------------------- |
| button   | 16px | 500    | Button labels         |
| label    | 14px | 500    | Form labels           |
| caption  | 12px | 500    | Helper text           |
| tagline  | 18px | 500    | Taglines/subtitles    |
| subtitle | 16px | 500    | Secondary headings    |

## Usage Patterns

### 1. Responsive Hero Title

```typescript
import { RESPONSIVE_FONTS } from '@/lib/fonts'

<h1 className={`${RESPONSIVE_FONTS.heroTitle.mobile} ${RESPONSIVE_FONTS.heroTitle.tablet} ${RESPONSIVE_FONTS.heroTitle.desktop}`}>
  Title
</h1>
```

### 2. Theme-Aware Heading Font

```typescript
const headingFont = getHeadingFont(
  pageConfig.headingFont,  // User config
  pageTheme.headingFont    // Theme default
)

<h1 style={{ fontFamily: headingFont }}>Title</h1>
```

### 3. Inline Typography Styling

```typescript
import { getTypographyStyle } from '@/lib/fonts'

<p style={getTypographyStyle('bodyLg')}>
  Large paragraph
</p>
```

### 4. Predefined Classes

```typescript
import { TYPOGRAPHY_CLASSES } from '@/lib/fonts'

<h2 className={TYPOGRAPHY_CLASSES.h2}>
  Section Title
</h2>
```

## Theme Integration

Each theme component receives:

- `pageConfig.headingFont` - User-selected heading font
- `pageTheme.headingFont` - Theme's default heading font

Resolution order:

1. pageConfig.headingFont (user choice)
2. pageTheme.headingFont (theme default)
3. 'cairo' (application default)

## Best Practices

### ✅ Do

- Use `getHeadingFont()` for theme-aware fonts
- Use `TYPOGRAPHY_CLASSES` for consistent Tailwind sizing
- Use `FONT_STACKS` for multi-language support
- Keep font definitions in `lib/fonts.ts`

### ❌ Don't

- Hardcode font families in components
- Define font sizes scattered across files
- Use arbitrary Tailwind sizes (use `TYPOGRAPHY_CLASSES` instead)
- Duplicate font configuration logic

## Global Font Stack

```css
/* Default (LTR-friendly) */
font-family: Inter, Cairo, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif;

/* Language-specific */
:lang(en) → Inter first, then Cairo
:lang(ar) → Cairo first, then system fonts
```

## Extending the System

To add a new heading font option:

```typescript
// In lib/fonts.ts
export const HEADING_FONT_OPTIONS = {
  // ... existing options
  myCustomFont: '"My Font", serif',
}

// Type system auto-updates via HeadingFontKey type
```

To add typography scale variant:

```typescript
export const FONT_SIZES = {
  // ... existing scales
  display: { size: '3.75rem', weight: 800, lineHeight: 1.1 }, // 60px
}

export const TYPOGRAPHY_CLASSES = {
  // ... existing classes
  display: 'text-6xl sm:text-7xl lg:text-8xl font-black',
}
```

## File References

- **Font definitions**: [`lib/fonts.ts`](lib/fonts.ts)
- **Root font setup**: [`app/layout.tsx`](app/layout.tsx)
- **Global styles**: [`app/globals.css`](app/globals.css)
- **Tailwind config**: [`tailwind.config.ts`](tailwind.config.ts)
- **Shared utilities**: [`components/themes/shared.tsx`](components/themes/shared.tsx)

## Troubleshooting

**Heading font not applying?**

- Ensure `getHeadingFont()` is called correctly
- Check if `pageConfig.headingFont` is set in page builder
- Verify font name exists in `HEADING_FONT_OPTIONS`

**Font looks different on mobile?**

- Use `RESPONSIVE_FONTS` for different sizes per breakpoint
- Check if language-specific CSS in `globals.css` is interfering

**Adding custom Google Font?**

- Update `app/layout.tsx` to import new font
- Add to `HEADING_FONT_OPTIONS` in `lib/fonts.ts`
- Update CSP in `next.config.js` if from different origin
