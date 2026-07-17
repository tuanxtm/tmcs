import Link from 'next/link'

import type { SiteShellView } from '@/app/(frontend)/_lib/types'

type SiteFooterProps = {
  shell: SiteShellView
}

function replaceYear(value: string | null, siteName: string): string {
  const year = String(new Date().getFullYear())
  if (!value) return `© ${year} ${siteName}`
  return value.replaceAll('{{year}}', year)
}

export function SiteFooter({ shell }: SiteFooterProps) {
  const { footer, siteName } = shell

  return (
    <footer>
      <div className="grid gap-10 py-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="page-label">Site</p>
          <p className="mt-3 text-lg font-medium">{siteName}</p>
          {footer.text ? (
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {footer.text}
            </p>
          ) : null}
        </div>

        <div className="grid gap-8 sm:grid-cols-2 md:col-span-8 md:grid-cols-3">
          {footer.groups.length === 0 ? (
            <div className="sm:col-span-2 md:col-span-3">
              <p className="page-label">Links</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Footer links can be configured in CMS.
              </p>
            </div>
          ) : (
            footer.groups.map((group) => (
              <div key={group.id}>
                <p className="page-label">{group.title}</p>
                <ul className="mt-3 space-y-2">
                  {group.links.map((link) => (
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
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {replaceYear(footer.copyright, siteName)}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {footer.socialLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          {footer.legalLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              target={link.newTab ? '_blank' : undefined}
              rel={link.external || link.newTab ? 'noopener noreferrer' : undefined}
              className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
