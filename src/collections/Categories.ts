import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig } from 'payload'

import { adminOrManager, anyone } from '@/access'
import { slugField } from '@/fields/slug'
import { deleteSlugReservations, upsertSlugReservations } from '@/hooks/slugReservations'

const reserveSlug: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation === 'create' || operation === 'update') {
    await upsertSlugReservations(
      req.payload,
      'categories',
      doc as { id: number; slug?: unknown },
    )
  }
}

const releaseSlug: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await deleteSlugReservations(req.payload, 'categories', doc as { id: number })
}

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
  hooks: {
    afterChange: [reserveSlug],
    afterDelete: [releaseSlug],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    ...slugField({
      useAsSlug: 'title',
      localized: true,
      required: true,
      collectionSlug: 'categories',
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
