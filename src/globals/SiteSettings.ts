import type { GlobalConfig } from 'payload'

import { adminOrManager, anyone, fieldAdminOrManager } from '@/access'
import { linkFields } from '@/fields/common'
import { seoFields } from '@/fields/seoFields'
import { slimRichTextEditor } from '@/fields/slimRichText'
import { revalidateSiteShellGlobal } from '@/hooks/revalidateFrontend'
import { validateAbsoluteHttpUrl } from '@/lib/url'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: {
    group: 'Settings',
    description: 'Site-wide identity, navigation, footer, appearance, analytics, and default SEO.',
  },
  access: {
    read: anyone,
    update: adminOrManager,
    readVersions: adminOrManager,
  },
  hooks: {
    afterChange: [revalidateSiteShellGlobal],
  },
  versions: {
    max: 25,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'tagline',
              type: 'text',
              localized: true,
              admin: {
                description: 'Short line under the site name.',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'siteUrl',
              type: 'text',
              required: true,
              validate: validateAbsoluteHttpUrl,
              admin: {
                description: 'Canonical production site URL (no trailing slash preferred).',
              },
            },
            {
              name: 'contactEmail',
              type: 'email',
            },
            {
              name: 'bio',
              type: 'richText',
              localized: true,
              editor: slimRichTextEditor,
              label: 'Bio',
            },
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Cover image',
            },
            {
              name: 'profileImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Profile image',
            },
            {
              name: 'links',
              type: 'array',
              label: 'Links',
              labels: {
                singular: 'Link',
                plural: 'Links',
              },
              admin: {
                description: 'Website, social, and other profile links.',
              },
              fields: linkFields,
            },
          ],
        },
        {
          label: 'Navigation',
          fields: [
            {
              name: 'navigation',
              type: 'array',
              label: 'Items',
              maxRows: 12,
              labels: {
                singular: 'Item',
                plural: 'Items',
              },
              fields: [
                ...linkFields,
                {
                  name: 'children',
                  type: 'array',
                  maxRows: 8,
                  admin: {
                    description: 'One nested level only.',
                  },
                  fields: linkFields,
                },
              ],
            },
          ],
        },
        {
          label: 'Footer',
          fields: [
            {
              name: 'footerText',
              type: 'richText',
              localized: true,
              editor: slimRichTextEditor,
              label: 'Text',
            },
            {
              name: 'footerGroups',
              type: 'array',
              label: 'Groups',
              labels: {
                singular: 'Group',
                plural: 'Groups',
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  localized: true,
                  required: true,
                },
                {
                  name: 'links',
                  type: 'array',
                  fields: linkFields,
                },
              ],
            },
            {
              name: 'legalLinks',
              type: 'array',
              label: 'Legal links',
              fields: linkFields,
            },
            {
              name: 'copyright',
              type: 'text',
              localized: true,
              admin: {
                description: 'Use {{year}} as a placeholder for the current year in the frontend.',
              },
            },
          ],
        },
        {
          label: 'Appearance',
          fields: [
            {
              name: 'activeDecorationPack',
              type: 'relationship',
              relationTo: 'decoration-packs',
              required: true,
              admin: {
                description:
                  'Which decoration pack fills leftover bento gaps and supplies the footer SVG via its footer item.',
              },
            },
          ],
        },
        {
          label: 'Analytics',
          fields: [
            {
              name: 'analytics',
              type: 'group',
              label: false,
              access: {
                update: fieldAdminOrManager,
              },
              fields: [
                {
                  name: 'provider',
                  type: 'select',
                  options: [
                    { label: 'None', value: 'none' },
                    { label: 'Plausible', value: 'plausible' },
                    { label: 'Umami', value: 'umami' },
                    { label: 'Google Analytics', value: 'ga' },
                    { label: 'Other', value: 'other' },
                  ],
                  defaultValue: 'none',
                },
                {
                  name: 'siteId',
                  type: 'text',
                  admin: {
                    description: 'Placeholder for analytics site/measurement ID.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'defaultSocialImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'robots',
              type: 'group',
              fields: [
                {
                  name: 'indexSite',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Allow search engines to index the site by default',
                },
              ],
            },
            seoFields({ includeArticleFields: false, embeddedInTab: true }),
          ],
        },
      ],
    },
  ],
}
