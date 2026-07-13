import type { CollectionConfig } from 'payload'

import { adminOrManager, approvedOrStaff, fieldAdminOnly, fieldAdminOrManager } from '@/access'
import { socialLinkFields } from '@/fields/common'
import { ensureCreatorCannotChangeApproval } from '@/hooks'
import { getUserId, isAdmin, isAdminOrManager, isCreator, type UserWithRole } from '@/lib/roles'

export const Authors: CollectionConfig = {
  slug: 'authors',
  labels: {
    singular: 'Author',
    plural: 'Authors',
  },
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'jobTitle', 'approved', 'updatedAt'],
    group: 'Content',
    description: 'Public-safe author profiles. Never expose auth emails or roles here.',
  },
  access: {
    create: adminOrManager,
    read: approvedOrStaff,
    update: ({ req: { user } }) => {
      const current = user as UserWithRole | null
      if (!current) return false
      if (isAdminOrManager(current)) return true
      if (isCreator(current)) {
        return {
          user: {
            equals: getUserId(current),
          },
        }
      }
      return false
    },
    delete: ({ req: { user } }) => isAdmin(user as UserWithRole | null),
  },
  hooks: {
    beforeChange: [ensureCreatorCannotChangeApproval],
  },
  fields: [
    {
      name: 'displayName',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'jobTitle',
      type: 'text',
      localized: true,
    },
    {
      name: 'bio',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: socialLinkFields,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      unique: true,
      access: {
        update: fieldAdminOnly,
      },
      admin: {
        position: 'sidebar',
        description: 'Linked auth user (Admin only).',
      },
    },
    {
      name: 'approved',
      type: 'checkbox',
      defaultValue: false,
      access: {
        update: fieldAdminOrManager,
      },
      admin: {
        position: 'sidebar',
        description: 'Only approved profiles are publicly readable.',
      },
    },
  ],
}
