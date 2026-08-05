import type { Block } from 'payload'

export const TypewriterBlock: Block = {
  slug: 'typewriter',
  labels: {
    singular: 'Typewriter',
    plural: 'Typewriter',
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
