import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { adminOrManager, anyone } from '@/access'
import {
  revalidateDecorationPacks,
  revalidateDecorationPacksDelete,
} from '@/hooks/revalidateFrontend'

const clearStaleFooterItem: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) return data

  const footerItem = typeof data.footerItem === 'string' ? data.footerItem : null
  if (!footerItem || footerItem === 'null') {
    data.footerItem = null
    return data
  }

  const items = Array.isArray(data.items) ? data.items : []
  const itemIds = new Set(
    items.flatMap((item) => {
      if (item && typeof item === 'object' && typeof item.id === 'string') {
        return [item.id]
      }
      return []
    }),
  )

  if (!itemIds.has(footerItem)) {
    data.footerItem = null
  }

  return data
}

export const DecorationPacks: CollectionConfig = {
  slug: 'decoration-packs',
  labels: {
    singular: 'Decoration pack',
    plural: 'Decoration packs',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Decorations',
    description:
      'Themed SVG ornament sets for the feed and footer. Activate one from Site settings → Appearance.',
  },
  access: {
    create: adminOrManager,
    read: anyone,
    update: adminOrManager,
    delete: adminOrManager,
  },
  hooks: {
    beforeChange: [clearStaleFooterItem],
    afterChange: [revalidateDecorationPacks],
    afterDelete: [revalidateDecorationPacksDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Admin label (e.g. Plant, New Year).',
      },
    },
    slugField({
      name: 'slug',
      useAsSlug: 'title',
      required: true,
    }),
    {
      name: 'items',
      type: 'array',
      labels: {
        singular: 'Feed decoration',
        plural: 'Feed decorations',
      },
      admin: {
        description:
          'Ornaments in this pack. Upload WebP images; they are stored as Feed decorations.',
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
          name: 'file',
          type: 'upload',
          relationTo: 'feed-decorations',
          required: true,
          admin: {
            description: 'SVG file stored in R2. Loaded on demand on the public site.',
          },
        },
        {
          name: 'weight',
          type: 'number',
          defaultValue: 1,
          min: 1,
          max: 100,
          admin: {
            description: 'Higher weight = more likely to be picked.',
          },
        },
      ],
    },
    {
      name: 'footerItem',
      type: 'text',
      admin: {
        position: 'sidebar',
        description:
          'Which ornament from Items appears in the bottom right corner of the footer while this pack is active.',
        components: {
          Field: '@/components/FooterItemSelect#FooterItemSelect',
        },
      },
    },
  ],
}
