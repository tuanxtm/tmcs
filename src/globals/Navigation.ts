import type { GlobalConfig } from 'payload'

import { adminOrManager, anyone } from '@/access'
import { linkFields } from '@/fields/common'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  admin: {
    group: 'Settings',
  },
  access: {
    read: anyone,
    update: adminOrManager,
    readVersions: adminOrManager,
  },
  versions: {
    max: 25,
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      maxRows: 12,
      fields: [
        ...linkFields,
        {
          name: 'children',
          type: 'array',
          maxRows: 8,
          admin: {
            description: 'One nested level only.',
          },
          fields: linkFields,
        },
      ],
    },
  ],
}
