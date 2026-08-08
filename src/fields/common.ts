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

/**
 * Relationship field that picks one or more entries from the centralized
 * `links` collection. The picker calls `resolveLinks` at the frontend layer
 * to fetch the full label/href/newTab data.
 *
 * Pass `category` to restrict the picker to links tagged with that category
 * (e.g. "legal" for the footer). Without `category` the picker shows every
 * link — admins can still override the filter at the relationship level.
 */
export const linkPickerField = (options?: {
  name?: string
  label?: string
  description?: string
  hasMany?: boolean
  maxRows?: number
  category?: 'navigation' | 'social' | 'legal' | 'contact' | 'other'
}): Field => {
  const hasMany = options?.hasMany ?? true
  const filterOptions = options?.category
    ? { filterOptions: { category: { equals: options.category } } }
    : {}
  const base = {
    name: options?.name ?? 'links',
    type: 'relationship' as const,
    relationTo: 'links' as const,
    label: options?.label,
    admin: {
      description:
        options?.description ?? 'Pick one or more entries from the Links library.',
    },
    ...filterOptions,
  }

  if (hasMany) {
    const maxRows =
      typeof options?.maxRows === 'number' ? { maxRows: options.maxRows } : {}
    return {
      ...base,
      hasMany: true,
      ...maxRows,
    } as Field
  }

  return {
    ...base,
    hasMany: false,
  } as Field
}

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
      { label: 'TikTok', value: 'tiktok' },
      { label: 'Threads', value: 'threads' },
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
      'Editorial signal only.',
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
  index: true,
  admin: {
    position: 'sidebar',
    date: {
      pickerAppearance: 'dayAndTime',
    },
    description: 'Set automatically on first publish. Managers may override.',
  },
})
