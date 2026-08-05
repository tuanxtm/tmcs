import type { CollectionConfig } from 'payload'

import {
  canCreateOwnedContent,
  canDeleteOwnedContent,
  canReadOwnVersions,
  canUpdateOwnedContent,
  publishedOrOwned,
} from '@/access'
import { ownerField, publishedAtField, translationReadyField } from '@/fields/common'
import { assignOwner, preventCreatorPublish, setPublishedAt } from '@/hooks'
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
    description: 'Products and tools you use — affiliate links are localized (Amazon / Shopee).',
  },
  versions: {
    drafts: {
      // Autosave disabled — avoids D1 write storms while typing in Admin (Worker cost).
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
    afterChange: [revalidateThings],
    afterDelete: [revalidateThingsDelete],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Short blurb shown in the Things showcase panel.',
      },
    },
    {
      name: 'primaryImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Large showcase image (left / top).',
      },
    },
    {
      name: 'detailImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional smaller panel image. Falls back to the primary image when empty.',
      },
    },
    {
      name: 'affiliateUrl',
      type: 'text',
      localized: true,
      validate: validateAbsoluteHttpUrl,
      admin: {
        description:
          'Localized shop link (e.g. Amazon for English, Shopee for Vietnamese). Empty locales fall back to English, then a contact dialog.',
      },
    },
    {
      name: 'linkLabel',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional CTA label (defaults to “Shop” / “Mua”).',
      },
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
