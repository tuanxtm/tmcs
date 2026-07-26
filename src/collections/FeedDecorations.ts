import type { CollectionConfig } from 'payload'

import {
  anyone,
  canDeleteOwnMedia,
  canUpdateOwnMedia,
  fieldAdminOrManager,
  staffOnly,
} from '@/access'
import { assignUploadedBy } from '@/hooks'
import {
  revalidateFeedDecorations,
  revalidateFeedDecorationsDelete,
} from '@/hooks/revalidateFrontend'

/**
 * WebP uploads for feed ornaments (R2).
 * Compose packs via Decoration packs → Items.
 * Creators may create ornaments and update/delete only their own (same as Media).
 */
export const FeedDecorations: CollectionConfig = {
  slug: 'feed-decorations',
  labels: {
    singular: 'Feed decoration',
    plural: 'Feed decorations',
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'],
    group: 'Decorations',
    hidden: true,
  },
  access: {
    create: staffOnly,
    read: anyone,
    update: canUpdateOwnMedia,
    delete: canDeleteOwnMedia,
  },
  hooks: {
    beforeChange: [assignUploadedBy],
    afterChange: [revalidateFeedDecorations],
    afterDelete: [revalidateFeedDecorationsDelete],
  },
  upload: {
    crop: false,
    focalPoint: false,
    mimeTypes: ['image/webp'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: {
        description: 'Optional label for admin (defaults from filename).',
      },
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      access: {
        update: fieldAdminOrManager,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
}
