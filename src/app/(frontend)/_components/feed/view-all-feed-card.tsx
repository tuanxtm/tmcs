'use client'

import Link from 'next/link'
import { Scales } from '@/components/ui/scales'
import { cn } from '@/lib/utils'

type ViewAllFeedCardProps = {
  href: string
  label: string
  cursorPopup?: string | null
  className?: string
}

export function ViewAllFeedCard({ href, label, cursorPopup, className }: ViewAllFeedCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative block aspect-square w-full outline-none',
        'cursor-pointer',
        'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
      data-cursor-popup={cursorPopup || label.toLowerCase()}
    >
      <Scales />
      <div className="bg-background absolute right-0 bottom-0 z-10 flex items-center">
        <span
          className={cn(
            'text-foreground/90 leading-none font-medium tracking-tight lowercase',
            'px-1 text-xs md:text-sm lg:text-base',
          )}
        >
          {label}
        </span>
      </div>
    </Link>
  )
}
