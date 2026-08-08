import type { CollectionConfig } from 'payload'

import { adminOrManager, anyone } from '@/access'
import {
  revalidateLinks,
  revalidateLinksDelete,
} from '@/hooks/revalidateFrontend'
import { validateAbsoluteHttpUrl } from '@/lib/url'

/**
 * Centralized link library.
 *
 * Single source of truth for shareable links (About, Instagram, GitHub, etc.).
 * Blocks (Hero, CTA, Footer) and SiteSettings → Navigation reference Links
 * via the `linkPickerField` relationship. Changing a link here updates every
 * reference automatically.
 */
export const Links: CollectionConfig = {
  slug: 'links',
  labels: {
    singular: 'Link',
    plural: 'Links',
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'linkType', 'category', 'updatedAt'],
    group: 'Site',
    description:
      'Centralized link library. Reference these from navigation, hero, CTA, and footer blocks.',
  },
  access: {
    create: adminOrManager,
    read: anyone,
    update: adminOrManager,
    delete: adminOrManager,
  },
  hooks: {
    afterChange: [revalidateLinks],
    afterDelete: [revalidateLinksDelete],
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      localized: true,
      required: true,
      admin: {
        description: 'Visible label rendered on the public site.',
      },
    },
    {
      name: 'category',
      type: 'select',
      defaultValue: 'navigation',
      options: [
        { label: 'Navigation', value: 'navigation' },
        { label: 'Social', value: 'social' },
        { label: 'Legal', value: 'legal' },
        { label: 'Contact', value: 'contact' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Hint for which surfaces typically show this link. Picker fields may filter by category.',
      },
    },
    {
      name: 'linkType',
      type: 'select',
      required: true,
      defaultValue: 'internal',
      options: [
        { label: 'Internal page', value: 'internal' },
        { label: 'External URL', value: 'external' },
      ],
    },
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      admin: {
        condition: (_, siblingData) => siblingData?.linkType === 'internal',
      },
    },
    {
      name: 'url',
      type: 'text',
      validate: validateAbsoluteHttpUrl,
      admin: {
        condition: (_, siblingData) => siblingData?.linkType === 'external',
      },
    },
    {
      name: 'newTab',
      type: 'checkbox',
      defaultValue: false,
      label: 'Open in new tab',
    },
  ],
}
