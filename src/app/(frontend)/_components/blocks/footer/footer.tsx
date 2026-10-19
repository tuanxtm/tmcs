import { cacheLife } from 'next/cache'
import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { BlueFlame } from '@/components/ui/blue-flame'
import { Scales } from '@/components/ui/scales'
import { SiteHeaderLogo } from '@/app/(frontend)/_components/layout/site-header-logo'
import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import type { NavChildView, PageFooterBlockView } from '@/app/(frontend)/_lib/types'
import { homeHref, pageHref } from '@/app/(frontend)/_lib/locale'
import type { LocaleCode } from '@/lib/locales'
import { FooterContactForm } from './footer-contact-form'
import styles from './footer.module.css'
import interactionStyles from '@/app/(frontend)/_components/_styles/interactions.module.css'
import headerStyles from '@/app/(frontend)/_components/layout/_styles/site-header.module.css'

type FooterBlockProps = {
  block: PageFooterBlockView
  siteName: string
  locale: LocaleCode
}

function FooterLinkList({ label, links }: { label: string | null; links: NavChildView[] }) {
  return (
    <>
      {label ? <p className={styles.groupTitle}>{label}</p> : null}
      <ul className={styles.links}>
        {links.map((link) => (
          <li key={link.id}>
            <Link
              href={link.href}
              target={link.newTab ? '_blank' : undefined}
              rel={link.newTab || link.external ? 'noopener noreferrer' : undefined}
              className={styles.link}
              data-cursor-popup=""
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

function FooterScales({ area }: { area: 'company' | 'resources' | 'business' }) {
  return (
    <div className={`${styles.scales} ${styles[area]}`} aria-hidden="true" data-footer-tile={area}>
      <Scales size={10} color="var(--site-grid-line-color)" />
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
  const legalLinks =
    locale === 'vi'
      ? [
          { label: 'Điều khoản và quy định', slug: 'dieu-khoan-va-quy-dinh' },
          { label: 'Chính sách quyền riêng tư', slug: 'chinh-sach-quyen-rieng-tu' },
        ]
      : [
          { label: 'Terms & Conditions', slug: 'terms-and-conditions' },
          { label: 'Privacy Policy', slug: 'privacy-policy' },
          { label: 'Cookie Policy', slug: 'cookie-policy' },
        ]

  return (
    <footer className={styles.root} data-footer data-cursor-effects="off" data-cursor-popup="">
      <div className={styles.grid}>
        <div className={styles.tagline} data-footer-tile="text">
          {block.footerText ? (
            <CmsRichText
              data={block.footerText}
              className={styles.paragraph}
              lineSpacing="uniform"
            />
          ) : null}
        </div>
        <FooterContactForm locale={locale} />
        <div className={styles.address} data-footer-tile="address">
          <p className={styles.groupTitle}>{locale === 'vi' ? 'ĐỊA CHỈ' : 'ADDRESS'}</p>
        </div>
        <div className={styles.other} data-footer-tile="other">
          <FooterLinkList label={block.labelOtherLinks} links={block.otherLinks} />
        </div>
        <div className={styles.social} data-footer-tile="social">
          <FooterLinkList label={block.labelSocialLinks} links={block.socialLinks} />
        </div>
        <Link
          href={homeHref(locale)}
          aria-label={locale === 'vi' ? `${siteName} - Trang chủ` : `${siteName} - Home`}
          className={styles.logo}
          data-footer-tile="logo"
          data-cursor-popup=""
        >
          <div className={styles.logoMark}>
            <SiteHeaderLogo siteName={siteName} />
          </div>
        </Link>
        <FooterScales area="company" />
        <FooterScales area="resources" />
        <FooterScales area="business" />
      </div>
      <div className={styles.flame} aria-hidden="true" data-footer-tile="flame">
        <BlueFlame />
      </div>
      <div className={styles.bottom}>
        <p className={styles.copyright} data-footer-tile="copyright">
          {copyright}
        </p>
        <nav className={styles.legal} aria-label={locale === 'vi' ? 'Thông tin pháp lý' : 'Legal'}>
          {legalLinks.map((link) => (
            <Link
              key={link.slug}
              href={pageHref(locale, link.slug)}
              className={`${styles.legalLink} ${headerStyles.navLink} ${interactionStyles.cellHover}`}
              data-cursor-popup=""
            >
              {link.label}
              <IconArrowUpRight className={headerStyles.arrow} aria-hidden="true" />
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
