'use client'

import Link from 'next/link'
import { IconArrowNarrowRight } from '@tabler/icons-react'

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
        'group relative block h-full p-2 outline-none',
        'bg-transparent',
        'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
      data-cursor-popup={cursorPopup || label.toLowerCase()}
    >
      <div className="bg-primary/50 absolute right-2 bottom-2 flex h-full w-full items-center gap-1">
        <span className="text-md text-foreground/90 leading-none font-medium tracking-tight lowercase">
          {label}
        </span>
        <IconArrowNarrowRight className="text-foreground/90 size-6 pt-0.5" />
      </div>
    </Link>
  )
}
