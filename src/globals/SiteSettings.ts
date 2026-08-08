import type { GlobalConfig } from 'payload'

import { adminOrManager, anyone, fieldAdminOrManager } from '@/access'
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
    max: 10,
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
              name: 'profileLinks',
              type: 'relationship',
              relationTo: 'links',
              hasMany: true,
              label: 'Profile links',
              admin: {
                description: 'Website, social, and other profile links (contact dialogs, etc.).',
              },
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
              admin: {
                description:
                  'Pick links from the Links collection. Each item may have one nested level of children.',
              },
              fields: [
                {
                  name: 'link',
                  type: 'relationship',
                  relationTo: 'links',
                  required: true,
                  admin: {
                    description: 'Pick a link from the Links collection.',
                  },
                },
                {
                  name: 'children',
                  type: 'array',
                  maxRows: 8,
                  admin: {
                    description: 'One nested level only.',
                  },
                  fields: [
                    {
                      name: 'link',
                      type: 'relationship',
                      relationTo: 'links',
                      required: true,
                    },
                  ],
                },
              ],
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
