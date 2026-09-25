import type { Block } from 'payload'

export const PageScrambleHoverBlock: Block = {
  slug: 'pageScrambleHover',
  labels: {
    singular: 'Page - Scramble hover',
    plural: 'Page - Scramble hover',
  },
  fields: [
    {
      name: 'stories',
      type: 'relationship',
      relationTo: 'short-stories',
      hasMany: true,
      required: true,
      admin: {
        description:
          'Pick the short stories to display. Each one scrambles on hover. Order is preserved.',
      },
    },
  ],
}
