import { cn } from '@/lib/utils'

import type { GridPlacement } from '@/app/(frontend)/_lib/feed-packer'
import { placementStyle } from '@/app/(frontend)/_lib/grid-placement'
import { resolveAlignment } from '@/app/(frontend)/_lib/resolve-alignment'
import type { FeedDecorationView, StoryShape } from '@/app/(frontend)/_lib/types'

type DecorationFeedItemProps = {
  decoration: FeedDecorationView
  shape: StoryShape
  placement: GridPlacement
  columns: number
  className?: string
}

export function DecorationFeedItem({
  decoration,
  shape,
  placement,
  columns,
  className,
}: DecorationFeedItemProps) {
  const align = resolveAlignment(placement, columns)
  const isWide = placement.columnSpan > placement.rowSpan
  const isTall = placement.rowSpan > placement.columnSpan

  return (
    <div
      className={cn(
        'bento-tile deco-tile relative flex bg-transparent',
        isWide || isTall
          ? cn('items-end', align === 'right' ? 'justify-end' : 'justify-start')
          : 'items-center justify-center',
        className,
      )}
      style={placementStyle(placement)}
      aria-hidden="true"
      data-shape={shape}
      data-pack={decoration.packId}
    >
      <div
        className={cn(
          'deco-image aspect-square bg-foreground',
          '[mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]',
          '[-webkit-mask-size:contain] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center]',
          isTall && 'w-full max-w-full',
          isWide && 'h-full max-h-full w-auto',
          !isTall && !isWide && 'h-full w-full',
          align === 'right' && '-scale-x-100',
        )}
        style={
          {
            maskImage: `url(${decoration.imageUrl})`,
            WebkitMaskImage: `url(${decoration.imageUrl})`,
          } as React.CSSProperties
        }
      />
    </div>
  )
}
