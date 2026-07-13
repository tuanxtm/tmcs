import type { Block } from 'payload'

import { linkFields } from '@/fields/common'

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: {
    singular: 'Rich text',
    plural: 'Rich text',
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
    },
  ],
}

export const MediaBlock: Block = {
  slug: 'media',
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
  fields: [
    {
      name: 'media',
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
}

export const CallToActionBlock: Block = {
  slug: 'callToAction',
  labels: {
    singular: 'Call to action',
    plural: 'Calls to action',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'links',
      type: 'array',
      maxRows: 3,
      fields: linkFields,
    },
  ],
}

export const ProjectsGridBlock: Block = {
  slug: 'projectsGrid',
  labels: {
    singular: 'Projects grid',
    plural: 'Projects grids',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
    },
    {
      name: 'items',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
    },
    {
      name: 'featuredOnly',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}

export const pageBlocks = [RichTextBlock, MediaBlock, CallToActionBlock, ProjectsGridBlock]
