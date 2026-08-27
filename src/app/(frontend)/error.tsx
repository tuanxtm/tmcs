'use client'

import Link from 'next/link'
import { useEffect } from 'react'

import { useLocale } from '@/app/(frontend)/_components/providers/locale'
import { homeHref } from '@/app/(frontend)/_lib/locale'
import { cn } from '@/lib/utils'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const locale = useLocale()

  useEffect(() => {
    console.error(error)
  }, [error])

  const heading = locale === 'vi' ? '500. có lỗi xảy ra.' : '500. something went wrong.'
  const description =
    locale === 'vi'
      ? 'không thể tải trang này.\nvui lòng thử lại.'
      : 'the page could not be loaded.\nplease try again.'
  const retryLabel = locale === 'vi' ? 'Thử lại' : 'try again'
  const homeLabel = locale === 'vi' ? 'Trở về trang chủ' : 'back home'

  return (
    <section
      id="error"
      className={cn(
        'relative flex min-h-0 flex-auto',
        'bg-background',
        'border-l-primary border-l-3 md:border-l-4 lg:border-l-5',
      )}
      aria-labelledby="error-heading"
      data-cursor-popup={'error'}
    >
      <div className="flex h-full w-full flex-col-reverse items-stretch justify-between md:flex-row">
        <div className="relative isolate flex min-h-0 flex-1 items-center justify-center overflow-hidden">
          <div
            className={cn(
              'relative z-10 h-full w-auto items-center justify-center overflow-y-auto',
              'p-2 max-md:mx-auto md:p-3 lg:p-4',
            )}
          >
            <div
              className={cn(
                'mx-auto flex h-full flex-col items-start justify-center gap-8 py-2 text-center',
              )}
            >
              <h1
                id="error-heading"
                className="text-primary text-sm font-medium whitespace-pre-wrap md:text-base lg:text-lg"
              >
                {heading}
              </h1>
              <p className="text-primary mb-1 text-left text-sm font-medium whitespace-pre-wrap md:text-base lg:text-lg">
                {description}
              </p>
              <div className="flex items-center gap-8">
                <button
                  type="button"
                  onClick={reset}
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
                    {retryLabel}
                  </span>
                </button>
                <Link
                  href={homeHref(locale)}
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
                    {homeLabel}
                  </span>
                </Link>
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
            <span className="text-primary font-mono text-[clamp(6rem,18vw,8rem)] leading-none">
              <span className="inline md:block">5</span>
              <span className="inline md:block">0</span>
              <span className="inline md:block">0</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
