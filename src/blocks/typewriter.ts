import type { Block } from 'payload'

export const LayoutTypewriterBlock: Block = {
  slug: 'layoutTypewriter',
  labels: {
    singular: 'Layout - Typewriter',
    plural: 'Layout - Typewriter',
  },
  fields: [
    {
      name: 'stories',
      type: 'relationship',
      relationTo: 'short-stories',
      hasMany: true,
      required: true,
      admin: {
        description: 'Pick the short stories to cycle through. Order is preserved.',
      },
    },
  ],
}