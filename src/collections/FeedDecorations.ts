import type { CollectionConfig } from 'payload'

import { adminOrManager, anyone } from '@/access'

export const DECORATION_PACKS = [
  { label: 'Plant', value: 'plant' },
  { label: 'New Year', value: 'new-year' },
  { label: 'Christmas', value: 'christmas' },
] as const

export type DecorationPack = (typeof DECORATION_PACKS)[number]['value']

const DECORATION_SHAPES = [
  { label: '1 × 1', value: '1x1' },
  { label: '2 × 1', value: '2x1' },
  { label: '1 × 2', value: '1x2' },
  { label: '2 × 2', value: '2x2' },
] as const

/**
 * Ornamental feed fillers (SVG markup). Media uploads disallow SVG, so art lives inline.
 * Activate a pack via Homepage → activeDecorationPack.
 */
export const FeedDecorations: CollectionConfig = {
  slug: 'feed-decorations',
  labels: {
    singular: 'Feed decoration',
    plural: 'Feed decorations',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'pack', 'weight', 'updatedAt'],
    group: 'Content',
    description:
      'Seasonal SVG ornaments used to fill leftover bento gaps. Swap packs from Homepage settings.',
  },
  access: {
    create: adminOrManager,
    read: anyone,
    update: adminOrManager,
    delete: adminOrManager,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Admin label only (e.g. Monstera leaf).',
      },
    },
    {
      name: 'pack',
      type: 'select',
      required: true,
      defaultValue: 'plant',
      options: [...DECORATION_PACKS],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'svgMarkup',
      type: 'textarea',
      required: true,
      admin: {
        description:
          'Inline SVG markup (root <svg>…</svg>). Scripts and event handlers are stripped on render.',
        rows: 12,
      },
    },
    {
      name: 'allowedShapes',
      type: 'select',
      hasMany: true,
      defaultValue: ['1x1'],
      options: [...DECORATION_SHAPES],
      admin: {
        position: 'sidebar',
        description: 'Leave empty to allow 1×1 only. Prefer 1×1 for plant ornaments.',
      },
    },
    {
      name: 'weight',
      type: 'number',
      defaultValue: 1,
      min: 1,
      max: 100,
      admin: {
        position: 'sidebar',
        description: 'Higher weight = more likely to be picked.',
      },
    },
  ],
}

export type DecorationShape = (typeof DECORATION_SHAPES)[number]['value']
