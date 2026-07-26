/**
 * Shared TextStateFeature config for slim richText fields.
 * Keep this free of Payload package imports so it can be used in admin + frontend.
 *
 * Serif uses --font-fanwood directly (set by next/font on <html>). Prefer that over
 * --font-serif, which Tailwind's default theme can override.
 */
export const textStateConfig = {
  font: {
    sans: { label: 'Sans', css: { 'font-family': 'var(--font-sans)' } },
    mono: { label: 'Mono', css: { 'font-family': 'var(--font-mono)' } },
    serif: {
      label: 'Serif',
      // Fanwood has a smaller x-height than Geist; bump size for optical match.
      css: {
        'font-family': 'var(--font-fanwood), ui-serif, Georgia, serif',
        'font-size': '1.2em',
      },
    },
  },
} as const
