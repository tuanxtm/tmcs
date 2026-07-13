import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { adminOrManager, anyone } from '@/access'

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: {
    singular: 'Tag',
    plural: 'Tags',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Taxonomies',
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
      localized: true,
    },
    slugField({
      name: 'slug',
      useAsSlug: 'title',
      localized: true,
      required: true,
    }),
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
  ],
}
