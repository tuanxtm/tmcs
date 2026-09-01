import { ViewTransition } from 'react'

/**
 * Page-level wrapper for horizontal nav-forward / nav-back slides.
 *
 * Pairs with `<Link transitionTypes={['nav-forward'] | ['nav-back']}>` to
 * slide the page in from the matching side. Without a transition type
 * (browser back/forward, `router.refresh()`, Suspense reveals) the
 * `default: 'none'` branch keeps content static — no competing animation.
 *
 * Wrap the entire page return, not just the hero — element-level VTs inside
 * the page don't fire enter/exit when nested under a parent VT.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{
        'nav-forward': 'slide-from-right',
        'nav-back': 'slide-from-left',
        default: 'none',
      }}
      exit={{
        'nav-forward': 'slide-to-left',
        'nav-back': 'slide-to-right',
        default: 'none',
      }}
      default="none"
    >
      {children}
    </ViewTransition>
  )
}
