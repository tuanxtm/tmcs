'use client'

import Link from 'next/link'
import { IconArrowRight } from '@tabler/icons-react'

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
      <div className="absolute bottom-2 right-2 flex gap-1">
        <span className="font-mono text-xs font-medium tracking-tight text-foreground">
          {label}
        </span>
        <IconArrowRight className="size-4 text-foreground" />
      </div>
    </Link>
  )
}
