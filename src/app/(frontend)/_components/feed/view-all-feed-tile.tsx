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
        'group relative block h-full min-h-[12rem] p-2 outline-none',
        'bg-transparent',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        className,
      )}
      data-cursor-popup={cursorPopup || label.toLowerCase()}
    >
      <div className="absolute bottom-2 right-2 flex gap-1 items-center">
        <span className="text-md lowercase font-medium tracking-tight text-foreground/90 leading-none">
          {label}
        </span>
        <IconArrowNarrowRight className="pt-0.5 size-6 text-foreground/90" />
      </div>
    </Link>
  )
}
