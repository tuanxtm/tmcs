import Link from 'next/link'
import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import type { LayoutFooterBlockView } from '@/app/(frontend)/_lib/types'
import { homeHref } from '@/app/(frontend)/_lib/locale'
import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'
import Image from 'next/image'

type FooterBlockProps = {
  block: LayoutFooterBlockView
  siteName: string
  locale: LocaleCode
}

export function FooterBlock({ block, siteName, locale }: FooterBlockProps) {
  const currentYear = new Date().getFullYear()
  const copyright = (block.copyright ?? `© ${currentYear} ${siteName}`).replace(
    '{{year}}',
    String(currentYear),
  )

  return (
    <footer>
      <div
        className={cn(
          'relative flex flex-col justify-between',
          'h-[calc(var(--hero-fold-height)*0.6)] lg:h-[calc(var(--hero-fold-height)*0.7)]',
          'bg-background',
          'border-l-primary border-l-3 md:border-l-4 lg:border-l-5',
          'mb-4 md:mb-8 lg:mb-16',
        )}
      >
        <div className="flex h-full w-full flex-1 flex-col">
          {block.footerText ? (
            <div className="text-foreground text-sm">
              <CmsRichText data={block.footerText} />
            </div>
          ) : null}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {block.legalLinks.length > 0 ? (
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {block.legalLinks.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      target={link.newTab ? '_blank' : undefined}
                      rel={link.newTab || link.external ? 'noopener noreferrer' : undefined}
                      className="text-foreground hover:text-foreground/80 text-xs transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div
          className={cn(
            'bg-background flex items-center justify-between',
            'h-(--header-height) min-h-(--header-height)',
            'px-2 md:px-3 lg:px-4',
            'dash-line-t',
          )}
        >
          <p className="text-foreground pt-0.5 text-sm leading-none font-medium">{copyright}</p>
          <Link href={homeHref(locale)}>
            <Image
              src="/logo.svg"
              alt={siteName}
              width={100}
              height={100}
              className="size-4 lg:size-5"
            />
          </Link>
        </div>
      </div>
    </footer>
  )
}
