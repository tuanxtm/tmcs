import type { Block } from 'payload'

export const ScrambleHoverBlock: Block = {
  slug: 'scramble-hover',
  labels: {
    singular: 'Scramble Hover',
    plural: 'Scramble Hover',
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
