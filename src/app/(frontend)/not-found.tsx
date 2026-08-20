import Link from 'next/link'
import { headers } from 'next/headers'

import { SiteHeader } from '@/app/(frontend)/_components/layout/site-header'
import { getSiteShell } from '@/app/(frontend)/_lib/cms'
import { homeHref, parseLocale, SITE_LOCALE_HEADER } from '@/app/(frontend)/_lib/locale'
import { cn } from '@/lib/utils'

export default async function NotFound() {
  const headerList = await headers()
  const locale = parseLocale(headerList.get(SITE_LOCALE_HEADER))
  const shell = await getSiteShell(locale)

  const backLabel = locale === 'vi' ? 'Trở về trang chủ' : 'Back to homepage'

  return (
    <div className="my-auto -mt-4 flex min-h-dvh flex-col justify-center md:-mt-8 lg:-mt-16">
      <SiteHeader siteName={shell.siteName} locale={locale} navigation={shell.navigation} />

      <section
        id="not-found"
        className={cn(
          'relative flex min-h-auto md:h-[calc(var(--hero-fold-height)*0.6)] lg:h-[calc(var(--hero-fold-height)*0.7)]',
          'bg-background dash-line-b',
          'pt-2 md:pt-1 md:pb-1.5',
          'border-l-primary border-l-3 md:border-l-4 lg:border-l-5',
        )}
        aria-labelledby="not-found-heading"
      >
        <div className="flex h-full w-full flex-col-reverse items-stretch justify-between md:flex-row">
          <div className="relative isolate flex min-h-0 flex-1 items-center justify-center overflow-hidden">
            <div className={cn('relative z-10 h-full w-full overflow-y-auto', 'p-2 md:p-3 lg:p-4')}>
              <div className="flex flex-col items-center justify-center gap-4 text-center md:items-start md:text-left">
                <h1
                  id="not-found-heading"
                  className="text-foreground text-sm font-medium md:text-base lg:text-lg"
                >
                  {backLabel}
                </h1>
                <Link
                  href={homeHref(locale)}
                  className="border-foreground text-foreground hover:bg-hover-background focus-visible:ring-ring mt-2 inline-flex min-h-11 items-center border px-4 text-xs tracking-wide uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  {backLabel}
                </Link>
              </div>
            </div>
          </div>

          <div
            className={cn(
              'relative overflow-hidden md:h-full',
              'h-40 w-full md:w-1/3 lg:w-1/4',
              'pl-2 md:pl-1.5 lg:pl-2.5',
            )}
          >
            <div
              className={cn('flex h-full w-full items-center justify-center', 'font-mono')}
              aria-hidden="true"
            >
              <span className="text-foreground font-mono text-[clamp(8rem,22vw,14rem)] leading-none">
                <span className="inline md:block">4</span>
                <span className="inline md:block">0</span>
                <span className="inline md:block">4</span>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
