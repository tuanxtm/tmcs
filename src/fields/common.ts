import type { Field } from 'payload'

import { fieldAdminOrManager } from '@/access'
import { validateAbsoluteHttpUrl } from '@/lib/url'

export const linkFields: Field[] = [
  {
    name: 'label',
    type: 'text',
    localized: true,
    required: true,
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
]

export const socialLinkFields: Field[] = [
  {
    name: 'platform',
    type: 'select',
    required: true,
    options: [
      { label: 'GitHub', value: 'github' },
      { label: 'LinkedIn', value: 'linkedin' },
      { label: 'X / Twitter', value: 'x' },
      { label: 'YouTube', value: 'youtube' },
      { label: 'Facebook', value: 'facebook' },
      { label: 'Instagram', value: 'instagram' },
      { label: 'Website', value: 'website' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    name: 'url',
    type: 'text',
    required: true,
    validate: validateAbsoluteHttpUrl,
  },
  {
    name: 'label',
    type: 'text',
    localized: true,
  },
]

export const ownerField = (): Field => ({
  name: 'owner',
  type: 'relationship',
  relationTo: 'users',
  // Not schema-required: beforeChange assignOwner sets this on create.
  // Creators cannot reassign; Admin/Manager may override.
  index: true,
  access: {
    update: fieldAdminOrManager,
  },
  admin: {
    position: 'sidebar',
    readOnly: true,
    description:
      'Internal ownership for Creator access control. Hidden from public APIs via select.',
  },
})

export const translationReadyField = (): Field => ({
  name: 'translationReady',
  type: 'group',
  label: 'Translation readiness',
  admin: {
    description:
      'Editorial signal only. Payload `_status` is document-level; locales are field-level.',
    position: 'sidebar',
  },
  fields: [
    {
      name: 'vi',
      type: 'checkbox',
      label: 'Vietnamese translation complete',
      defaultValue: false,
      access: {
        update: fieldAdminOrManager,
      },
    },
  ],
})

export const publishedAtField = (): Field => ({
  name: 'publishedAt',
  type: 'date',
  admin: {
    position: 'sidebar',
    date: {
      pickerAppearance: 'dayAndTime',
    },
    description: 'Set automatically on first publish. Managers may override.',
  },
})
