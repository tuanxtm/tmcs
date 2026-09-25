import type { Block } from 'payload'

export const PageBlankSpaceBlock: Block = {
  slug: 'pageBlankSpace',
  labels: {
    singular: 'Page - Blank space',
    plural: 'Page - Blank spaces',
  },
  fields: [
    {
      name: 'height',
      type: 'text',
      defaultValue: '60vh',
      admin: {
        description: 'CSS height for the blank section (e.g. 60vh, 400px, 5rem).',
      },
    },
  ],
}
