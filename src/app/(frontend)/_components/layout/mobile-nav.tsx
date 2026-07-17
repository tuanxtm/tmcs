'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import type { NavItemView } from '@/app/(frontend)/_lib/types'

type MobileNavProps = {
  items: NavItemView[]
  siteName: string
}

export function MobileNav({ items, siteName }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="min-h-11 min-w-11 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-6">
        <SheetHeader>
          <SheetTitle className="font-mono text-sm uppercase tracking-[0.18em]">
            {siteName}
          </SheetTitle>
        </SheetHeader>

        <nav aria-label="Mobile" className="flex flex-1 flex-col gap-1">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Navigation coming soon.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="dash-b py-2">
                <SheetClose asChild>
                  <Link
                    href={item.href}
                    target={item.newTab ? '_blank' : undefined}
                    rel={item.external || item.newTab ? 'noopener noreferrer' : undefined}
                    className="inline-flex min-h-11 items-center text-base font-medium"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </SheetClose>
                {item.children.length > 0 ? (
                  <ul className="mt-1 space-y-1 pl-3">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <SheetClose asChild>
                          <Link
                            href={child.href}
                            target={child.newTab ? '_blank' : undefined}
                            rel={
                              child.external || child.newTab ? 'noopener noreferrer' : undefined
                            }
                            className="inline-flex min-h-11 items-center text-sm text-muted-foreground"
                            onClick={() => setOpen(false)}
                          >
                            {child.label}
                          </Link>
                        </SheetClose>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
