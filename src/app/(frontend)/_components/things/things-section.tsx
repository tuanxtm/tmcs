'use client'

import { ThingsGrid } from '@/app/(frontend)/_components/layout/things-grid'
import {
  RevealGridItem,
  useGridColumnCount,
} from '@/app/(frontend)/_components/layout/reveal-grid-item'
import { ViewAllFeedCard } from '@/app/(frontend)/_components/feed/view-all-feed-card'
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
        'border-l-primary dash-line-b border-l-3 md:border-l-4 lg:border-l-5',
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
            className={cn('relative z-0 min-w-0 self-stretch')}
          >
            <ThingCard thing={thing} locale={locale} index={index} cursorPopup={cursorPopupItem} />
          </RevealGridItem>
        ))}

        {showViewAll && viewAllHref && viewAllLabel ? (
          <RevealGridItem
            index={docs.length}
            columns={columns}
            dataAttributes={{ 'data-things-grid-item': true }}
            className={cn('relative z-0 min-w-0 self-stretch')}
          >
            <ViewAllFeedCard
              href={viewAllHref!}
              label={
                typeof viewAllLabel === 'string'
                  ? viewAllLabel
                  : (viewAllLabel?.[locale] ?? viewAllLabel?.['en'] ?? '')
              }
              cursorPopup={cursorPopupViewAll || undefined}
            />
          </RevealGridItem>
        ) : null}
      </ThingsGrid>
      <div className="bg-background h-(--header-height)"></div>
    </section>
  )
}
