import type { Block } from 'payload'

import { linkFields } from '@/fields/common'
import { slimRichTextEditor } from '@/fields/slimRichText'

export const FooterBlock: Block = {
  slug: 'footer',
  labels: {
    singular: 'Footer',
    plural: 'Footers',
  },
  fields: [
    {
      name: 'footerText',
      type: 'richText',
      localized: true,
      editor: slimRichTextEditor,
      label: 'Text',
    },
    {
      name: 'legalLinks',
      type: 'array',
      label: 'Legal links',
      fields: linkFields,
    },
    {
      name: 'copyright',
      type: 'text',
      localized: true,
      admin: {
        description: 'Use {{year}} as a placeholder for the current year in the frontend.',
      },
    },
  ],
}
