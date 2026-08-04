import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { adminOrManager, publishedOrStaff } from '@/access'
import { pageBlocks } from '@/blocks'
import { publishedAtField, translationReadyField } from '@/fields/common'
import { seoFields } from '@/fields/seoFields'
import { setPublishedAt, validateHomePage } from '@/hooks'
import { revalidatePages, revalidatePagesDelete } from '@/hooks/revalidateFrontend'
import { buildPreviewUrl } from '@/lib/preview'

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
    description:
      'Home template documents power `/` and `/vi` via layout blocks. Other templates render at `/[slug]` and `/vi/[slug]`.',
    preview: (doc, { locale }) => {
      const slug = typeof doc?.slug === 'string' ? doc.slug : ''
      return buildPreviewUrl('pages', slug, locale)
    },
  },
  versions: {
    drafts: {
      // Autosave disabled — avoids D1 write storms while typing in Admin (Worker cost).
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
    beforeChange: [setPublishedAt, validateHomePage],
    afterChange: [revalidatePages],
    afterDelete: [revalidatePagesDelete],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
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
              name: 'heroMedia',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'layout',
              type: 'blocks',
              blocks: pageBlocks,
            },
          ],
        },
        {
          label: 'SEO',
          fields: [seoFields({ includeArticleFields: false, embeddedInTab: true })],
        },
      ],
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
        description:
          'Home powers `/` and `/vi`. Only one published Home page is allowed; it must include exactly one Hero block.',
      },
    },
    publishedAtField(),
    translationReadyField(),
  ],
}
