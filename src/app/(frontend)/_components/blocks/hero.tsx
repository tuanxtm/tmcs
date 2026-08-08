import Link from 'next/link'

import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import type { HeroBlockView } from '@/app/(frontend)/_lib/types'
import { cn } from '@/lib/utils'

type HeroProps = {
  hero: HeroBlockView
  className?: string
}

/**
 * Homepage hero block. Height stays budgeted for the first-fold layout when placed first.
 */
export function Hero({ hero, className }: HeroProps) {
  return (
    <section
      id="hero"
      className={cn(
        'relative flex min-h-[calc(var(--hero-fold-height)*0.8)] items-center justify-center',
        className,
      )}
      aria-labelledby="hero-heading"
      data-cursor-popup={hero.cursorPopup || 'scroll down'}
    >
      <div className="flex w-full max-w-3xl flex-col items-center justify-center gap-3 px-4 text-center">
        {hero.heroImage ? (
          <CmsImage
            media={hero.heroImage}
            sizes="(min-width: 768px) 48rem, 100vw"
            className="mb-2 w-full max-w-xl"
            imgClassName="h-auto w-full"
            priority
          />
        ) : null}

        {hero.label ? <p className="page-label">{hero.label}</p> : null}

        <h1 id="hero-heading" className="uppercase font-bold text-4xl text-foreground">
          {hero.title}
        </h1>

        {hero.tagline ? (
          <p className="max-w-md text-xs lowercase tracking-wide text-muted-foreground">
            {hero.tagline}
          </p>
        ) : null}

        {hero.bio ? (
          <CmsRichText
            data={hero.bio}
            className="max-w-xl text-sm leading-relaxed text-muted-foreground"
          />
        ) : null}

        {hero.links.length > 0 ? (
          <ul className="mt-2 flex flex-wrap items-center justify-center gap-3">
            {hero.links.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.href}
                  target={link.newTab ? '_blank' : undefined}
                  rel={link.newTab || link.external ? 'noopener noreferrer' : undefined}
                  className="text-xs uppercase tracking-wide text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
