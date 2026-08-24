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
import { assignOwner, preventCreatorPublish, setPublishedAt, setReadingTime } from '@/hooks'
import { revalidatePosts, revalidatePostsDelete } from '@/hooks/revalidateFrontend'
import { deleteSlugReservations, upsertSlugReservations } from '@/hooks/slugReservations'
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
    beforeChange: [assignOwner, preventCreatorPublish, setPublishedAt, setReadingTime],
    afterChange: [
      revalidatePosts,
      async ({ doc, operation, req }) => {
        if (operation === 'create' || operation === 'update') {
          await upsertSlugReservations(req.payload, 'posts', doc as { id: number; slug?: unknown })
        }
      },
    ],
    afterDelete: [
      revalidatePostsDelete,
      async ({ doc, req }) => {
        await deleteSlugReservations(req.payload, 'posts', doc as { id: number })
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
              collectionSlug: 'posts',
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
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'content',
              type: 'richText',
              localized: true,
              required: true,
            },
            {
              name: 'layout',
              type: 'blocks',
              blocks: pageBlocks,
              admin: {
                description:
                  'Optional blocks rendered below the article body (CTAs, related feeds, footers, etc.).',
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
