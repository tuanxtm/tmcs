import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import {
  canCreateOwnedContent,
  canDeleteOwnedContent,
  canReadOwnVersions,
  canUpdateOwnedContent,
  publishedOrOwned,
} from '@/access'
import { ownerField, publishedAtField, translationReadyField } from '@/fields/common'
import { seoFields } from '@/fields/seoFields'
import { assignOwner, preventCreatorPublish, setPublishedAt } from '@/hooks'
import { getServerURL } from '@/lib/env'
import { validateAbsoluteHttpUrl } from '@/lib/url'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: 'Project',
    plural: 'Projects',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'projectStatus', '_status', 'featured', 'order', 'updatedAt'],
    group: 'Content',
    // Preview URL prepared for future frontend; public preview page is deferred.
    preview: (doc, { locale }) => {
      const slug = typeof doc?.slug === 'string' ? doc.slug : ''
      const base = getServerURL()
      return `${base}/preview/projects/${slug}?locale=${locale || 'en'}`
    },
  },
  versions: {
    drafts: {
      autosave: {
        interval: 375,
      },
      schedulePublish: true,
      validate: false,
    },
    maxPerDoc: 50,
  },
  access: {
    create: canCreateOwnedContent,
    read: publishedOrOwned,
    update: canUpdateOwnedContent,
    delete: canDeleteOwnedContent,
    readVersions: canReadOwnVersions,
  },
  hooks: {
    beforeChange: [assignOwner, preventCreatorPublish, setPublishedAt],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    slugField({
      name: 'slug',
      useAsSlug: 'title',
      localized: true,
      required: true,
    }),
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
      required: true,
    },
    {
      name: 'challenge',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'solution',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'outcome',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          localized: true,
        },
      ],
    },
    {
      name: 'demoUrl',
      type: 'text',
      validate: validateAbsoluteHttpUrl,
    },
    {
      name: 'repositoryUrl',
      type: 'text',
      validate: validateAbsoluteHttpUrl,
      admin: {
        description: 'Hide or omit if the repository is private/confidential.',
      },
    },
    {
      name: 'documentationUrl',
      type: 'text',
      validate: validateAbsoluteHttpUrl,
    },
    {
      name: 'repositoryPrivate',
      type: 'checkbox',
      defaultValue: false,
      label: 'Repository is private (do not show link publicly)',
    },
    {
      name: 'client',
      type: 'text',
      localized: true,
    },
    {
      name: 'clientConfidential',
      type: 'checkbox',
      defaultValue: false,
      label: 'Client name is confidential',
    },
    {
      name: 'projectType',
      type: 'select',
      options: [
        { label: 'Web app', value: 'web' },
        { label: 'Mobile', value: 'mobile' },
        { label: 'Library', value: 'library' },
        { label: 'Infrastructure', value: 'infra' },
        { label: 'Design', value: 'design' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'projectStatus',
      type: 'select',
      defaultValue: 'completed',
      options: [
        { label: 'In progress', value: 'in-progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Archived', value: 'archived' },
        { label: 'Concept', value: 'concept' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'startDate',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'monthOnly' },
        position: 'sidebar',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'monthOnly' },
        position: 'sidebar',
      },
    },
    {
      name: 'relatedProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      filterOptions: ({ id }) => {
        if (!id) return true
        return { id: { not_equals: id } }
      },
    },
    {
      name: 'results',
      type: 'array',
      label: 'Measurable results',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          localized: true,
        },
      ],
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      admin: { position: 'sidebar' },
    },
    {
      name: 'contributors',
      type: 'relationship',
      relationTo: 'authors',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    publishedAtField(),
    ownerField(),
    translationReadyField(),
    seoFields({ includeArticleFields: false }),
  ],
}
