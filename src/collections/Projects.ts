import type { CollectionConfig } from 'payload'

import {
  canCreateOwnedContent,
  canDeleteOwnedContent,
  canReadOwnVersions,
  canUpdateOwnedContent,
  publishedOrOwned,
} from '@/access'
import { pageBlocks } from '@/blocks'
import { ownerField, publishedAtField, translationReadyField } from '@/fields/common'
import { seoFields } from '@/fields/seoFields'
import { slugField } from '@/fields/slug'
import { assignOwner, preventCreatorPublish, setPublishedAt } from '@/hooks'
import { revalidateProjects, revalidateProjectsDelete } from '@/hooks/revalidateFrontend'
import { deleteSlugReservations, upsertSlugReservations } from '@/hooks/slugReservations'
import { buildPreviewUrl } from '@/lib/preview'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: 'Project',
    plural: 'Projects',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', '_status', 'featured', 'updatedAt'],
    group: 'Content',
    // Preview URL prepared for future frontend; public preview page is deferred.
    preview: (doc, { locale }) => {
      const slug = typeof doc?.slug === 'string' ? doc.slug : ''
      return buildPreviewUrl('projects', slug, locale)
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
    create: canCreateOwnedContent,
    read: publishedOrOwned,
    update: canUpdateOwnedContent,
    delete: canDeleteOwnedContent,
    readVersions: canReadOwnVersions,
  },
  hooks: {
    beforeChange: [assignOwner, preventCreatorPublish, setPublishedAt],
    afterChange: [
      revalidateProjects,
      async ({ doc, operation, req }) => {
        if (operation === 'create' || operation === 'update') {
          await upsertSlugReservations(
            req.payload,
            'projects',
            doc as { id: number; slug?: unknown },
          )
        }
      },
    ],
    afterDelete: [
      revalidateProjectsDelete,
      async ({ doc, req }) => {
        await deleteSlugReservations(req.payload, 'projects', doc as { id: number })
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
              collectionSlug: 'projects',
            }),
            {
              name: 'summary',
              type: 'textarea',
              localized: true,
              required: true,
            },
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'content',
              type: 'richText',
              localized: true,
            },
            {
              name: 'layout',
              type: 'blocks',
              blocks: pageBlocks,
              admin: {
                description:
                  'Optional blocks rendered below the project body (CTAs, related feeds, footers, etc.).',
              },
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
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      admin: { position: 'sidebar' },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'templatePage',
      type: 'relationship',
      relationTo: 'pages',
      required: true,
      admin: {
        position: 'sidebar',
        description:
          "Required: the Page used to render this Project. Design the layout with a 'Detail - Project' block to control where the body appears.",
      },
    },
    publishedAtField(),
    ownerField(),
    translationReadyField(),
  ],
}
