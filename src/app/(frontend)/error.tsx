'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="my-auto -mt-4 flex min-h-dvh flex-col justify-center md:-mt-8 lg:-mt-16">
      <header
        className={cn(
          'bg-background dash-line-b fixed inset-x-0 top-0',
          'mt-4 md:mt-8 lg:mt-16',
        )}
      >
        <div
          className={cn(
            'bg-background relative flex h-(--header-height) min-h-(--header-height) items-center justify-between',
            'px-2 md:px-3 lg:px-4',
            'border-l-primary border-l-3 md:border-l-4 lg:border-l-5',
          )}
        >
          <div className="flex items-center gap-2">
            <Link href="/en">
              <Image
                src="/logo.svg"
                alt="Site"
                width={100}
                height={100}
                className="size-4 lg:size-5"
              />
            </Link>
          </div>
        </div>
      </header>

      <section
        id="error"
        className={cn(
          'relative flex min-h-auto md:h-[calc(var(--hero-fold-height)*0.6)] lg:h-[calc(var(--hero-fold-height)*0.7)]',
          'bg-background dash-line-b',
          'pt-2 md:pt-1 md:pb-1.5',
          'border-l-primary border-l-3 md:border-l-4 lg:border-l-5',
        )}
        aria-labelledby="error-heading"
      >
        <div className="flex h-full w-full flex-col-reverse items-stretch justify-between md:flex-row">
          <div className="relative isolate flex min-h-0 flex-1 items-center justify-center overflow-hidden">
            <div className={cn('relative z-10 h-full w-full overflow-y-auto', 'p-2 md:p-3 lg:p-4')}>
              <div className="flex flex-col items-center justify-center gap-4 text-center md:items-start md:text-left">
                <p className="text-foreground text-[0.6875rem] uppercase tracking-[0.18em]">
                  Error
                </p>
                <h1
                  id="error-heading"
                  className="text-foreground text-sm font-medium md:text-base lg:text-lg"
                >
                  Something went wrong
                </h1>
                <p className="text-muted-foreground max-w-md text-xs md:text-sm">
                  The page could not be loaded. Please try again.
                </p>
                <div className="mt-2 flex w-full flex-col items-center gap-3 md:flex-row md:items-start">
                  <Button
                    type="button"
                    className="inline-flex min-h-11 items-center px-4 text-xs tracking-wide uppercase"
                    onClick={reset}
                  >
                    Try again
                  </Button>
                  <Link
                    href="/en"
                    className="border-foreground text-foreground hover:bg-hover-background focus-visible:ring-ring inline-flex min-h-11 items-center border px-4 text-xs tracking-wide uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    Back to homepage
                  </Link>
                </div>
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
                <span className="inline md:block">5</span>
                <span className="inline md:block">0</span>
                <span className="inline md:block">0</span>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
