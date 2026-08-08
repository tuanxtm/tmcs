import type { Block } from 'payload'

import { linkPickerField } from '@/fields/common'

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
    linkPickerField({
      name: 'links',
      label: 'Links',
      description: 'Pick up to 3 links from the Links library.',
      hasMany: true,
      maxRows: 3,
    }),
  ],
}
