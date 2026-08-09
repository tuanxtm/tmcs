import type { Block } from 'payload'

export const LayoutBlankSpaceBlock: Block = {
  slug: 'layoutBlankSpace',
  labels: {
    singular: 'Layout - Blank space',
    plural: 'Layout - Blank spaces',
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