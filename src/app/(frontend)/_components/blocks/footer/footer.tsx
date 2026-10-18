import { cacheLife } from 'next/cache'
import Link from 'next/link'
import Image from 'next/image'
import { ImageGlow } from '@/app/(frontend)/_components/media/image-glow'
import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import type { NavChildView, PageFooterBlockView } from '@/app/(frontend)/_lib/types'
import { trimUrlScheme } from '@/app/(frontend)/_lib/social-icons'
import { homeHref } from '@/app/(frontend)/_lib/locale'
import type { LocaleCode } from '@/lib/locales'
import styles from './footer.module.css'
type FooterBlockProps = {
  block: PageFooterBlockView
  siteName: string
  locale: LocaleCode
}
type FooterLinkListProps = {
  label: string | null
  links: NavChildView[]
  variant: 'social' | 'destination'
}
function FooterLinkList({ label, links, variant }: FooterLinkListProps) {
  if (links.length === 0) return null
  return (
    <div className={styles.linkGroup}>
      {label ? <p className={styles.groupTitle}>{label}</p> : null}
      <ul className={styles.links}>
        {links.map((link) => {
          const display = variant === 'social' ? trimUrlScheme(link.href) : link.label
          return (
            <li key={link.id}>
              <div className={styles.linkRow}>
                <span className={styles.linkPrefix}>&gt;</span>
                <Link
                  href={link.href}
                  target={link.newTab ? '_blank' : undefined}
                  rel={link.newTab || link.external ? 'noopener noreferrer' : undefined}
                  className={styles.link}
                  data-cursor-popup={''}
                >
                  {link.label}
                </Link>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
async function getCurrentYear(): Promise<number> {
  'use cache'
  cacheLife('max')
  return new Date().getFullYear()
}
export async function FooterBlock({ block, siteName, locale }: FooterBlockProps) {
  const currentYear = await getCurrentYear()
  const copyright = (block.copyright ?? `© ${currentYear} ${siteName}`).replace(
    '{{year}}',
    String(currentYear),
  )
  return (
    <footer data-cursor-popup={block.cursorPopup || 'footer'}>
      <div className={styles.root}>
        <div className={styles.content}>
          {block.footerText ? (
            <div className={styles.tagline}>
              <CmsRichText data={block.footerText} />
            </div>
          ) : null}

          <div className={styles.groupsFrame}>
            <div className={styles.groups}>
              <FooterLinkList
                label={block.labelSocialLinks}
                links={block.socialLinks}
                variant="social"
              />
              <FooterLinkList
                label={block.labelOtherLinks}
                links={block.otherLinks}
                variant="destination"
              />
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>{copyright}</p>
          <Link href={homeHref(locale)}>
            <ImageGlow className={styles.logo}>
              <Image
                src="/logo.svg"
                alt={siteName}
                width={100}
                height={100}
                className={styles.icon}
              />
            </ImageGlow>
          </Link>
        </div>
      </div>
    </footer>
  )
}
