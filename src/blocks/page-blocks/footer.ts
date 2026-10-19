import type { Block } from 'payload'

import { linkPickerField } from '@/fields/common'
import { heroRichText } from '@/fields/richText/heroRichText'

// Share Hero's inline-image editor without importing recursive page blocks.
export const PageFooterBlock: Block = {
  slug: 'pageFooter',
  labels: {
    singular: 'Page - Footer',
    plural: 'Page - Footers',
  },
  fields: [
    {
      name: 'footerText',
      type: 'richText',
      localized: true,
      editor: heroRichText,
      label: 'Text',
    },
    {
      name: 'labelSocialLinks',
      type: 'text',
      localized: true,
    },
    linkPickerField({
      name: 'socialLinks',
      label: 'Social links',
      description: 'Pick social links from the Links library.',
      hasMany: true,
      maxRows: 5,
    }),
    {
      name: 'labelOtherLinks',
      type: 'text',
      localized: true,
    },
    linkPickerField({
      name: 'otherLinks',
      label: 'Other links',
      description: 'Pick other links from the Links library.',
      hasMany: true,
      maxRows: 5,
    }),
    {
      name: 'cursorPopup',
      type: 'text',
      localized: true,
      defaultValue: 'footer',
      admin: {
        description: 'Cursor popup text while hovering this section.',
      },
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
