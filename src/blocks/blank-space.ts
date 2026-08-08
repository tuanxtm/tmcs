import type { Block } from 'payload'

export const BlankSpaceBlock: Block = {
  slug: 'blankSpace',
  labels: {
    singular: 'Blank space',
    plural: 'Blank spaces',
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
