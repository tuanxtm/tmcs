'use client'

import { ThingsGrid } from '@/app/(frontend)/_components/layout/things-grid'
import {
  RevealGridItem,
  useGridColumnCount,
} from '@/app/(frontend)/_components/layout/reveal-grid-item'
import { SectionHeader } from '@/app/(frontend)/_components/layout/section-header'
import { ThingShowcaseTile } from '@/app/(frontend)/_components/things/thing-showcase-tile'
import type { ThingCardView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'

type ThingsGridSectionProps = {
  locale: LocaleCode
  heading: string
  docs: ThingCardView[]
  cursorPopup: string
  cursorPopupEmpty: string
  cursorPopupItem: string
}

export function ThingsGridSection({
  locale,
  heading,
  docs,
  cursorPopup,
  cursorPopupEmpty,
  cursorPopupItem,
}: ThingsGridSectionProps) {
  const columns = useGridColumnCount({ base: 1, sm: 2, lg: 3 })
  const sectionCursor = docs.length === 0 ? cursorPopupEmpty || cursorPopup : cursorPopup

  if (docs.length === 0) {
    return (
      <section
        id="things-feed"
        aria-labelledby="things-feed-heading"
        data-feed-type="things"
        data-cursor-popup={sectionCursor}
      >
        <SectionHeader id="things-feed-heading" heading={heading} />
      </section>
    )
  }

  return (
    <section
      id="things-feed"
      aria-labelledby="things-feed-heading"
      data-feed-type="things"
      data-cursor-popup={sectionCursor}
    >
      <SectionHeader id="things-feed-heading" heading={heading} />

      <ThingsGrid>
        {docs.map((thing, index) => (
          <RevealGridItem
            key={thing.id}
            index={index}
            columns={columns}
            dataAttributes={{ 'data-things-grid-item': true }}
            className="relative z-0 min-w-0"
          >
            <ThingShowcaseTile
              thing={thing}
              locale={locale}
              cursorPopup={cursorPopupItem}
            />
          </RevealGridItem>
        ))}
      </ThingsGrid>
    </section>
  )
}