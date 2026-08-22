import { cacheLife } from 'next/cache'
import Link from 'next/link'
import Image from 'next/image'
import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import type {
  FeedDecorationView,
  LayoutFooterBlockView,
  NavChildView,
} from '@/app/(frontend)/_lib/types'
import { trimUrlScheme } from '@/app/(frontend)/_lib/social-icons'
import { homeHref } from '@/app/(frontend)/_lib/locale'
import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

type FooterBlockProps = {
  block: LayoutFooterBlockView
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
    <div className="flex flex-col gap-1">
      {label ? (
        <p className="text-muted-foreground/80 font-mono text-[0.625rem] tracking-tight uppercase md:text-xs">
          {label}
        </p>
      ) : null}
      <ul className="flex flex-col gap-x-4 gap-y-1">
        {links.map((link) => {
          const display = variant === 'social' ? trimUrlScheme(link.href) : link.label
          return (
            <li key={link.id}>
              <div className="flex items-center gap-x-1">
                <span className="text-primary hover:text-foreground font-mono text-xs md:text-base">
                  &gt;
                </span>
                <Link
                  href={link.href}
                  target={link.newTab ? '_blank' : undefined}
                  rel={link.newTab || link.external ? 'noopener noreferrer' : undefined}
                  className={cn(
                    'text-sm font-medium tracking-tight lowercase md:text-base lg:text-lg',
                    'hover:text-primary transition-colors duration-300',
                  )}
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

function FooterDecoration({ decoration }: { decoration: FeedDecorationView }) {
  return (
    <div
      className={cn(
        'aspect-square h-full shrink-0',
        'max-md:relative max-md:bottom-0 max-md:left-0',
        'bg-primary max-md:bg-primary/25',
      )}
      aria-hidden="true"
      style={{
        WebkitMaskImage: `url("${decoration.imageUrl}")`,
        maskImage: `url("${decoration.imageUrl}")`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  )
}

export async function FooterBlock({ block, siteName, locale }: FooterBlockProps) {
  const currentYear = await getCurrentYear()
  const copyright = (block.copyright ?? `© ${currentYear} ${siteName}`).replace(
    '{{year}}',
    String(currentYear),
  )

  return (
    <footer data-cursor-popup={block.cursorPopup || 'footer'}>
      <div
        className={cn(
          'relative flex flex-col justify-between',
          'h-[calc(var(--hero-fold-height)*0.6)] lg:h-[calc(var(--hero-fold-height)*0.7)]',
          'bg-background',
          'border-l-primary border-l-3 md:border-l-4 lg:border-l-5',
        )}
      >
        <div
          className={cn(
            'flex h-full w-full flex-1 flex-col',
            'px-2 pt-2 md:px-3 md:pt-3 lg:px-4 lg:pt-4',
          )}
        >
          {block.footerText ? (
            <div
              className={cn(
                'text-foreground min-h-(--header-height) font-medium',
                'text-sm md:text-base lg:text-lg',
              )}
            >
              <CmsRichText data={block.footerText} />
            </div>
          ) : null}

          <div className="relative flex h-full md:items-end md:justify-between">
            {block.footerDecoration ? (
              <FooterDecoration decoration={block.footerDecoration} />
            ) : null}
            <div
              className={cn(
                'flex flex-col gap-8 md:flex-row md:gap-12 lg:gap-16',
                'pb-2 md:pb-3 lg:pb-4',
                'origin-bottom-right max-md:absolute max-md:right-0 max-md:bottom-0',
              )}
            >
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

        <div
          className={cn(
            'bg-background flex items-center justify-between',
            'h-(--header-height) min-h-(--header-height)',
            'px-2 md:px-3 lg:px-4',
            'dash-line-t',
          )}
        >
          <p className="text-foreground pt-0.5 text-xs leading-none font-medium md:text-sm">
            {copyright}
          </p>
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
