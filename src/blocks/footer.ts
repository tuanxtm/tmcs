import type { Block } from 'payload'

import { linkPickerField } from '@/fields/common'
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
    linkPickerField({
      name: 'legalLinks',
      label: 'Legal links',
      description: 'Pick legal links from the Links library.',
      hasMany: true,
      category: 'legal',
    }),
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
