'use client'

import { ThingsGrid } from '@/app/(frontend)/_components/layout/things-grid'
import { ViewAllFeedTile } from '@/app/(frontend)/_components/feed/view-all-feed-tile'
import {
  RevealGridItem,
  useGridColumnCount,
} from '@/app/(frontend)/_components/layout/reveal-grid-item'
import { SectionHeader } from '@/app/(frontend)/_components/layout/section-header'
import { ThingShowcaseTile } from '@/app/(frontend)/_components/things/thing-showcase-tile'
import type { ThingCardView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'

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
  viewAllLabel?: string | null
  viewAllHref?: string | null
  className?: string
}

export function ThingsSection({
  locale,
  sectionId,
  headingId,
  heading,
  description,
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
      className={className}
    >
      <SectionHeader id={headingId} heading={heading} />

      <ThingsGrid>
        {docs.map((thing, index) => (
          <RevealGridItem
            key={thing.id}
            index={index}
            columns={columns}
            dataAttributes={{ 'data-things-grid-item': true }}
            className="relative z-0 min-w-0"
          >
            <ThingShowcaseTile thing={thing} locale={locale} cursorPopup={cursorPopupItem} />
          </RevealGridItem>
        ))}

        {showViewAll && viewAllHref && viewAllLabel ? (
          <RevealGridItem
            index={docs.length}
            columns={columns}
            dataAttributes={{ 'data-things-grid-item': true }}
            className="relative z-0 min-w-0 self-stretch"
          >
            <ViewAllFeedTile
              href={viewAllHref}
              label={viewAllLabel}
              cursorPopup={cursorPopupViewAll || viewAllLabel.toLowerCase()}
            />
          </RevealGridItem>
        ) : null}
      </ThingsGrid>
    </section>
  )
}
