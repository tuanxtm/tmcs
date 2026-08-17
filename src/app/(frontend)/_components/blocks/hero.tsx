import Link from 'next/link'
import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import { trimUrlScheme } from '@/app/(frontend)/_lib/social-icons'
import type { LayoutHeroBlockView, NavChildView } from '@/app/(frontend)/_lib/types'
import { cn } from '@/lib/utils'
import Threads from '@/components/ui/threads'

type HeroProps = {
  hero: LayoutHeroBlockView
  className?: string
}

type FieldRowProps = {
  label: string | null
  className?: string
  children: React.ReactNode
}

function FieldRow({ label, className, children }: FieldRowProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {label ? (
        <p className="text-muted-foreground/80 font-mono text-[0.625rem] tracking-tight uppercase md:text-xs">
          {label}
        </p>
      ) : null}
      <div className="text-foreground text-base lowercase">{children}</div>
    </div>
  )
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
              className="text-foreground focus-visible:ring-ring flex items-center gap-1 focus-visible:ring-2 focus-visible:outline-none md:gap-2"
            >
              <span className="text-muted-foreground font-mono text-xs md:text-base">&gt;</span>
              <span className="text-sm font-medium tracking-tight lowercase md:text-base lg:text-lg">
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
        'relative flex min-h-auto md:h-[calc(var(--hero-fold-height)*0.6)] lg:h-[calc(var(--hero-fold-height)*0.7)]',
        'bg-background dash-line-b',
        'pt-2 md:pt-1 md:pb-1.5',
        'border-l-primary border-l-3 md:border-l-4 lg:border-l-5',
        className,
      )}
      aria-labelledby="hero-heading"
      data-cursor-popup={hero.cursorPopup || 'scroll down'}
    >
      <div className="flex h-full w-full flex-col-reverse items-stretch justify-between md:flex-row">
        <div className="relative isolate min-h-0 flex-1 overflow-hidden">
          <Threads
            color={[1, 1, 1]}
            amplitude={0.7}
            distance={0.7}
            speed={0.05}
            enableMouseInteraction={false}
            className={cn(
              'pointer-events-none absolute inset-0 z-0 opacity-80',
              'pl-2 md:pl-3 lg:pl-4',
              className,
            )}
          />
          <div className={cn('relative z-10 h-full overflow-y-auto', 'p-2 md:p-3 lg:p-4')}>
            <div className="grid grid-cols-2 gap-x-16 gap-y-4 md:gap-y-8 lg:gap-x-8 lg:gap-y-16">
              <FieldRow label={hero.labelTitle}>
                <h1
                  id="hero-heading"
                  className="text-foreground text-sm font-medium md:text-base lg:text-lg"
                >
                  {hero.title}
                </h1>
              </FieldRow>

              {hero.tagline ? (
                <FieldRow label={hero.labelTagline}>
                  <p className="text-foreground text-sm font-medium md:text-base lg:text-lg">
                    {hero.tagline}
                  </p>
                </FieldRow>
              ) : (
                <div aria-hidden="true" />
              )}

              {hero.bio ? (
                <FieldRow label={hero.labelBio} className="col-span-2">
                  <CmsRichText
                    data={hero.bio}
                    className="text-foreground mb-3 text-sm font-medium md:text-base lg:text-lg"
                  />
                </FieldRow>
              ) : null}

              <FieldRow label={hero.labelSocialLinks}>
                <LinkList links={hero.socialLinks} variant="social" />
              </FieldRow>

              {hero.otherLinks.length > 0 ? (
                <FieldRow label={hero.labelOtherLinks}>
                  <LinkList links={hero.otherLinks} variant="destination" />
                </FieldRow>
              ) : (
                <div aria-hidden="true" />
              )}
            </div>
          </div>
        </div>

        <div
          className={cn(
            'relative overflow-hidden md:h-full',
            'h-40 w-full md:w-1/3 lg:w-1/4',
            'pl-2 md:pl-1.5 lg:pl-2.5',
            className,
          )}
        >
          {hero.heroImage ? (
            <CmsImage
              media={hero.heroImage}
              fill
              sizes="(min-width: 768px) 25vw, 100vw"
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
