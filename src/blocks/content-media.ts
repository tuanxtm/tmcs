import type { Block } from 'payload'

export const ContentMediaBlock: Block = {
  slug: 'contentMedia',
  labels: {
    singular: 'Content - Media',
    plural: 'Content - Media',
  },
  fields: [
    {
      name: 'media',
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
}