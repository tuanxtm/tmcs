'use client'

import Image from 'next/image'

import { cn } from '@/lib/utils'

import type { MediaView } from '@/app/(frontend)/_lib/types'

type CmsImageProps = {
  media: MediaView
  className?: string
  imgClassName?: string
  sizes: string
  priority?: boolean
  fill?: boolean
}

export function CmsImage({
  media,
  className,
  imgClassName,
  sizes,
  priority = false,
  fill = false,
}: CmsImageProps) {
  const style = media.dominantColor
    ? ({ backgroundColor: media.dominantColor } as React.CSSProperties)
    : undefined

  if (fill) {
    return (
      <div className={cn('relative overflow-hidden', className)} style={style}>
        <Image
          src={media.url}
          alt={media.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn('object-cover', imgClassName)}
        />
      </div>
    )
  }

  const width = media.width || 1600
  const height = media.height || 900

  return (
    <div className={cn('overflow-hidden', className)} style={style}>
      <Image
        src={media.url}
        alt={media.alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={cn('h-auto w-full object-cover', imgClassName)}
      />
    </div>
  )
}
