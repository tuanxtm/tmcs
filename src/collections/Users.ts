import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { fieldAdminOnly, usersAdminAccess, usersReadAccess, usersUpdateAccess } from '@/access'
import { preventLastAdminDelete, preventSelfRoleEscalation, protectLastAdmin } from '@/hooks'
import { ROLES } from '@/lib/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'User',
    plural: 'Users',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'active', 'updatedAt'],
    group: 'Admin',
    description: 'Authentication accounts. Only Admins can manage users and roles.',
    hidden: ({ user }) => (user as { role?: string } | null)?.role !== 'admin',
  },
  auth: true,
  access: {
    admin: ({ req: { user } }) => {
      if (!user) return false
      const active = (user as { active?: boolean | null }).active
      return active !== false
    },
    create: usersAdminAccess,
    read: usersReadAccess,
    update: usersUpdateAccess,
    delete: usersAdminAccess,
    unlock: usersAdminAccess,
  },
  hooks: {
    beforeLogin: [
      async ({ user }) => {
        if (user && (user as { active?: boolean | null }).active === false) {
          throw new APIError('This account is inactive.', 403)
        }
        return user
      },
    ],
    beforeChange: [protectLastAdmin, preventSelfRoleEscalation],
    beforeDelete: [
      async ({ id, req }) => {
        await preventLastAdminDelete({ id, req })
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'creator',
      options: ROLES.map((role) => ({
        label: role.charAt(0).toUpperCase() + role.slice(1),
        value: role,
      })),
      saveToJWT: true,
      access: {
        create: fieldAdminOnly,
        update: fieldAdminOnly,
      },
      admin: {
        description: 'admin: full access · manager: editorial · creator: own drafts only',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      saveToJWT: true,
      access: {
        create: fieldAdminOnly,
        update: fieldAdminOnly,
      },
      admin: {
        description: 'Inactive users cannot log in or access the Admin panel.',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      access: {
        read: fieldAdminOnly,
        update: fieldAdminOnly,
      },
      admin: {
        description: 'Private notes visible to Admins only.',
      },
    },
  ],
}
