import {
  BoldFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  StrikethroughFeature,
  SubscriptFeature,
  TextStateFeature,
  UnderlineFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { textStateConfig } from './textStateConfig'

/** Field-level Lexical editor: italic, bold, underline, subscript, strikethrough, link, font face. */
export const slimRichTextEditor = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    SubscriptFeature(),
    StrikethroughFeature(),
    LinkFeature({
      enabledCollections: [],
    }),
    TextStateFeature({
      state: textStateConfig,
    }),
    InlineToolbarFeature(),
  ],
})
