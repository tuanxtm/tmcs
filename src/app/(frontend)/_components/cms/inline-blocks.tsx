// Payload inline blocks reserve image width in text flow.
// Uniform mode paints images beyond a fixed text line height.
import type { CSSProperties } from 'react'
import { getInlineImageScale } from './inline-image-layout'

export type MediaLite = {
  id?: number | string
  url?: string
  alt?: string
  width?: number | null
  height?: number | null
  dominantColor?: string | null
  filename?: string
}

export type InlineImageFields = {
  blockType: 'inlineImage'
  blockName?: string | null
  id?: string
  image?: number | string | MediaLite | null
  caption?: string | null
  scale?: number | null
  align?: ('baseline' | 'top' | 'bottom' | 'middle' | 'text-top' | 'text-bottom') | null
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
  uniform?: boolean
}

function asMedia(value: InlineImageFields['image']): MediaLite | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'object') return value as MediaLite
  // Unpopulated media IDs cannot render an image.
  return null
}

function InlineImageInlineBlock({
  fields,
  uniform,
}: {
  fields: InlineImageFields
  uniform?: boolean
}) {
  const media = asMedia(fields.image)
  if (!media?.url) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[InlineBlock] inlineImage missing media url; skipped.', fields)
    }
    return null
  }

  const scale = getInlineImageScale(fields.scale)
  const em = '1em'
  const wrapperHeight = `calc(${em} * ${scale})`
  // Native aspect ratio (W/H).
  const aspectRatio = media.width && media.height ? media.width / media.height : 1

  // Map the CMS `align` value to a CSS `vertical-align` value.
  const align = fields.align ?? 'text-bottom'
  const initialTop =
    align === 'top' || align === 'text-top'
      ? '-0.9em'
      : align === 'middle'
        ? `calc(-0.5ex - ${wrapperHeight} / 2)`
        : `calc(${align === 'baseline' ? '0em' : '0.2em'} - ${wrapperHeight})`

  // Raw media preserves the original WebP and skips image optimization.
  const dominantStyle: CSSProperties | undefined = media.dominantColor
    ? { backgroundColor: media.dominantColor }
    : undefined

  return (
    <span
      data-inline-image-align={align}
      data-inline-image-uniform={uniform || undefined}
      style={{
        display: 'inline-block',
        position: uniform ? 'relative' : undefined,
        height: uniform ? 0 : wrapperHeight,
        // Reserve the visible width so text wraps around the image.
        width: `calc(${wrapperHeight} * ${aspectRatio})`,
        // verticalAlign is camelCase in React's style object.
        verticalAlign: uniform ? 'baseline' : align,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={media.url}
        alt={media.alt ?? ''}
        decoding="async"
        style={{
          ...(dominantStyle ?? {}),
          // Uniform images reserve width and paint beyond the text line's height.
          position: uniform ? 'absolute' : undefined,
          top: uniform ? `var(--inline-image-top, ${initialTop})` : undefined,
          left: uniform ? 0 : undefined,
          height: uniform ? wrapperHeight : '100%',
          width: '100%',
          display: 'block',
        }}
      />
    </span>
  )
}

export function InlineBlock({ fields, uniform }: InlineBlockProps) {
  switch (fields.blockType) {
    case 'pageBlankSpace': {
      const height = fields.height || '60vh'
      return <div style={{ height }} aria-hidden />
    }

    case 'inlineImage': {
      return <InlineImageInlineBlock fields={fields} uniform={uniform} />
    }

    default: {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[InlineBlock] Unsupported block type skipped.', fields)
      }
      return null
    }
  }
}
