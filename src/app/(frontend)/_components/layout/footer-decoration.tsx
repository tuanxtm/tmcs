import { cn } from '@/lib/utils'

type FooterDecorationProps = {
  imageUrl: string
  className?: string
}

/** 1×1 tile-sized deco, flipped for right dock, tinted with --foreground. */
export function FooterDecoration({ imageUrl, className }: FooterDecorationProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'deco-image aspect-square h-[calc(var(--bento-tile)*2)] w-[calc(var(--bento-tile)*2)] shrink-0 -scale-x-100 bg-foreground',
        '[mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]',
        '[-webkit-mask-size:contain] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center]',
        className,
      )}
      style={
        {
          maskImage: `url(${imageUrl})`,
          WebkitMaskImage: `url(${imageUrl})`,
        } as React.CSSProperties
      }
    />
  )
}
