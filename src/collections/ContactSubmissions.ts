import type { CollectionConfig } from 'payload'

import { contactStaffOnly, fieldAdminOrManager } from '@/access'
import { LOCALE_CODES } from '@/lib/locales'

/**
 * Contact submissions are never publicly readable or creatable via the
 * generic REST API. Public submissions go through the hardened
 * `/api/contact` route which uses trusted Local API create after validation.
 */
export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: {
    singular: 'Contact submission',
    plural: 'Contact submissions',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'status', 'locale', 'createdAt'],
    group: 'Inbox',
    description: 'Visitor contact form submissions. Email notification is a later enhancement.',
    hidden: ({ user }) => {
      const role = (user as { role?: string } | null)?.role
      return role !== 'admin' && role !== 'manager'
    },
  },
  access: {
    // Intentionally deny public create — use /api/contact instead.
    create: () => false,
    read: contactStaffOnly,
    update: contactStaffOnly,
    delete: contactStaffOnly,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      index: true,
    },
    {
      name: 'subject',
      type: 'text',
      localized: true,
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Project inquiry', value: 'project' },
        { label: 'Speaking', value: 'speaking' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'general',
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'locale',
      type: 'select',
      options: LOCALE_CODES.map((code) => ({ label: code, value: code })),
      required: true,
      defaultValue: 'en',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'In progress', value: 'in-progress' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Spam', value: 'spam' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'assignee',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar' },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      access: {
        read: fieldAdminOrManager,
        update: fieldAdminOrManager,
      },
      admin: {
        description: 'Staff-only notes. Never exposed publicly.',
      },
    },
    {
      name: 'sourcePage',
      type: 'text',
      admin: {
        description: 'Page URL where the form was submitted.',
      },
    },
    {
      name: 'consent',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      label: 'Visitor consented to be contacted',
    },
    {
      name: 'abuse',
      type: 'group',
      access: {
        read: fieldAdminOrManager,
        update: fieldAdminOrManager,
      },
      admin: {
        description: 'Non-public abuse metadata. Raw IPs are not stored.',
      },
      fields: [
        {
          name: 'ipHash',
          type: 'text',
          index: true,
        },
        {
          name: 'userAgentHash',
          type: 'text',
        },
        {
          name: 'honeypotTriggered',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
  timestamps: true,
}
