import Link from 'next/link'
import {
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandX,
  IconBrandYoutube,
  IconLink,
  IconWorld,
  type Icon,
} from '@tabler/icons-react'

import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import { FooterDecoration } from '@/app/(frontend)/_components/layout/footer-decoration'
import { externalLinkProps } from '@/app/(frontend)/_lib/link-props'
import type { SiteShellView } from '@/app/(frontend)/_lib/types'

type SiteFooterProps = {
  shell: SiteShellView
}

const SOCIAL_ICONS: Record<string, Icon> = {
  github: IconBrandGithub,
  linkedin: IconBrandLinkedin,
  x: IconBrandX,
  youtube: IconBrandYoutube,
  facebook: IconBrandFacebook,
  instagram: IconBrandInstagram,
  website: IconWorld,
  other: IconLink,
}

function replaceYear(value: string | null, siteName: string): string {
  const year = String(new Date().getFullYear())
  if (!value) return `© ${year} ${siteName}`
  return value.replaceAll('{{year}}', year)
}

export function SiteFooter({ shell }: SiteFooterProps) {
  const { footer, siteName } = shell
  const navLinks = [...footer.groups.flatMap((group) => group.links), ...footer.legalLinks]

  return (
    <footer>
      <div className="dash-b relative flex h-[calc(2*var(--bento-tile))] flex-col justify-between p-2">
        <div className="max-w-sm">
          {footer.text ? (
            <CmsRichText
              data={footer.text}
              className="text-lg leading-relaxed text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_p]:m-0"
            />
          ) : null}
        </div>

        <div
          className={
            footer.decorationImageUrl
              ? 'flex items-end justify-end gap-6 self-end pr-[var(--bento-tile)]'
              : 'flex items-end justify-end gap-6 self-end'
          }
        >
          {navLinks.length > 0 ? (
            <ul className="space-y-2 text-right">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    {...externalLinkProps(link)}
                    className="text-sm transition-colors hover:text-muted-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {footer.decorationImageUrl ? (
          <FooterDecoration
            imageUrl={footer.decorationImageUrl}
            className="absolute bottom-0 right-0"
          />
        ) : null}
      </div>
      <div className="flex h-[var(--header-height)] items-center justify-between gap-4 p-2">
        <div>
          <p className="font-serif text-lg italic">Create with passion.</p>
          <p className="text-xs text-secondary-foreground">
            {replaceYear(footer.copyright, siteName)}
          </p>
        </div>
        {footer.socialLinks.length > 0 ? (
          <ul className="flex flex-row items-center gap-3">
            {footer.socialLinks.map((link) => {
              const Icon = SOCIAL_ICONS[link.platform] ?? IconLink
              return (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label || link.platform}
                    className="text-secondary-foreground transition-colors hover:text-foreground"
                  >
                    <Icon aria-hidden="true" className="size-5" stroke={2} />
                  </a>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </footer>
  )
}
