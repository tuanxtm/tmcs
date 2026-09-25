import Link from 'next/link'
import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import { trimUrlScheme } from '@/app/(frontend)/_lib/social-icons'
import type { PageHeroBlockView, NavChildView } from '@/app/(frontend)/_lib/types'
import { cn } from '@/lib/utils'

type HeroProps = {
  hero: PageHeroBlockView
  className?: string
}

type LinkListVariant = 'social' | 'destination'

function LinkList({ links, variant }: { links: NavChildView[]; variant: LinkListVariant }) {
  if (links.length === 0) return null
  return (
    <ul className={cn('flex flex-col', 'gap-y-1')}>
      {links.map((link) => {
        const display = variant === 'social' ? trimUrlScheme(link.href) : link.href
        return (
          <li key={link.id}>
            <Link
              href={link.href}
              target={link.newTab ? '_blank' : undefined}
              rel={link.newTab || link.external ? 'noopener noreferrer' : undefined}
              className={cn(
                'text-foreground focus-visible:ring-ring flex items-center gap-1 md:gap-2',
                'focus-visible:ring-2 focus-visible:outline-none',
              )}
              data-cursor-popup={''}
            >
              <span
                className={cn(
                  'text-primary hover:text-foreground font-mono',
                  'text-xs md:text-base',
                )}
              >
                &gt;
              </span>
              <span
                className={cn(
                  'text-sm font-medium tracking-tight lowercase md:text-base lg:text-lg',
                  'hover:text-primary transition-colors duration-300',
                )}
              >
                {display}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export function Hero({ hero, className }: HeroProps) {
  return (
    <section
      id="hero"
      className={cn(
        'relative flex min-h-auto md:h-[calc(var(--hero-fold-height)*0.6)] lg:h-[calc(var(--hero-fold-height)*0.9)]',
        className,
      )}
      aria-label="Hero"
      data-cursor-popup={hero.cursorPopup || 'scroll down'}
    >
      <div className="flex h-full w-full flex-col-reverse items-stretch justify-between md:flex-row">
        <div className="relative isolate min-h-0 flex-1 overflow-hidden">
          <div className={cn('relative z-10 h-full overflow-y-auto', 'px-2 py-4 md:p-4 lg:p-5')}>
            {hero.paragraph ? (
              <CmsRichText
                data={hero.paragraph}
                className={cn('text-foreground font-serif', 'text-xl md:text-2xl lg:text-5xl')}
                paragraphClassName="md:leading-[1.15] lg:leading-[1.2]"
              />
            ) : null}

            {hero.socialLinks.length > 0 ? (
              <LinkList links={hero.socialLinks} variant="social" />
            ) : null}

            {hero.otherLinks.length > 0 ? (
              <LinkList links={hero.otherLinks} variant="destination" />
            ) : null}
          </div>
        </div>

        <div
          className={cn(
            'relative overflow-hidden md:h-full',
            'h-40 w-full md:w-2/5',
            'max-sm:pl-2',
            className,
          )}
        >
          {hero.heroImage ? (
            <CmsImage
              media={hero.heroImage}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="h-full w-full"
              imgClassName="object-cover"
              priority
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}
