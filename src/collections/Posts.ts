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
import { assignOwner, preventCreatorPublish, setPublishedAt, setReadingTime } from '@/hooks'
import { revalidatePosts, revalidatePostsDelete } from '@/hooks/revalidateFrontend'
import { buildPreviewUrl } from '@/lib/preview'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Post',
    plural: 'Posts',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', '_status', 'publishedAt', 'updatedAt'],
    group: 'Content',
    // Preview URL is prepared for the future frontend; the public preview page is deferred.
    preview: (doc, { locale }) => {
      const slug = typeof doc?.slug === 'string' ? doc.slug : ''
      // Frontend follow-up: implement /preview/posts/[slug] with draft mode auth.
      return buildPreviewUrl('posts', slug, locale)
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
    beforeChange: [assignOwner, preventCreatorPublish, setPublishedAt, setReadingTime],
    afterChange: [revalidatePosts],
    afterDelete: [revalidatePostsDelete],
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
              name: 'excerpt',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'Short summary used in listings and SEO fallbacks.',
              },
            },
            {
              name: 'content',
              type: 'richText',
              localized: true,
              required: true,
            },
            {
              name: 'featuredImage',
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
              ],
            },
            {
              name: 'relatedPosts',
              type: 'relationship',
              relationTo: 'posts',
              hasMany: true,
              filterOptions: ({ id }) => {
                if (!id) return true
                return {
                  id: {
                    not_equals: id,
                  },
                }
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [seoFields({ includeArticleFields: true, embeddedInTab: true })],
        },
      ],
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      admin: {
        position: 'sidebar',
      },
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
      name: 'readingTime',
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Estimated minutes; calculated from content.',
      },
    },
    publishedAtField(),
    {
      name: 'originalPublishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Optional original publication date if republishing older content.',
      },
    },
    ownerField(),
    translationReadyField(),
  ],
}
