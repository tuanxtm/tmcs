import type { Block } from 'payload'

export const ContentGalleryBlock: Block = {
  slug: 'contentGallery',
  labels: {
    singular: 'Content - Gallery',
    plural: 'Content - Galleries',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          localized: true,
        },
      ],
    },
  ],
}