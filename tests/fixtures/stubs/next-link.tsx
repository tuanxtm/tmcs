import type { AnchorHTMLAttributes, ReactNode } from 'react'

/**
 * Browser stand-in for next/link. The real module reads Next build-time env
 * flags and router internals that do not exist outside a Next bundle.
 */
type FixtureLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  children?: ReactNode
  transitionTypes?: string[]
  scroll?: boolean
  prefetch?: boolean | null
  replace?: boolean
  shallow?: boolean
  passHref?: boolean
  locale?: string | false
  legacyBehavior?: boolean
}

export default function Link({
  href,
  children,
  transitionTypes: _transitionTypes,
  scroll: _scroll,
  prefetch: _prefetch,
  replace: _replace,
  shallow: _shallow,
  passHref: _passHref,
  locale: _locale,
  legacyBehavior: _legacyBehavior,
  ...rest
}: FixtureLinkProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}
