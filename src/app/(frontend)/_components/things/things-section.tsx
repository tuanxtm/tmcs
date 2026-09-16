'use client'

import Link from 'next/link'

import { ThingsGrid } from '@/app/(frontend)/_components/things/things-grid'
import {
  RevealGridItem,
  useGridColumnCount,
} from '@/app/(frontend)/_components/layout/reveal-grid-item'
import { SectionHeader } from '@/app/(frontend)/_components/layout/section-header'
import { ThingCard } from '@/app/(frontend)/_components/things/thing-card'
import type { ThingCardView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

type ThingsSectionProps = {
  locale: LocaleCode
  sectionId: string
  headingId: string
  heading: string
  description?: string | null
  docs: ThingCardView[]
  cursorPopup?: string | null
  cursorPopupEmpty?: string | null
  cursorPopupItem?: string | null
  cursorPopupViewAll?: string | null
  showViewAll?: boolean
  viewAllLabel?: Record<LocaleCode, string> | string | null
  viewAllHref?: string | null
  className?: string
}

export function ThingsSection({
  locale,
  sectionId,
  headingId,
  heading,
  docs,
  cursorPopup,
  cursorPopupEmpty,
  cursorPopupItem,
  cursorPopupViewAll,
  showViewAll = false,
  viewAllLabel,
  viewAllHref,
  className,
}: ThingsSectionProps) {
  const columns = useGridColumnCount({ base: 1, sm: 2, lg: 3 })
  const sectionCursor =
    docs.length === 0 ? cursorPopupEmpty || cursorPopup || undefined : cursorPopup || undefined

  const resolvedViewAllLabel =
    typeof viewAllLabel === 'string'
      ? viewAllLabel
      : (viewAllLabel?.[locale] ?? viewAllLabel?.['en'] ?? '')

  if (docs.length === 0) {
    return (
      <section
        id={sectionId}
        aria-labelledby={headingId}
        data-feed-type="things"
        data-cursor-popup={sectionCursor}
        className={className}
      >
        <SectionHeader id={headingId} heading={heading} />
      </section>
    )
  }

  return (
    <section
      id={sectionId}
      aria-labelledby={headingId}
      data-feed-type="things"
      data-cursor-popup={sectionCursor}
      className={cn(
        className,
        'border-l-primary border-l-3 md:border-l-4 lg:border-l-5',
      )}
    >
      <SectionHeader id={headingId} heading={heading} />

      <ThingsGrid>
        {docs.map((thing, index) => (
          <RevealGridItem
            key={thing.id}
            index={index}
            columns={columns}
            dataAttributes={{ 'data-things-grid-item': true }}
            className={cn(
              'relative z-0 self-stretch',
              'min-w-0',
            )}
          >
            <ThingCard thing={thing} locale={locale} index={index} cursorPopup={cursorPopupItem} />
          </RevealGridItem>
        ))}
      </ThingsGrid>
      <div className={cn(
        'bg-background',
        'flex h-(--header-height) items-center justify-end',
        'px-1.5 md:px-2 lg:px-3',
      )}>
        {showViewAll && viewAllHref && resolvedViewAllLabel ? (
          <Link
            href={viewAllHref}
            transitionTypes={['nav-forward']}
            data-cursor-popup={cursorPopupViewAll || resolvedViewAllLabel.toLowerCase()}
            className={cn(
              'text-foreground/90 leading-none font-medium tracking-tight lowercase',
              'hover:text-primary transition-colors',
              'text-xs md:text-sm lg:text-base',
            )}
          >
            {resolvedViewAllLabel}
          </Link>
        ) : null}
      </div>
    </section>
  )
}
