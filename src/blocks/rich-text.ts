import type { Block } from 'payload'

import { blockRichTextEditor } from '@/fields/blockRichText'

export const LayoutRichTextWithoutBlock: Block = {
  slug: 'layoutRichTextWithoutBlock',
  labels: {
    singular: 'Layout - Rich text (without block)',
    plural: 'Layout - Rich text (without block)',
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
      // Override the global editor to avoid the recursive schema when
      // `BlocksFeature` is enabled globally — see `blockRichTextEditor`.
      editor: blockRichTextEditor,
    },
  ],
}