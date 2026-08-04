import type { CollectionConfig } from 'payload'

import {
  canCreateOwnedContent,
  canDeleteOwnedContent,
  canReadOwnVersions,
  canUpdateOwnedContent,
  publishedOrOwned,
} from '@/access'
import { ownerField, publishedAtField, translationReadyField } from '@/fields/common'
import { assignOwner, preventCreatorPublish, setPublishedAt } from '@/hooks'
import { importYouTubeThumbnail } from '@/hooks/importYouTubeThumbnail'
import { revalidateVideos, revalidateVideosDelete } from '@/hooks/revalidateFrontend'
import { validateVideoSourceUrl } from '@/lib/social-video-url'

export const Videos: CollectionConfig = {
  slug: 'videos',
  labels: {
    singular: 'Video',
    plural: 'Videos',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'provider', '_status', 'featured', 'publishedAt', 'updatedAt'],
    group: 'Content',
    description:
      'Social video links. Cards show R2 thumbnails only — YouTube can auto-import a thumb on save; other platforms need a manual upload.',
  },
  versions: {
    drafts: {
      // Autosave disabled — avoids D1 write storms while typing in Admin (Worker cost).
      schedulePublish: true,
      validate: false,
    },
    maxPerDoc: 25,
  },
  access: {
    create: canCreateOwnedContent,
    read: publishedOrOwned,
    update: canUpdateOwnedContent,
    delete: canDeleteOwnedContent,
    readVersions: canReadOwnVersions,
  },
  hooks: {
    beforeChange: [assignOwner, preventCreatorPublish, setPublishedAt, importYouTubeThumbnail],
    afterChange: [revalidateVideos],
    afterDelete: [revalidateVideosDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'provider',
      type: 'select',
      required: true,
      defaultValue: 'youtube',
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'TikTok', value: 'tiktok' },
        { label: 'Instagram', value: 'instagram' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      required: true,
      validate: (
        value: unknown,
        { siblingData }: { siblingData?: { provider?: 'youtube' | 'tiktok' | 'instagram' | 'other' } },
      ) =>
        validateVideoSourceUrl(value, {
          siblingData,
        }),
      admin: {
        description: 'Canonical social post URL. YouTube plays inline on click; others open externally.',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Required for non-YouTube. YouTube auto-imports once on save when empty; you can still upload a custom thumb.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    publishedAtField(),
    ownerField(),
    translationReadyField(),
  ],
}
