import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig } from 'payload'

import { adminOrManager, anyone } from '@/access'
import { slugField } from '@/fields/slug'
import { deleteSlugReservations, upsertSlugReservations } from '@/hooks/slugReservations'

const reserveSlug: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation === 'create' || operation === 'update') {
    await upsertSlugReservations(req.payload, 'tags', doc as { id: number; slug?: unknown })
  }
}

const releaseSlug: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await deleteSlugReservations(req.payload, 'tags', doc as { id: number })
}

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
      collectionSlug: 'tags',
    }),
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
  ],
}
