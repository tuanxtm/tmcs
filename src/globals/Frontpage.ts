import type { GlobalConfig } from 'payload'

import { adminOrManager, anyone } from '@/access'
import { slimRichTextEditor } from '@/fields/slimRichText'
import { revalidateFrontpageGlobal } from '@/hooks/revalidateFrontend'
import { STORY_SHAPE_OPTIONS } from '@/lib/story-shapes'

export const Frontpage: GlobalConfig = {
  slug: 'frontpage',
  label: 'Frontpage',
  admin: {
    group: 'Settings',
    description: 'Curated frontpage content. No frontend styling controls.',
  },
  access: {
    read: anyone,
    update: adminOrManager,
    readVersions: adminOrManager,
  },
  hooks: {
    afterChange: [revalidateFrontpageGlobal],
  },
  versions: {
    max: 10,
  },
  fields: [
    {
      name: 'heroHeading',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'heroSubheading',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'profileSummary',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'featuredPosts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
    },
    {
      name: 'featuredProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
    },
    {
      name: 'activeDecorationPack',
      type: 'relationship',
      relationTo: 'decoration-packs',
      required: true,
      admin: {
        description:
          'Which decoration pack fills leftover bento gaps and supplies the footer SVG via its footer item.',
      },
    },
    {
      name: 'endOfFeed',
      type: 'group',
      admin: {
        description:
          'Single closing tile shown once at the end of the frontpage feed. Not packed from Short stories.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show end-of-feed tile',
        },
        {
          name: 'text',
          type: 'richText',
          localized: true,
          editor: slimRichTextEditor,
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
          validate: (value, { siblingData }) => {
            const sibling = siblingData as { enabled?: boolean | null } | undefined
            if (sibling?.enabled && !value) {
              return 'Text is required when the closing tile is enabled.'
            }
            return true
          },
        },
        {
          name: 'preferredShape',
          type: 'select',
          defaultValue: '2x1',
          options: [...STORY_SHAPE_OPTIONS],
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
            description: 'Preferred footprint. Falls back to the largest shape that fits the last gap.',
          },
        },
      ],
    },
  ],
}
