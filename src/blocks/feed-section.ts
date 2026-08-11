import type { Block } from 'payload'

export const LayoutFeedSectionBlock: Block = {
  slug: 'layoutFeedSection',
  labels: {
    singular: 'Layout - Feed section',
    plural: 'Layout - Feed sections',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Optional short blurb shown below the section heading.',
      },
    },
    {
      name: 'feedType',
      type: 'select',
      required: true,
      defaultValue: 'posts',
      options: [
        { label: 'Posts', value: 'posts' },
        { label: 'Projects', value: 'projects' },
        { label: 'Things', value: 'things' },
        { label: 'Videos', value: 'videos' },
      ],
      admin: {
        description:
          'Posts/Projects/Videos use the feed grid. Things uses a custom showcase layout with the same source logic.',
      },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'latest',
      options: [
        { label: 'Latest published', value: 'latest' },
        { label: 'Featured only', value: 'featured' },
        { label: 'Manual selection', value: 'manual' },
      ],
    },
    {
      name: 'pagination',
      type: 'select',
      required: true,
      defaultValue: 'static',
      options: [
        { label: 'Static preview', value: 'static' },
        { label: 'Infinite scroll', value: 'infinite' },
      ],
      admin: {
        description:
          'Static shows a capped preview (optionally with View all). Infinite loads more as the visitor scrolls - only available for latest published.',
        condition: (_, siblingData) => siblingData?.source === 'latest',
      },
    },
    {
      name: 'limit',
      type: 'number',
      required: true,
      defaultValue: 11,
      min: 1,
      max: 48,
      admin: {
        description:
          'Initial item count. For static previews this is the full grid size; for infinite scroll it is the first page size.',
      },
    },
    {
      name: 'showViewAll',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        condition: (_, siblingData) =>
          siblingData?.pagination !== 'infinite' || siblingData?.source !== 'latest',
      },
    },
    {
      name: 'viewAllLabel',
      type: 'text',
      localized: true,
      admin: {
        condition: (_, siblingData) =>
          Boolean(siblingData?.showViewAll) &&
          (siblingData?.pagination !== 'infinite' || siblingData?.source !== 'latest'),
        description: 'Label for the trailing tile (e.g. “View all posts”).',
      },
    },
    {
      name: 'viewAllPage',
      type: 'relationship',
      relationTo: 'pages',
      admin: {
        condition: (_, siblingData) =>
          Boolean(siblingData?.showViewAll) &&
          (siblingData?.pagination !== 'infinite' || siblingData?.source !== 'latest'),
        description: 'CMS page the View all tile links to (e.g. Posts or Projects index page).',
      },
    },
    {
      name: 'postItems',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: {
        condition: (_, siblingData) =>
          siblingData?.source === 'manual' && siblingData?.feedType === 'posts',
      },
    },
    {
      name: 'projectItems',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      admin: {
        condition: (_, siblingData) =>
          siblingData?.source === 'manual' && siblingData?.feedType === 'projects',
      },
    },
    {
      name: 'thingItems',
      type: 'relationship',
      relationTo: 'things',
      hasMany: true,
      admin: {
        condition: (_, siblingData) =>
          siblingData?.source === 'manual' && siblingData?.feedType === 'things',
        description: 'Homepage Things showcase uses up to 5 tiles plus an optional View all tile.',
      },
    },
    {
      name: 'videoItems',
      type: 'relationship',
      relationTo: 'videos',
      hasMany: true,
      admin: {
        condition: (_, siblingData) =>
          siblingData?.source === 'manual' && siblingData?.feedType === 'videos',
      },
    },
    {
      type: 'collapsible',
      label: 'Cursor popups',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'cursorPopup',
          type: 'text',
          localized: true,
          label: 'Section',
          admin: {
            description: 'While hovering the section (header / grid chrome).',
          },
        },
        {
          name: 'cursorPopupEmpty',
          type: 'text',
          localized: true,
          label: 'Empty section',
          admin: {
            description: 'When the section has no items yet.',
          },
        },
        {
          name: 'cursorPopupItem',
          type: 'text',
          localized: true,
          label: 'Feed item',
          admin: {
            description: 'While hovering an individual feed tile.',
          },
        },
        {
          name: 'cursorPopupViewAll',
          type: 'text',
          localized: true,
          label: 'View all tile',
          admin: {
            condition: (_, siblingData) =>
              Boolean(siblingData?.showViewAll) &&
              (siblingData?.pagination !== 'infinite' || siblingData?.source !== 'latest'),
            description: 'While hovering the “View all” tile.',
          },
        },
      ],
    },
  ],
}
