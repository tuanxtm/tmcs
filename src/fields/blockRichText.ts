import {
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  StrikethroughFeature,
  TextStateFeature,
  UnderlineFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { textStateConfig } from './textStateConfig'

/**
 * Field-level Lexical editor used inside the `LayoutRichTextWithoutBlock` page block.
 *
 * Intentionally excludes `BlocksFeature` to break the recursive schema
 * generation that happens when `BlocksFeature({ blocks: pageBlocks })` is
 * enabled at the global editor level - `pageBlocks` includes `LayoutRichTextWithoutBlock`,
 * whose `content` field would otherwise inherit the global editor. That
 * produces an infinite depth in the JSON schema during `generate:types`.
 *
 * The inline block conversion path can still render `layoutRichTextWithoutBlock` blocks at
 * runtime because the schema is separate from the runtime feature stack.
 */
export const blockRichTextEditor = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    StrikethroughFeature(),
    LinkFeature({
      enabledCollections: [],
    }),
    TextStateFeature({
      state: textStateConfig,
    }),
  ],
})
