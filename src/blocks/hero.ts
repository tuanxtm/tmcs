import type { Block } from 'payload'

import { linkPickerField } from '@/fields/common'
import { slimRichTextEditor } from '@/fields/slimRichText'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: {
    singular: 'Hero',
    plural: 'Heroes',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      localized: true,
      admin: {
        description: 'Small label above the title (e.g. “Hero”).',
      },
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'tagline',
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
    linkPickerField({
      name: 'links',
      label: 'Links',
      description: 'Pick links from the Links library.',
      hasMany: true,
      maxRows: 8,
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
