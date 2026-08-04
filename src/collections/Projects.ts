import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import {
  canCreateOwnedContent,
  canDeleteOwnedContent,
  canReadOwnVersions,
  canUpdateOwnedContent,
  publishedOrOwned,
} from '@/access'
import { ownerField, publishedAtField, translationReadyField } from '@/fields/common'
import { seoFields } from '@/fields/seoFields'
import { assignOwner, preventCreatorPublish, setPublishedAt } from '@/hooks'
import { revalidateProjects, revalidateProjectsDelete } from '@/hooks/revalidateFrontend'
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
      // Autosave disabled — avoids D1 write storms while typing in Admin (Worker cost).
      schedulePublish: true,
      validate: false,
    },
    maxPerDoc: 50,
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
    afterChange: [revalidateProjects],
    afterDelete: [revalidateProjectsDelete],
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
              required: true,
            },
            {
              name: 'content',
              type: 'richText',
              localized: true,
            },
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'gallery',
              type: 'array',
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'caption',
                  type: 'text',
                  localized: true,
                },
              ],
            },
            {
              name: 'relatedProjects',
              type: 'relationship',
              relationTo: 'projects',
              hasMany: true,
              filterOptions: ({ id }) => {
                if (!id) return true
                return { id: { not_equals: id } }
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
    publishedAtField(),
    ownerField(),
    translationReadyField(),
  ],
}
