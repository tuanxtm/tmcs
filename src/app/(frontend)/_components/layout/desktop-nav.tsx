'use client'

import Link from 'next/link'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

import type { NavItemView } from '@/app/(frontend)/_lib/types'

type DesktopNavProps = {
  items: NavItemView[]
}

export function DesktopNav({ items }: DesktopNavProps) {
  if (items.length === 0) return null

  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList>
        {items.map((item) => {
          if (item.children.length > 0) {
            return (
              <NavigationMenuItem key={item.id}>
                <NavigationMenuTrigger className="bg-transparent">
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid min-w-[14rem] gap-1 p-2">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href={item.href}
                          target={item.newTab ? '_blank' : undefined}
                          rel={item.external || item.newTab ? 'noopener noreferrer' : undefined}
                          className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                        >
                          {item.label}
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={child.href}
                            target={child.newTab ? '_blank' : undefined}
                            rel={child.external || child.newTab ? 'noopener noreferrer' : undefined}
                            className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                          >
                            {child.label}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )
          }

          return (
            <NavigationMenuItem key={item.id}>
              <NavigationMenuLink asChild>
                <Link
                  href={item.href}
                  target={item.newTab ? '_blank' : undefined}
                  rel={item.external || item.newTab ? 'noopener noreferrer' : undefined}
                  className={cn(navigationMenuTriggerStyle, 'bg-transparent')}
                >
                  {item.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
