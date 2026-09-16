'use client'

import { cn } from '@/lib/utils'

export function Background() {
  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none fixed inset-x-0 top-0 -z-10 h-dvh w-full overflow-hidden',
          'bg-secondary-background',
        )}
      ></div>
    </>
  )
}
