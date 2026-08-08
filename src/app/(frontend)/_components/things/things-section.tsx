'use client'

import { ViewAllFeedTile } from '@/app/(frontend)/_components/feed/view-all-feed-tile'
import {
  RevealGridItem,
  useGridColumnCount,
} from '@/app/(frontend)/_components/layout/reveal-grid-item'
import { SectionHeader } from '@/app/(frontend)/_components/layout/section-header'
import { ThingShowcaseTile } from '@/app/(frontend)/_components/things/thing-showcase-tile'
import type { ContactLinks } from '@/app/(frontend)/_components/things/missing-link-dialog'
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
  contact: ContactLinks
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
  contact,
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

  const descriptionNode = description ? (
    <p className="px-2 pb-3 text-xs leading-relaxed text-muted-foreground">
      {description}
    </p>
  ) : null

  if (docs.length === 0) {
    return (
      <section
        id={sectionId}
        aria-labelledby={headingId}
        data-feed-type="things"
        data-cursor-popup={sectionCursor}
        className={className}
      >
        <SectionHeader id={headingId}>{heading}</SectionHeader>
        {descriptionNode}
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
      <SectionHeader id={headingId}>{heading}</SectionHeader>
      {descriptionNode}

      <div className={cn('things-grid dash-t dash-b')}>
        <div className="things-grid-rules" aria-hidden="true">
          <span className="things-grid-rule" />
          <span className="things-grid-rule" />
        </div>

        {docs.map((thing, index) => (
          <RevealGridItem
            key={thing.id}
            index={index}
            columns={columns}
            className="things-grid-item"
          >
            <ThingShowcaseTile
              thing={thing}
              locale={locale}
              contact={contact}
              cursorPopup={cursorPopupItem}
            />
          </RevealGridItem>
        ))}

        {showViewAll && viewAllHref && viewAllLabel ? (
          <RevealGridItem
            index={docs.length}
            columns={columns}
            className="things-grid-item self-stretch"
          >
            <ViewAllFeedTile
              href={viewAllHref}
              label={viewAllLabel}
              cursorPopup={cursorPopupViewAll || viewAllLabel.toLowerCase()}
            />
          </RevealGridItem>
        ) : null}
      </div>
    </section>
  )
}
