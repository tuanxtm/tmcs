import type { ImgHTMLAttributes } from 'react'

/**
 * Browser stand-in for next/image. Keeps the `fill` layout contract: an
 * absolutely positioned image inside a relative parent.
 */
type FixtureImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string
  alt: string
  fill?: boolean
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: string
  blurDataURL?: string
  loader?: unknown
  unoptimized?: boolean
}

export default function Image({
  fill = false,
  priority: _priority,
  sizes: _sizes,
  quality: _quality,
  placeholder: _placeholder,
  blurDataURL: _blurDataURL,
  loader: _loader,
  unoptimized: _unoptimized,
  alt = '',
  style,
  ...rest
}: FixtureImageProps) {
  const fillStyle = fill
    ? { position: 'absolute' as const, inset: 0, width: '100%', height: '100%' }
    : undefined

  // eslint-disable-next-line @next/next/no-img-element -- browser-only test stub
  return <img {...rest} alt={alt} style={{ ...fillStyle, ...style }} />
}
