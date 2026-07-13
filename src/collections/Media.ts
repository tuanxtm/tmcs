import type { CollectionConfig } from 'payload'

import {
  anyone,
  canDeleteOwnMedia,
  canUpdateOwnMedia,
  fieldAdminOrManager,
  staffOnly,
} from '@/access'
import { assignUploadedBy } from '@/hooks'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'],
    group: 'Content',
    description:
      'Files stored in Cloudflare R2. SVG uploads are disallowed. Crop/focal-point transforms are disabled (no sharp on Workers).',
  },
  access: {
    create: staffOnly,
    read: anyone,
    update: canUpdateOwnMedia,
    delete: canDeleteOwnMedia,
  },
  hooks: {
    beforeChange: [assignUploadedBy],
  },
  upload: {
    // Not supported on Workers yet due to lack of sharp
    crop: false,
    focalPoint: false,
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'video/mp4',
      'video/webm',
    ],
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
      name: 'caption',
      type: 'text',
      localized: true,
    },
    {
      name: 'credit',
      type: 'text',
      localized: true,
    },
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'image',
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Document', value: 'document' },
        { label: 'Video', value: 'video' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'sourceUrl',
      type: 'text',
      admin: {
        description: 'Optional original source URL for attribution.',
      },
    },
    {
      name: 'dominantColor',
      type: 'text',
      admin: {
        description: 'Optional #RRGGBB placeholder color for progressive loading.',
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
