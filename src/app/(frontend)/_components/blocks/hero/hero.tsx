import Link from 'next/link'
import { Fragment } from 'react'
import { IconArrowDownLeft } from '@tabler/icons-react'
import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import type { PageHeroBlockView, NavChildView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { Scales } from '@/components/ui/scales'
import { cn } from '@/lib/utils'
import styles from './hero.module.css'
import interactionStyles from '@/app/(frontend)/_components/_styles/interactions.module.css'
type HeroProps = {
  hero: PageHeroBlockView
  locale: LocaleCode
  hasFollowingContent: boolean
  className?: string
}
function InlineLinks({ links, locale }: { links: NavChildView[]; locale: LocaleCode }) {
  const conjunction = locale === 'vi' ? ' và ' : ' and '
  return links.map((link, index) => (
    <Fragment key={link.id}>
      {index > 0 ? (index === links.length - 1 ? conjunction : ', ') : null}
      <Link
        href={link.href}
        target={link.newTab ? '_blank' : undefined}
        rel={link.newTab || link.external ? 'noopener noreferrer' : undefined}
        className={styles.heroLink}
        data-cursor-popup=""
      >
        {link.label}
      </Link>
    </Fragment>
  ))
}
export function Hero({ hero, locale, hasFollowingContent, className }: HeroProps) {
  const targetId = `after-hero-${hero.id}`
  const scrollLabel = locale === 'vi' ? 'KHÁM PHÁ' : 'DISCOVER MORE'
  const scrollContent = (
    <>
      <span>{scrollLabel}</span>
      <IconArrowDownLeft aria-hidden="true" />
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
              className={styles.paragraph}
              lineSpacing="uniform"
              fitToContainer
            />
          ) : null}
        </div>
        <div className={styles.image} data-hero-image>
          {hero.heroImage ? (
            <CmsImage
              media={hero.heroImage}
              glow={false}
              fill
              sizes="(min-width: 1024px) 100dvh, 100vw"
              className={styles.imageFrame}
              imgClassName={styles.heroImage}
              priority
            />
          ) : null}
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.decorationScales} aria-hidden="true" data-hero-decoration-scales>
          <Scales
            orientation="diagonal"
            size={10}
            color="var(--site-grid-line-color, color-mix(in oklch, var(--accent) 10%, transparent))"
          />
        </div>
        <div className={styles.decoration} aria-hidden="true" data-hero-decoration />
        <div className={styles.links} data-hero-links>
          <p className={styles.linksParagraph}>
            {hero.socialLinks.length > 0 ? (
              <>
                {locale === 'vi' ? 'Bạn có thể theo dõi mình tại ' : 'Follow me at '}
                <InlineLinks links={hero.socialLinks} locale={locale} />.
              </>
            ) : null}
            {hero.otherLinks.length > 0 ? (
              <>
                {hero.socialLinks.length > 0
                  ? locale === 'vi'
                    ? ' Hoặc khám phá thêm tại '
                    : ' Or discover more at '
                  : locale === 'vi'
                    ? 'Khám phá thêm tại '
                    : 'Discover more at '}
                <InlineLinks links={hero.otherLinks} locale={locale} />.
              </>
            ) : null}
          </p>
        </div>
        {hasFollowingContent ? (
          <a
            href={`#${targetId}`}
            className={cn(styles.scroll, interactionStyles.cellHover)}
            data-cursor-popup=""
            data-hero-scroll
          >
            {scrollContent}
          </a>
        ) : (
          <button
            type="button"
            className={cn(styles.scroll, interactionStyles.cellHover)}
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
