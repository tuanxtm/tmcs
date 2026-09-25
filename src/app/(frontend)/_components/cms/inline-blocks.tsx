/**
 * Inline block payloads as Lexical node `fields`.
 *
 * Mirrors the schemas declared under `src/fields/richText.ts` (via
 * `BlocksFeature({ inlineBlocks: [...] })`). The block node is persisted by
 * `BlocksFeature` on the Lexical editor and deserialized into the editor state
 * by the server.
 *
 * Block types:
 *   - `pageBlankSpace` - layout-only blank gap (Page-level block exposed
 *     inside rich text via the BlocksFeature wiring).
 *   - `inlineImage` - Payload-native inline-block carrying a Media upload
 *     reference + an optional caption. Renders inside a paragraph at the
 *     position of the cursor (sits next to text runs).
 */
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'

export type MediaLite = {
  id?: number | string
  url?: string
  alt?: string
  width?: number | null
  height?: number | null
  dominantColor?: string | null
  filename?: string
}

type InlineImageFields = {
  blockType: 'inlineImage'
  blockName?: string | null
  id?: string
  image?: number | string | MediaLite | null
  caption?: string | null
}

type PageBlankSpaceFields = {
  blockType: 'pageBlankSpace'
  blockName?: string | null
  id?: string
  height?: string | null
}

export type InlineBlockFields = InlineImageFields | PageBlankSpaceFields

type InlineBlockProps = {
  fields: InlineBlockFields
}

function asMedia(value: InlineImageFields['image']): MediaLite | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'object') return value as MediaLite
  // Numeric/string id only — caller needs to populate; render nothing in that case.
  return null
}

function InlineImageInlineBlock({ fields }: { fields: InlineImageFields }) {
  const media = asMedia(fields.image)
  if (!media?.url) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[InlineBlock] inlineImage missing media url; skipped.', fields)
    }
    return null
  }

  // Default render: 1.5em tall, aspect-ratio derived width. Match the
  // historical legacy-inline-image look to avoid visual regressions in
  // documents authored before the migration.
  const aspectRatio =
    media.width && media.height && media.height > 0 ? media.width / media.height : null

  // Phrasing content wrapper so it stays inside <p> without hydration errors.
  return (
    <span className="my-6 inline-block align-middle">
      <CmsImage
        media={{
          id: typeof media.id === 'number' ? media.id : 0,
          url: media.url,
          alt: media.alt ?? '',
          width: media.width ?? null,
          height: media.height ?? null,
          dominantColor: media.dominantColor ?? null,
        }}
        sizes="1.5em"
        imgClassName={
          aspectRatio
            ? `!h-[1.5em] !w-auto aspect-[${aspectRatio}]`
            : '!h-[1.5em] !w-auto'
        }
      />
      {fields.caption ? (
        <span className="text-foreground/70 mt-2 block text-xs">{fields.caption}</span>
      ) : null}
    </span>
  )
}

export function InlineBlock({ fields }: InlineBlockProps) {
  switch (fields.blockType) {
    case 'pageBlankSpace': {
      const height = fields.height || '60vh'
      return <div style={{ height }} aria-hidden />
    }

    case 'inlineImage': {
      return <InlineImageInlineBlock fields={fields} />
    }

    default: {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[InlineBlock] Unsupported block type skipped.', fields)
      }
      return null
    }
  }
}
