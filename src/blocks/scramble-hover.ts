import type { Block } from 'payload'

export const LayoutScrambleHoverBlock: Block = {
  slug: 'layoutScrambleHover',
  labels: {
    singular: 'Layout - Scramble Hover',
    plural: 'Layout - Scramble Hover',
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