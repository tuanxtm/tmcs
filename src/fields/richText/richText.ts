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
    UploadFeature({
      collections: {
        media: {
          fields: [],
        },
      },
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
    }),
    TextStateFeature({ state: textStateConfig }),
  ],
})
