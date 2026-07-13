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
  ],
}
