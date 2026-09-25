import type { Block } from 'payload'

import { linkPickerField } from '@/fields/common'
import { richTextWithoutBlock } from '@/fields/richTextWithoutBlock'

/**
 * Page block rendered at the bottom of a page.
 *
 * Uses `richTextWithoutBlock` to opt out of `BlocksFeature`. Without this
 * opt-out, `PageFooterBlock.footerText` would inherit the global editor,
 * which includes `BlocksFeature`, and create the same recursive schema that
 * `PageRichTextBlock.content` already guards against.
 */
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
      editor: richTextWithoutBlock,
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
