import Link from 'next/link'
import { headers } from 'next/headers'

import { homeHref, parseLocale, SITE_LOCALE_HEADER } from '@/app/(frontend)/_lib/locale'
import { cn } from '@/lib/utils'

export default async function NotFound() {
  const headerList = await headers()
  const locale = parseLocale(headerList.get(SITE_LOCALE_HEADER))

  const heading =
    locale === 'vi' ? '404. trang này không tồn tại.' : "404. this page doesn't exist."
  const description =
    locale === 'vi'
      ? 'bạn có biết thứ gì khác tồn tại không ?\nnhững ý tưởng tuyệt vời,\nnhững dự án lớn,\nnhững thứ mà bạn luôn muốn làm,\nvề trang chủ nhé,\nmong rằng bạn sẽ tìm thấy thứ bạn cần tìm.'
      : "but you know what does ?\nthat brilliant idea floating in your mind,\nthe next big project in your head,\nthe thing you've always wanted to build,\nlet's go back,\nand find what you're looking for."
  const backLabel = locale === 'vi' ? 'Trở về trang chủ' : 'Go back home'

  return (
    <section
      id="not-found"
      className={cn(
        'relative flex min-h-0 flex-auto',
        'bg-background',
        'border-l-primary border-l-3 md:border-l-4 lg:border-l-5',
      )}
      aria-labelledby="not-found-heading"
      data-cursor-popup={'not-found'}
    >
      <Link
        href={homeHref(locale)}
        className="flex h-full w-full flex-col-reverse items-stretch justify-between md:flex-row"
      >
        <div className="relative isolate flex min-h-0 flex-1 items-center justify-center overflow-hidden">
          <div
            className={cn(
              'relative z-10 h-full w-auto items-center justify-center overflow-y-auto',
              'p-2 max-md:mx-auto md:p-3 lg:p-4',
            )}
          >
            <div
              className={cn(
                'mx-auto flex h-full flex-col items-start justify-center gap-4 py-2 text-center',
              )}
            >
              <h1
                id="not-found-heading"
                className="text-primary text-sm font-medium whitespace-pre-wrap md:text-base lg:text-lg"
              >
                {heading}
              </h1>
              <p className="text-primary mb-1 text-left text-sm font-medium whitespace-pre-wrap md:text-base lg:text-lg">
                {description}
              </p>
              <div
                data-cursor-popup={''}
                className={cn(
                  'inline-flex items-center justify-center gap-1',
                  'focus-visible:ring-ring transition-colors focus-visible:ring-2 focus-visible:outline-none',
                )}
              >
                <span
                  className={cn(
                    'text-primary inline-flex items-baseline font-mono leading-none font-semibold',
                    'text-[0.625rem] uppercase md:text-xs lg:text-sm',
                  )}
                >
                  {'>'}
                </span>
                <span
                  className={cn(
                    'text-primary inline-flex items-baseline leading-none font-semibold',
                    'pt-px text-xs uppercase md:text-sm lg:text-base',
                    'hover:text-foreground hover:underline hover:underline-offset-4',
                  )}
                >
                  {backLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'relative h-full overflow-hidden max-md:hidden',
            'w-full md:w-1/3 lg:w-1/4',
            'pl-2 md:pl-1.5 lg:pl-2.5',
          )}
        >
          <div
            className={cn('flex h-full w-full items-center justify-center py-4', 'font-mono')}
            aria-hidden="true"
          >
            <span className="text-primary font-mono text-[clamp(6rem,20vw,8rem)] leading-none">
              <span className="inline md:block">4</span>
              <span className="inline md:block">0</span>
              <span className="inline md:block">4</span>
            </span>
          </div>
        </div>
      </Link>
    </section>
  )
}
