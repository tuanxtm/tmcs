import type { CollectionConfig } from 'payload'

import {
  canCreateOwnedContent,
  canDeleteOwnedContent,
  canReadOwnVersions,
  canUpdateOwnedContent,
  publishedOrOwned,
} from '@/access'
import { ownerField, publishedAtField, translationReadyField } from '@/fields/common'
import { slugField } from '@/fields/slug'
import { assignOwner, preventCreatorPublish, setPublishedAt } from '@/hooks'
import { upsertSlugReservations, deleteSlugReservations } from '@/hooks/slugReservations'
import { revalidateThings, revalidateThingsDelete } from '@/hooks/revalidateFrontend'
import { validateAbsoluteHttpUrl } from '@/lib/url'

export const Things: CollectionConfig = {
  slug: 'things',
  labels: {
    singular: 'Thing',
    plural: 'Things',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', '_status', 'featured', 'publishedAt', 'updatedAt'],
    group: 'Content',
    description: 'Products and tools you use - affiliate links are localized (Amazon / Shopee).',
  },
  versions: {
    drafts: {
      // Autosave disabled - avoids D1 write storms while typing in Admin (Worker cost).
      schedulePublish: true,
      validate: false,
    },
    maxPerDoc: 10,
  },
  access: {
    create: canCreateOwnedContent,
    read: publishedOrOwned,
    update: canUpdateOwnedContent,
    delete: canDeleteOwnedContent,
    readVersions: canReadOwnVersions,
  },
  hooks: {
    beforeChange: [assignOwner, preventCreatorPublish, setPublishedAt],
    afterChange: [
      revalidateThings,
      async ({ doc, operation, req }) => {
        if (operation === 'create' || operation === 'update') {
          await upsertSlugReservations(req.payload, 'things', doc as { id: number; slug?: unknown })
        }
      },
    ],
    afterDelete: [
      revalidateThingsDelete,
      async ({ doc, req }) => {
        await deleteSlugReservations(req.payload, 'things', doc as { id: number })
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    ...slugField({
      useAsSlug: 'name',
      localized: true,
      required: true,
      collectionSlug: 'things',
    }),
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Short blurb shown in the Things detail drawer.',
      },
    },
    {
      name: 'primaryImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'The only image shown in the Things canvas and detail drawer.',
      },
    },
    {
      name: 'detailImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Retained for compatibility with stored content. Not displayed in the canvas or detail drawer.',
      },
    },
    {
      name: 'links',
      type: 'array',
      localized: false,
      labels: { singular: 'Platform Link', plural: 'Platform Links' },
      admin: {
        description: 'Links shown in the detail drawer.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: { description: 'Button text (e.g. Amazon, Shopee).' },
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          validate: validateAbsoluteHttpUrl,
        },
      ],
    },
    {
      name: 'primaryUrl',
      type: 'text',
      localized: true,
      validate: validateAbsoluteHttpUrl,
      admin: {
        position: 'sidebar',
        description: 'Select a link for image clicks and the Buy action.',
        components: {
          Field: '@/fields/arrayFieldSelect#ArrayFieldSelect',
        },
        arrayFieldSelect: {
          arrayField: 'links',
          rowFields: ['label', 'url'],
          emptyPlaceholder: 'Add links first',
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    publishedAtField(),
    ownerField(),
    translationReadyField(),
  ],
}
