import type { Block } from 'payload'

import { linkPickerField } from '@/fields/common'
import { richText } from '@/fields/richText'

/**
 * Page block rendered near the top of a page.
 *
 * `paragraph` uses the global `richText` editor so authors can insert
 * inline blocks (currently `inlineImage`) inside the hero paragraph via
 * the Lexical `+ Add` menu. Row-level page blocks are intentionally NOT
 * exposed here - that would re-introduce the schema recursion during
 * `generate:types` (`pageBlocks` includes `PageHeroBlock`; the walker
 * would loop). When row-level block insertion becomes a real need in the
 * hero, split `pageBlocks` into a recursive-safe subset (see
 * `src/blocks/index.ts`) and pass the safe subset to `richText.blocks`.
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
      editor: richText,
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
