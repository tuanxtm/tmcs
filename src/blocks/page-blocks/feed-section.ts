import type { Block } from 'payload'

export const PageFeedSectionBlock: Block = {
  slug: 'pageFeedSection',
  labels: {
    singular: 'Page - Feed section',
    plural: 'Page - Feed sections',
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
          'Projects and Things use draggable canvases. Posts and Videos use a feed grid.',
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
          'Static shows a capped preview (optionally with View all). Infinite loads more as the visitor scrolls - only available for latest published. Projects and Things blocks always render static previews; their canonical archives load all published items in batches of 10.',
        condition: (_, siblingData) =>
          !['projects', 'things'].includes(siblingData?.feedType) &&
          siblingData?.source === 'latest',
      },
    },
    {
      name: 'limit',
      type: 'number',
      required: true,
      defaultValue: 12,
      min: 1,
      max: 48,
      admin: {
        description:
          'Number of items in the preview (1-48, default 12). Projects and Things respect this count on blocks; their archives use infinite scrolling.',
      },
    },
    {
      name: 'showViewAll',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'Projects and Things always link View all to their canonical localized archives.',
        condition: (_, siblingData) =>
          ['projects', 'things'].includes(siblingData?.feedType) ||
          siblingData?.pagination !== 'infinite' ||
          siblingData?.source !== 'latest',
      },
    },
    {
      name: 'viewAllLabel',
      type: 'text',
      localized: true,
      admin: {
        condition: (_, siblingData) =>
          Boolean(siblingData?.showViewAll) &&
          (['projects', 'things'].includes(siblingData?.feedType) ||
            siblingData?.pagination !== 'infinite' ||
            siblingData?.source !== 'latest'),
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
          !['projects', 'things'].includes(siblingData?.feedType) &&
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
          siblingData?.source === 'manual' &&
          ['projects', 'things'].includes(siblingData?.feedType),
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
        description: 'Things previews respect the preview count and the order of this selection.',
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
              (['projects', 'things'].includes(siblingData?.feedType) ||
                siblingData?.pagination !== 'infinite' ||
                siblingData?.source !== 'latest'),
            description: 'While hovering the “View all” tile.',
          },
        },
      ],
    },
  ],
}
