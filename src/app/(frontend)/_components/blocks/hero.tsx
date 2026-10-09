import Link from 'next/link'
import { IconArrowDown } from '@tabler/icons-react'
import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import { trimUrlScheme } from '@/app/(frontend)/_lib/social-icons'
import type { PageHeroBlockView, NavChildView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { Scales } from '@/components/ui/scales'
import { cn } from '@/lib/utils'
import styles from './hero.module.css'

type HeroProps = {
  hero: PageHeroBlockView
  locale: LocaleCode
  hasFollowingContent: boolean
  className?: string
}

type LinkListVariant = 'social' | 'destination'

function LinkList({
  links,
  variant,
  label,
}: {
  links: NavChildView[]
  variant: LinkListVariant
  label: string | null
}) {
  if (links.length === 0) return null
  return (
    <div className={styles.linkGroup}>
      {label ? <p className={styles.linkLabel}>{label}</p> : null}
      <ul className={styles.linkList}>
        {links.map((link) => (
          <li key={link.id}>
            <Link
              href={link.href}
              target={link.newTab ? '_blank' : undefined}
              rel={link.newTab || link.external ? 'noopener noreferrer' : undefined}
              className={styles.heroLink}
              data-cursor-popup=""
            >
              <span aria-hidden="true" className={styles.linkMarker} />
              <span>{variant === 'social' ? trimUrlScheme(link.href) : link.href}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Hero({ hero, locale, hasFollowingContent, className }: HeroProps) {
  const targetId = `after-hero-${hero.id}`
  const scrollLabel = locale === 'vi' ? 'CUỘN XUỐNG' : 'SCROLL DOWN'
  const scrollContent = (
    <>
      <span>{scrollLabel}</span>
      <IconArrowDown aria-hidden="true" />
    </>
  )
  return (
    <section
      id="hero"
      className={cn(styles.hero, className)}
      aria-label="Hero"
      data-cursor-popup={hero.cursorPopup || 'scroll down'}
    >
      <div className={styles.stage}>
        <div className={styles.richText} data-hero-rich-text>
          {hero.paragraph ? (
            <CmsRichText
              data={hero.paragraph}
              className="text-secondary font-serif text-xl md:text-2xl lg:text-5xl"
              lineSpacing="uniform"
              fitToContainer
            />
          ) : null}
        </div>
        <div className={styles.image} data-hero-image>
          {hero.heroImage ? (
            <CmsImage
              media={hero.heroImage}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="h-full w-full"
              imgClassName="object-cover"
              priority
            />
          ) : null}
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.decoration} aria-hidden="true" data-hero-decoration />
        <div className={styles.links} data-hero-links>
          <LinkList links={hero.socialLinks} variant="social" label={hero.labelSocialLinks} />
          <LinkList links={hero.otherLinks} variant="destination" label={hero.labelOtherLinks} />
        </div>
        {hasFollowingContent ? (
          <a
            href={`#${targetId}`}
            className={cn(styles.scroll, 'site-cell-hover')}
            data-cursor-popup=""
            data-hero-scroll
          >
            {scrollContent}
          </a>
        ) : (
          <button
            type="button"
            className={cn(styles.scroll, 'site-cell-hover')}
            disabled
            data-cursor-popup=""
            data-hero-scroll
          >
            {scrollContent}
          </button>
        )}
        <div className={styles.scales} aria-hidden="true" data-hero-scales>
          <Scales
            orientation="diagonal"
            size={10}
            color="var(--site-grid-line-color, color-mix(in oklch, var(--accent) 10%, transparent))"
          />
        </div>
      </div>
      {hasFollowingContent ? (
        <span id={targetId} className={styles.scrollTarget} aria-hidden="true" />
      ) : null}
    </section>
  )
}
