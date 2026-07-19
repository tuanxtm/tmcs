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
    <footer className="px-2 py-16">
      <div className="flex min-h-64 flex-col justify-between gap-16">
        {/* Top left: logo / name / text */}
        <div className="max-w-sm">
          {footer.text ? (
            <p className="mt-3 text-sm leading-relaxed text-foreground">{footer.text}</p>
          ) : null}
        </div>

        {/* Bottom right: links + copyright */}
        <div className="flex flex-col items-end self-end text-right">
          {footer.socialLinks.length > 0 ? (
            <div className="mb-6 flex flex-col items-end gap-3">
              <p className="text-xs font-semibold text-secondary-foreground">
                Follow me
              </p>
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
                        <Icon aria-hidden="true" className="size-5" stroke={1.5} />
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}

          {navLinks.length > 0 ? (
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    target={link.newTab ? '_blank' : undefined}
                    rel={link.external || link.newTab ? 'noopener noreferrer' : undefined}
                    className="text-sm transition-colors hover:text-muted-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          <p className="mt-10 text-sm text-secondary-foreground">
            {replaceYear(footer.copyright, siteName)}
          </p>
        </div>
      </div>
    </footer>
  )
}
