import type { Block } from 'payload'

export const LayoutRelatedItemsBlock: Block = {
  slug: 'layoutRelatedItems',
  labels: {
    singular: 'Layout - Related items',
    plural: 'Layout - Related items',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'collection',
      type: 'select',
      required: true,
      defaultValue: 'posts',
      options: [
        { label: 'Posts', value: 'posts' },
        { label: 'Projects', value: 'projects' },
      ],
      admin: {
        description: 'Which collection to pull related items from.',
      },
    },
    {
      name: 'items',
      type: 'relationship',
      relationTo: ['posts', 'projects'],
      hasMany: true,
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.collection),
        description: 'Use the collection selector above to choose Posts or Projects.',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 12,
      admin: { description: 'Maximum items rendered on the frontend.' },
    },
    {
      name: 'showViewAll',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'viewAllLabel',
      type: 'text',
      localized: true,
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.showViewAll),
      },
    },
    {
      name: 'viewAllPage',
      type: 'relationship',
      relationTo: 'pages',
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.showViewAll),
      },
    },
    {
      type: 'collapsible',
      label: 'Cursor popups',
      fields: [
        {
          name: 'cursorPopup',
          type: 'text',
          localized: true,
          label: 'Section',
        },
        {
          name: 'cursorPopupItem',
          type: 'text',
          localized: true,
          label: 'Item',
        },
        {
          name: 'cursorPopupViewAll',
          type: 'text',
          localized: true,
          label: 'View all tile',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.showViewAll),
          },
        },
      ],
    },
  ],
}