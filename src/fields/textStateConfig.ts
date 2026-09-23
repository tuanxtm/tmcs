/**
 * Shared TextStateFeature config for slim richText fields.
 * Keep this free of Payload package imports so it can be used in admin + frontend.
 *
 * Serif uses --font-bitter directly (set by next/font on <html>). Prefer that over
 * --font-serif, which Tailwind's default theme can override.
 */
export const textStateConfig = {
  font: {
    sans: { label: 'Sans', css: { 'font-family': 'var(--font-sans)' } },
    mono: { label: 'Mono', css: { 'font-family': 'var(--font-mono)' } },
    serif: {
      label: 'Serif',
      css: {
        'font-family': 'var(--font-bitter), ui-serif, Georgia, serif',
      },
    },
  },
} as const
