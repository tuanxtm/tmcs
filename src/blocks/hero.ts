import type { Block } from 'payload'

import { linkPickerField } from '@/fields/common'
import { slimRichTextEditor } from '@/fields/slimRichText'

export const LayoutHeroBlock: Block = {
  slug: 'layoutHero',
  labels: {
    singular: 'Layout - Hero',
    plural: 'Layout - Heroes',
  },
  fields: [
    {
      name: 'labelTitle',
      label: 'Label title',
      type: 'text',
      localized: true,
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'labelTagline',
      label: 'Label tagline',
      type: 'text',
      localized: true,
    },
    {
      name: 'tagline',
      type: 'text',
      localized: true,
    },
    {
      name: 'labelBio',
      type: 'text',
      localized: true,
    },
    {
      name: 'bio',
      type: 'richText',
      localized: true,
      editor: slimRichTextEditor,
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
