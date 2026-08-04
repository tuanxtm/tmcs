import type { Block } from 'payload'

import { linkFields } from '@/fields/common'

export const CallToActionBlock: Block = {
  slug: 'callToAction',
  labels: {
    singular: 'Call to action',
    plural: 'Calls to action',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'links',
      type: 'array',
      maxRows: 3,
      fields: linkFields,
    },
  ],
}
