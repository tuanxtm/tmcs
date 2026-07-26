/** Plant-pack WebP assets under public/ for seed. */

export const PLANT_DECORATION_SEEDS = [
  {
    title: 'Monstera',
    weight: 3,
    allowedShapes: ['1x1', '1x2'] as const,
    filename: 'plant-1.webp',
  },
  {
    title: 'Fern',
    weight: 2,
    allowedShapes: ['1x1', '1x2'] as const,
    filename: 'plant-2.webp',
  },
  {
    title: 'Flower',
    weight: 2,
    allowedShapes: ['1x1'] as const,
    filename: 'plant-3.webp',
  },
  {
    title: 'Sprout',
    weight: 2,
    allowedShapes: ['1x1'] as const,
    filename: 'plant-4.webp',
  },
  {
    title: 'Broad leaf',
    weight: 2,
    allowedShapes: ['1x1', '2x1'] as const,
    filename: 'plant-5.webp',
  },
] as const
