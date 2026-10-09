import type { CollectionConfig } from 'payload'

import {
  anyone,
  canDeleteOwnMedia,
  canUpdateOwnMedia,
  fieldAdminOrManager,
  staffOnly,
} from '@/access'
import { assignUploadedBy } from '@/hooks'
import { revalidateInlineImages, revalidateInlineImagesDelete } from '@/hooks/revalidateFrontend'

/**
 * Image-only uploads used by Hero inline blocks. Reuses Media's access
 * helpers and ownership controls so Creators can manage their own uploads
 * while Admins/Managers manage all. No drafts, captions, or document kinds
 * - the inline block carries its own caption.
 */
export const InlineImages: CollectionConfig = {
  slug: 'inline-images',
  labels: {
    singular: 'Inline Image',
    plural: 'Inline Images',
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'],
    group: 'Content',
    description:
      'Image-only uploads for Hero inline blocks. Distinct from Media so authors cannot pick a generic Media image inside a Hero paragraph. Stored in R2 under the `inline-images` prefix.',
  },
  access: {
    create: staffOnly,
    read: anyone,
    update: canUpdateOwnMedia,
    delete: canDeleteOwnMedia,
  },
  hooks: {
    beforeChange: [assignUploadedBy],
    afterChange: [revalidateInlineImages],
    afterDelete: [revalidateInlineImagesDelete],
  },
  upload: {
    // Not supported on Workers yet due to lack of sharp
    crop: false,
    focalPoint: false,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Required accessibility text for images.',
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
