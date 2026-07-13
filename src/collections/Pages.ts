import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { adminOrManager, publishedOrStaff } from '@/access'
import { pageBlocks } from '@/blocks'
import { publishedAtField, translationReadyField } from '@/fields/common'
import { seoFields } from '@/fields/seoFields'
import { setPublishedAt } from '@/hooks'
import { getServerURL } from '@/lib/env'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'template', '_status', 'updatedAt'],
    group: 'Content',
    preview: (doc, { locale }) => {
      const slug = typeof doc?.slug === 'string' ? doc.slug : ''
      const base = getServerURL()
      return `${base}/preview/pages/${slug}?locale=${locale || 'en'}`
    },
  },
  versions: {
    drafts: {
      autosave: {
        interval: 375,
      },
      schedulePublish: true,
      validate: false,
    },
    maxPerDoc: 50,
  },
  access: {
    create: adminOrManager,
    read: publishedOrStaff,
    update: adminOrManager,
    delete: adminOrManager,
    readVersions: adminOrManager,
  },
  hooks: {
    beforeChange: [setPublishedAt],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    slugField({
      name: 'slug',
      useAsSlug: 'title',
      localized: true,
      required: true,
    }),
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'template',
      type: 'select',
      required: true,
      defaultValue: 'generic',
      options: [
        { label: 'Home', value: 'home' },
        { label: 'About', value: 'about' },
        { label: 'Contact', value: 'contact' },
        { label: 'Generic', value: 'generic' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Stable template key for the future frontend. No styling encoded here.',
      },
    },
    {
      name: 'heroMedia',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: pageBlocks,
    },
    publishedAtField(),
    translationReadyField(),
    seoFields({ includeArticleFields: false }),
  ],
}
