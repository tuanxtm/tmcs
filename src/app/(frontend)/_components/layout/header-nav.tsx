'use client'

import Link from 'next/link'

import { externalLinkProps } from '@/app/(frontend)/_lib/link-props'
import type { NavItemView } from '@/app/(frontend)/_lib/types'
import { cn } from '@/lib/utils'

type HeaderNavProps = {
  items: NavItemView[]
  className?: string
}

export function HeaderNav({ items, className }: HeaderNavProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Primary" className={cn('flex flex-wrap items-center justify-end gap-1', className)}>
      <ul className="flex flex-wrap items-center justify-end gap-x-1 gap-y-1">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-1">
            <Link
              href={item.href}
              {...externalLinkProps(item)}
              className="inline-flex min-h-11 items-center px-2 font-mono text-xs font-bold uppercase tracking-wide text-secondary-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.label}
            </Link>
            {item.children.length > 0
              ? item.children.map((child) => (
                  <Link
                    key={child.id}
                    href={child.href}
                    {...externalLinkProps(child)}
                    className="inline-flex min-h-11 items-center px-2 font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {child.label}
                  </Link>
                ))
              : null}
          </li>
        ))}
      </ul>
    </nav>
  )
}
