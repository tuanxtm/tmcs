import type { Block } from 'payload'

import { linkFields } from '@/fields/common'
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
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'links',
      type: 'array',
      maxRows: 8,
      fields: linkFields,
    },
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
