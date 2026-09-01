'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useLenis } from 'lenis/react'

/**
 * Resets the Lenis scroll position whenever the route changes.
 *
 * Kept in its own module so `LenisProvider` can dynamically import it with
 * `ssr: false`. That defers the `usePathname()` call (which triggers an
 * instant-validation error under Cache Components for routes whose dynamic
 * params aren't known at prerender time, e.g. `/[slug]`) until after
 * hydration, when the value is available at runtime.
 *
 * The component returns `null` and only side-effects via `useEffect`, so
 * skipping SSR is harmless.
 */
export function LenisRouteSync() {
  const lenis = useLenis()
  const pathname = usePathname()

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true })
  }, [pathname, lenis])

  return null
}
