import Link from 'next/link'

import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import type { FooterBlockView } from '@/app/(frontend)/_lib/types'
import { cn } from '@/lib/utils'

type FooterBlockProps = {
  block: FooterBlockView
  siteName: string
}

/**
 * Renders a footer block placed in a page's layout.
 * Displays footer text, legal links, and copyright.
 */
export function FooterBlock({ block, siteName }: FooterBlockProps) {
  const currentYear = new Date().getFullYear()
  const copyright = (block.copyright ?? `© ${currentYear} ${siteName}`).replace(
    '{{year}}',
    String(currentYear),
  )

  return (
    <footer
      className={cn(
        'relative flex min-h-[calc(var(--hero-fold-height)*0.8)] flex-col justify-between px-2 py-2',
        // Gradient/blur chrome — a sibling layer so the mask doesn't fade the text.
        'before:pointer-events-none before:absolute before:inset-0 before:-z-10',
        'before:bg-gradient-to-b before:from-transparent before:via-background/15 before:to-background/55',
        'before:supports-[backdrop-filter]:bg-background/35 before:backdrop-blur-md',
        'before:[mask-image:linear-gradient(to_bottom,transparent_0%,black_55%,black_100%)]',
        'before:[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_55%,black_100%)]',
      )}
    >
      <div className="flex w-full flex-col gap-10">
        {block.footerText ? (
          <div className="text-sm text-foreground">
            <CmsRichText data={block.footerText} />
          </div>
        ) : null}

        <div className="flex flex-col gap-4 border-t border-border sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-xs text-foreground">{copyright}</span>
          {block.legalLinks.length > 0 ? (
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {block.legalLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    target={link.newTab ? '_blank' : undefined}
                    rel={link.newTab || link.external ? 'noopener noreferrer' : undefined}
                    className="text-xs text-foreground transition-colors hover:text-foreground/80"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
