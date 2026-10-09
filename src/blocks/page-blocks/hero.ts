import type { Block } from 'payload'

import { linkPickerField } from '@/fields/common'
import { heroRichText } from '@/fields/richText/heroRichText'

/**
 * Page block rendered near the top of a page.
 *
 * `paragraph` uses the Hero-only `heroRichText` editor so authors can
 * insert inline images (the `heroInlineImage` block) sourced from the
 * dedicated Inline Images collection. The Lexical `+ Add` menu inside the
 * Hero paragraph exposes only that one inline block.
 */
export const PageHeroBlock: Block = {
  slug: 'pageHero',
  labels: {
    singular: 'Page - Hero',
    plural: 'Page - Heroes',
  },
  fields: [
    {
      name: 'paragraph',
      type: 'richText',
      localized: true,
      editor: heroRichText,
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero image',
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
      defaultValue: 'scroll down',
      admin: {
        description: 'Cursor popup text while hovering this section.',
      },
    },
  ],
}
