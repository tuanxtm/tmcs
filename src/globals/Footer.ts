import type { GlobalConfig } from 'payload'

import { adminOrManager, anyone } from '@/access'
import { linkFields, socialLinkFields } from '@/fields/common'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
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
      name: 'text',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'groups',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'links',
          type: 'array',
          fields: linkFields,
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: socialLinkFields,
    },
    {
      name: 'legalLinks',
      type: 'array',
      fields: linkFields,
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
