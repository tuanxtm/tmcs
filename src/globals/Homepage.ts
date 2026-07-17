import type { GlobalConfig } from 'payload'

import { adminOrManager, anyone } from '@/access'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  admin: {
    group: 'Settings',
    description: 'Curated homepage content. No frontend styling controls.',
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
      name: 'heroHeading',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'heroSubheading',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'profileSummary',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'featuredPosts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
    },
    {
      name: 'featuredProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
    },
    {
      name: 'activeDecorationPack',
      type: 'select',
      defaultValue: 'plant',
      options: [
        { label: 'Plant', value: 'plant' },
        { label: 'New Year', value: 'new-year' },
        { label: 'Christmas', value: 'christmas' },
      ],
      admin: {
        description:
          'Which Feed decorations pack fills leftover bento gaps. Add items under Content → Feed decorations.',
      },
    },
    {
      name: 'endOfFeed',
      type: 'group',
      admin: {
        description:
          'Single closing tile shown once at the end of the homepage feed. Not packed from Short stories.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show end-of-feed tile',
        },
        {
          name: 'eyebrow',
          type: 'text',
          localized: true,
          defaultValue: 'End of feed',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          required: true,
          defaultValue: 'Thanks for reading',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'message',
          type: 'textarea',
          localized: true,
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
            description: 'Short note — keep it compact for a feed tile.',
          },
        },
        {
          name: 'preferredShape',
          type: 'select',
          defaultValue: '2x1',
          options: [
            { label: '1 × 1', value: '1x1' },
            { label: '2 × 1', value: '2x1' },
            { label: '3 × 1', value: '3x1' },
            { label: '1 × 2', value: '1x2' },
            { label: '2 × 2', value: '2x2' },
          ],
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
            description: 'Preferred footprint. Falls back to the largest shape that fits the last gap.',
          },
        },
      ],
    },
  ],
}
