/**
 * Field-level Lexical editor used inside rich text fields that should NOT
 * expose the `+ Add` block menu. Currently wired to:
 *   - PageRichTextBlock.content
 *   - PageFooterBlock.footerText
 *
 * Lives in its own module so `src/fields/richText.ts` (the unified global
 * editor) does not form a circular import with `src/blocks/page-blocks/rich-text.ts`,
 * which itself imports this file via `PageRichTextBlock` ->
 * `editor: richTextWithoutBlock` -> `src/fields/richText.ts`. A circular
 * import inside a Payload rich-text field confuses the schema-walk step in
 * `generate:types` (Maximum call stack size exceeded).
 *
 * This editor intentionally omits `BlocksFeature` to break the *runtime*
 * recursive schema: `pageBlocks` includes `PageRichTextBlock`,
 * whose `content` field would otherwise inherit the global editor and
 * re-reference itself through `BlocksFeature({ blocks: pageBlocks })`.
 */

import {
  InlineToolbarFeature,
  TextStateFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { textStateConfig } from './textStateConfig'

export const richTextWithoutBlock = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    InlineToolbarFeature(),
    TextStateFeature({ state: textStateConfig }),
    UploadFeature({
      collections: {
        media: {
          fields: [],
        },
      },
    }),
  ],
})
