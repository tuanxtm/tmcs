'use client'

import Link from 'next/link'
import { Barcode } from '@/components/ui/barcode'
import { cn } from '@/lib/utils'

type ViewAllFeedTileProps = {
  href: string
  label: string
  cursorPopup?: string | null
  className?: string
}

export function ViewAllFeedTile({ href, label, cursorPopup, className }: ViewAllFeedTileProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative block aspect-4/3 w-full outline-none',
        'cursor-pointer',
        'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
      data-cursor-popup={cursorPopup || label.toLowerCase()}
    >
      <div className="absolute right-0 bottom-0 h-8 w-full md:h-10 lg:h-12">
        <Barcode
          value={label}
          lineColor="oklch(from var(--primary) l c h / 0.6)"
          quietZoneModules={0}
        />
      </div>
      <div className="bg-background absolute right-0 bottom-0 flex items-center gap-1 px-1">
        <span
          className={cn(
            'text-foreground/90 leading-none font-medium tracking-tight lowercase',
            'text-xs md:text-sm lg:text-base',
          )}
        >
          {label}
        </span>
        <span className="font-mono text-[0.625rem] md:text-xs lg:text-sm">&gt;</span>
      </div>
    </Link>
  )
}
