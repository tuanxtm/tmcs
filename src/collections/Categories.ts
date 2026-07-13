import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { adminOrManager, anyone } from '@/access'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Category',
    plural: 'Categories',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'order', 'updatedAt'],
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
    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Optional hex color, e.g. #3366FF',
      },
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
