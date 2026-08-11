/**
 * Inline block payloads as Lexical node `fields`.
 *
 * Mirrors the schema of inline-insertable blocks in `src/blocks/`. The
 * block node is persisted by `BlocksFeature` on the Lexical editor and
 * deserialized into the editor state by the server.
 * Only `layoutBlankSpace` remains inline-insertable. All other layout
 * blocks (including `layoutRichTextWithoutBlock` and the Content-* blocks)
 * are layout-only by design - editors place them inside `layout`, not
 * inside rich text fields.
 */
export type InlineBlockFields = {
  blockType: 'layoutBlankSpace'
  blockName?: string | null
  id?: string
  height?: string | null
}

type InlineBlockProps = {
  fields: InlineBlockFields
}

export function InlineBlock({ fields }: InlineBlockProps) {
  switch (fields.blockType) {
    case 'layoutBlankSpace': {
      const height = fields.height || '60vh'
      return <div style={{ height }} aria-hidden />
    }

    default: {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[InlineBlock] Unsupported block type skipped.', fields)
      }
      return null
    }
  }
}
