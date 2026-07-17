/** Inline plant-pack SVGs for seed. currentColor inherits tile foreground. */

export const PLANT_DECORATION_SEEDS = [
  {
    title: 'Monstera leaf',
    pack: 'plant' as const,
    weight: 3,
    allowedShapes: ['1x1', '1x2'] as const,
    svgMarkup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" aria-hidden="true">
  <path fill="currentColor" d="M60 108c-2-18 4-34 16-48 8-10 18-18 28-22-14 2-28 10-38 22-4-16-2-32 6-46-18 10-30 28-34 48-8-12-22-20-36-22 12 8 22 20 28 34-14 6-24 18-28 34 18-8 36-6 52 4 8-14 22-24 40-28-16 10-26 24-30 42z"/>
</svg>`,
  },
  {
    title: 'Fern frond',
    pack: 'plant' as const,
    weight: 2,
    allowedShapes: ['1x1', '1x2'] as const,
    svgMarkup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" aria-hidden="true">
  <path stroke="currentColor" stroke-width="3" stroke-linecap="round" d="M60 110V18"/>
  <path fill="currentColor" d="M60 28c-14 2-26 8-34 16 10-2 20 0 28 6-12 4-22 12-28 22 12-4 24-4 34 2-10 8-16 18-18 30 10-8 22-12 34-12-8 10-10 22-8 34 8-12 20-20 34-24-12-2-22-10-28-20 12 0 24 2 34-2-10-8-16-18-18-30 12 4 24 2 34-4-10-6-22-8-34-6 8-8 12-18 12-28-12 6-24 8-36 6z"/>
</svg>`,
  },
  {
    title: 'Simple flower',
    pack: 'plant' as const,
    weight: 2,
    allowedShapes: ['1x1'] as const,
    svgMarkup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" aria-hidden="true">
  <circle cx="60" cy="52" r="10" fill="currentColor"/>
  <circle cx="60" cy="28" r="14" fill="currentColor" opacity="0.75"/>
  <circle cx="82" cy="40" r="14" fill="currentColor" opacity="0.75"/>
  <circle cx="82" cy="64" r="14" fill="currentColor" opacity="0.75"/>
  <circle cx="60" cy="76" r="14" fill="currentColor" opacity="0.75"/>
  <circle cx="38" cy="64" r="14" fill="currentColor" opacity="0.75"/>
  <circle cx="38" cy="40" r="14" fill="currentColor" opacity="0.75"/>
  <path stroke="currentColor" stroke-width="3" stroke-linecap="round" d="M60 86v24"/>
  <path stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" d="M60 100c-10 2-18 8-22 16"/>
</svg>`,
  },
  {
    title: 'Sprout',
    pack: 'plant' as const,
    weight: 2,
    allowedShapes: ['1x1'] as const,
    svgMarkup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" aria-hidden="true">
  <path stroke="currentColor" stroke-width="3.5" stroke-linecap="round" d="M60 104V58"/>
  <path fill="currentColor" d="M60 58c-2-18-14-30-32-36 8 16 10 30 4 42 14-2 24-4 28-6z"/>
  <path fill="currentColor" d="M60 52c4-16 16-28 34-32-10 16-12 28-6 40-14 0-24 0-28-8z"/>
</svg>`,
  },
  {
    title: 'Broad leaf',
    pack: 'plant' as const,
    weight: 2,
    allowedShapes: ['1x1', '2x1'] as const,
    svgMarkup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" aria-hidden="true">
  <path fill="currentColor" d="M60 104c0-28 8-48 28-68 4 22-2 42-16 58 18-8 34-8 48 2-20 8-38 6-52-4-2 8-6 14-12 18-10-20-10-40 0-58-12 14-18 32-18 52-12-12-18-28-16-48C38 42 52 28 72 20c-22 18-28 40-24 64 8-4 14-4 20-2z"/>
</svg>`,
  },
  {
    title: 'Trailing vine',
    pack: 'plant' as const,
    weight: 1,
    allowedShapes: ['1x1', '2x1', '1x2'] as const,
    svgMarkup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" aria-hidden="true">
  <path stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" d="M24 96c16-20 28-20 44-8s28 8 40-12"/>
  <circle cx="36" cy="78" r="8" fill="currentColor" opacity="0.85"/>
  <circle cx="58" cy="70" r="7" fill="currentColor" opacity="0.85"/>
  <circle cx="80" cy="78" r="8" fill="currentColor" opacity="0.85"/>
  <circle cx="98" cy="62" r="7" fill="currentColor" opacity="0.85"/>
</svg>`,
  },
] as const
