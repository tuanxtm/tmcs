import {
  BlocksFeature,
  FixedToolbarFeature,
  TextStateFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { inlineBlocks } from '@/blocks'
import { textStateConfig } from '../textStateConfig'

export const richText = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    FixedToolbarFeature(),
    // Allowlist the picker to Media so the dedicated Inline Images collection
    // does not appear in the block-level upload menu for ordinary rich text.
    UploadFeature({
      collections: {
        media: {
          fields: [],
        },
      },
      enabledCollections: ['media'],
    }),
    TextStateFeature({ state: textStateConfig }),
    BlocksFeature({
      inlineBlocks: inlineBlocks,
    }),
  ],
})

export const richTextWithoutBlock = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    FixedToolbarFeature(),
    UploadFeature({
      collections: {
        media: {
          fields: [],
        },
      },
      enabledCollections: ['media'],
    }),
    TextStateFeature({ state: textStateConfig }),
  ],
})
