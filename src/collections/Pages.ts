import type { CollectionConfig } from 'payload'

import { adminOrManager, publishedOrStaff } from '@/access'
import { pageBlocks } from '@/blocks'
import { publishedAtField, translationReadyField } from '@/fields/common'
import { seoFields } from '@/fields/seoFields'
import { slugField } from '@/fields/slug'
import { setPublishedAt, validateHomePage } from '@/hooks'
import { revalidatePages, revalidatePagesDelete } from '@/hooks/revalidateFrontend'
import { deleteSlugReservations, upsertSlugReservations } from '@/hooks/slugReservations'
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
      // Autosave disabled - avoids D1 write storms while typing in Admin (Worker cost).
      schedulePublish: true,
      validate: false,
    },
    maxPerDoc: 10,
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
    afterChange: [
      revalidatePages,
      async ({ doc, operation, req }) => {
        if (operation === 'create' || operation === 'update') {
          await upsertSlugReservations(req.payload, 'pages', doc as { id: number; slug?: unknown })
        }
      },
    ],
    afterDelete: [
      revalidatePagesDelete,
      async ({ doc, req }) => {
        await deleteSlugReservations(req.payload, 'pages', doc as { id: number })
      },
    ],
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
            ...slugField({
              useAsSlug: 'title',
              localized: true,
              required: true,
              collectionSlug: 'pages',
            }),
            {
              name: 'summary',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'pageImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Page image',
              admin: {
                description:
                  'Shared page image used as the hero/backdrop and as the OG image fallback.',
              },
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
