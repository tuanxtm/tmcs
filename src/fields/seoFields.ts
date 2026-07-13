import type { Field } from 'payload'

import { fieldAdminOrManager } from '@/access'
import { validateAbsoluteHttpUrl } from '@/lib/url'

/**
 * Reusable SEO field group.
 *
 * Backend stores the data needed for later frontend SEO rendering
 * (metadata, canonical, OG/Twitter, robots, JSON-LD). Rendering itself
 * is deferred to the frontend phase.
 */
export const seoFields = (options?: { includeArticleFields?: boolean }): Field => {
  const includeArticleFields = options?.includeArticleFields ?? true

  return {
    name: 'seo',
    type: 'group',
    label: 'SEO',
    admin: {
      description:
        'Search and social metadata. Frontend rendering (meta tags, sitemap, hreflang) comes later.',
    },
    fields: [
      {
        name: 'metaTitle',
        type: 'text',
        localized: true,
        maxLength: 70,
        admin: {
          description: 'Recommended 50–60 characters. Falls back to document title.',
        },
        validate: (value: string | null | undefined) => {
          if (!value) return true
          if (value.length > 70) return 'Meta title should be 70 characters or fewer'
          return true
        },
      },
      {
        name: 'metaDescription',
        type: 'textarea',
        localized: true,
        maxLength: 160,
        admin: {
          description: 'Recommended 140–160 characters. Falls back to excerpt/summary.',
        },
        validate: (value: string | null | undefined) => {
          if (!value) return true
          if (value.length > 160) return 'Meta description should be 160 characters or fewer'
          return true
        },
      },
      {
        name: 'canonicalUrl',
        type: 'text',
        admin: {
          description: 'Optional absolute canonical URL override.',
        },
        validate: validateAbsoluteHttpUrl,
      },
      {
        name: 'ogTitle',
        type: 'text',
        localized: true,
        admin: {
          description: 'Open Graph title override. Falls back to meta title / title.',
        },
      },
      {
        name: 'ogDescription',
        type: 'textarea',
        localized: true,
        admin: {
          description: 'Open Graph description override.',
        },
      },
      {
        name: 'ogImage',
        type: 'upload',
        relationTo: 'media',
        admin: {
          description: 'Open Graph image override. Falls back to featured/cover image.',
        },
      },
      {
        name: 'twitterCard',
        type: 'select',
        defaultValue: 'summary_large_image',
        options: [
          { label: 'Summary', value: 'summary' },
          { label: 'Summary large image', value: 'summary_large_image' },
        ],
      },
      {
        name: 'noIndex',
        type: 'checkbox',
        defaultValue: false,
        access: {
          update: fieldAdminOrManager,
        },
        admin: {
          description: 'Prevent search engines from indexing this document.',
        },
      },
      {
        name: 'noFollow',
        type: 'checkbox',
        defaultValue: false,
        access: {
          update: fieldAdminOrManager,
        },
      },
      ...(includeArticleFields
        ? ([
            {
              name: 'structuredData',
              type: 'group',
              label: 'Structured data (Article)',
              fields: [
                {
                  name: 'headline',
                  type: 'text',
                  localized: true,
                  admin: {
                    description: 'JSON-LD headline override.',
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  localized: true,
                },
                {
                  name: 'jsonLdOverride',
                  type: 'textarea',
                  access: {
                    update: fieldAdminOrManager,
                  },
                  admin: {
                    description:
                      'Optional raw JSON-LD object (Admin/Manager only). Must be valid JSON.',
                  },
                  validate: (value: string | null | undefined) => {
                    if (!value) return true
                    try {
                      const parsed = JSON.parse(value)
                      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                        return 'JSON-LD override must be a JSON object'
                      }
                      return true
                    } catch {
                      return 'JSON-LD override must be valid JSON'
                    }
                  },
                },
              ],
            },
          ] as Field[])
        : []),
    ],
  }
}
