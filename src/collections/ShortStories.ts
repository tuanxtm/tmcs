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
import { revalidateShortStories, revalidateShortStoriesDelete } from '@/hooks/revalidateFrontend'
import { validateAbsoluteHttpUrl } from '@/lib/url'

export const ShortStories: CollectionConfig = {
  slug: 'short-stories',
  labels: {
    singular: 'Short story',
    plural: 'Short stories',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'variant', '_status', 'publishedAt', 'updatedAt'],
    group: 'Content',
    description: 'Compact feed fillers used to pack empty regions in the homepage bento grid.',
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
    afterChange: [revalidateShortStories],
    afterDelete: [revalidateShortStoriesDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      required: true,
      admin: {
        description: 'Keep this short - it appears inside a compact feed tile.',
      },
    },
    {
      name: 'variant',
      type: 'select',
      required: true,
      defaultValue: 'note',
      options: [
        { label: 'Note', value: 'note' },
        { label: 'Quote', value: 'quote' },
        { label: 'Image', value: 'image' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_, siblingData) => siblingData?.variant === 'image',
        description: 'Required for image-variant stories in practice; optional for others.',
      },
    },
    {
      name: 'link',
      type: 'group',
      admin: {
        description: 'Optional destination when the story tile is clicked.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          label: 'Link this story',
        },
        {
          name: 'label',
          type: 'text',
          localized: true,
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'linkType',
          type: 'select',
          defaultValue: 'external',
          options: [
            { label: 'External URL', value: 'external' },
            { label: 'Internal page', value: 'internal' },
          ],
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          admin: {
            condition: (_, siblingData) =>
              Boolean(siblingData?.enabled) && siblingData?.linkType === 'internal',
          },
        },
        {
          name: 'url',
          type: 'text',
          validate: validateAbsoluteHttpUrl,
          admin: {
            condition: (_, siblingData) =>
              Boolean(siblingData?.enabled) && siblingData?.linkType === 'external',
          },
        },
        {
          name: 'newTab',
          type: 'checkbox',
          defaultValue: true,
          label: 'Open in new tab',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
      ],
    },
    publishedAtField(),
    ownerField(),
    translationReadyField(),
  ],
}
