import type { Block } from 'payload'

export const PageTypewriterBlock: Block = {
  slug: 'pageTypewriter',
  labels: {
    singular: 'Page - Typewriter',
    plural: 'Page - Typewriter',
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
