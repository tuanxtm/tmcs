import type { GlobalConfig } from 'payload'

import { adminOrManager, anyone, fieldAdminOrManager } from '@/access'
import { socialLinkFields } from '@/fields/common'
import { seoFields } from '@/fields/seoFields'
import { validateAbsoluteHttpUrl } from '@/lib/url'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: {
    group: 'Settings',
    description: 'Site-wide identity, contact display, and default SEO.',
  },
  access: {
    read: anyone,
    update: adminOrManager,
    readVersions: adminOrManager,
  },
  versions: {
    max: 25,
  },
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
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'ownerSummary',
      type: 'textarea',
      localized: true,
      label: 'Owner / profile summary',
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
      name: 'contactPhone',
      type: 'text',
    },
    {
      name: 'location',
      type: 'text',
      localized: true,
    },
    {
      name: 'defaultSocialImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: socialLinkFields,
    },
    {
      name: 'analytics',
      type: 'group',
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
    seoFields({ includeArticleFields: false }),
  ],
}
