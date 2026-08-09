import type { ReactNode } from 'react'

import { FeedSection } from '@/app/(frontend)/_components/feed/feed-section'
import { Hero } from '@/app/(frontend)/_components/blocks/hero'
import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import { ContentMediaBlock } from '@/app/(frontend)/_components/blocks/content-media'
import { TypewriterBlock } from '@/app/(frontend)/_components/blocks/typewriter'
import { ScrambleHoverBlock } from '@/app/(frontend)/_components/blocks/scramble-hover'
import { BlankSpaceBlock } from '@/app/(frontend)/_components/blocks/blank-space'
import { FooterBlock } from '@/app/(frontend)/_components/blocks/footer'
import { ThingsSection } from '@/app/(frontend)/_components/things/things-section'
import type { ContactLinks } from '@/app/(frontend)/_components/things/missing-link-dialog'
import type { NavChildView, ResolvedBlockView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'

type PageBlocksProps = {
  blocks: ResolvedBlockView[]
  locale: LocaleCode
  className?: string
  contactEmail?: string | null
  profileLinks?: NavChildView[]
  siteName: string
}

function sectionDomIds(blockId: string) {
  return {
    sectionId: `block-${blockId}`,
    headingId: `heading-${blockId}`,
  }
}

/**
 * Visual placeholder for blocks whose schema exists but whose frontend
 * renderer is not implemented yet. Editors can author the content now; the
 * frontend shows a clearly-labelled "coming soon" marker so the gap is
 * obvious rather than silently dropping the block.
 */
function DeferredBlockPlaceholder({
  blockType,
  blockId,
}: {
  blockType: 'contentGallery' | 'layoutRelatedItems'
  blockId: string
}) {
  return (
    <aside
      id={`block-${blockId}`}
      aria-label={`${blockType} (placeholder)`}
      className="mx-auto my-8 max-w-3xl rounded border border-dashed border-border bg-foreground/5 px-4 py-6 text-center text-xs uppercase tracking-wide text-muted-foreground"
    >
      <span className="font-mono">{blockType}</span>
      <span className="ml-2 text-foreground/60">— coming soon</span>
    </aside>
  )
}

export function PageBlocks({
  blocks,
  locale,
  className,
  contactEmail = null,
  profileLinks = [],
  siteName,
}: PageBlocksProps) {
  if (blocks.length === 0) return null

  const contact: ContactLinks = {
    email: contactEmail,
    links: profileLinks,
  }

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        const previous = index > 0 ? blocks[index - 1] : null
        // Preserve first-fold budget: no 3rem gap between hero and the following section.
        const spaced = index > 0 && previous?.blockType !== 'layoutHero'
        const wrap = (node: ReactNode) => (
          <div key={block.id} className={spaced ? 'mt-12' : undefined}>
            {node}
          </div>
        )

        switch (block.blockType) {
          case 'layoutHero':
            return <Hero key={block.id} hero={block} />

          case 'layoutFeedSection': {
            const ids = sectionDomIds(block.id)
            // Remount when the server snapshot changes so client infinite-scroll state resets.
            const feedKey = [
              ids.sectionId,
              block.feedType,
              block.pagination,
              block.nextCursor ?? 'start',
              block.docs[0]?.id ?? 'empty',
              block.docs.length,
            ].join(':')

            if (block.feedType === 'things') {
              return wrap(
                <ThingsSection
                  key={feedKey}
                  locale={locale}
                  sectionId={ids.sectionId}
                  headingId={ids.headingId}
                  heading={block.heading}
                  description={block.description}
                  cursorPopup={block.cursorPopup}
                  cursorPopupEmpty={block.cursorPopupEmpty}
                  cursorPopupItem={block.cursorPopupItem}
                  cursorPopupViewAll={block.cursorPopupViewAll}
                  docs={block.docs}
                  contact={contact}
                  showViewAll={block.showViewAll}
                  viewAllLabel={block.viewAllLabel}
                  viewAllHref={block.viewAllHref}
                />,
              )
            }

            if (block.feedType === 'posts') {
              return wrap(
                <FeedSection
                  key={feedKey}
                  locale={locale}
                  sectionId={ids.sectionId}
                  headingId={ids.headingId}
                  heading={block.heading}
                  description={block.description}
                  cursorPopup={block.cursorPopup}
                  cursorPopupEmpty={block.cursorPopupEmpty}
                  cursorPopupItem={block.cursorPopupItem}
                  cursorPopupViewAll={block.cursorPopupViewAll}
                  feedType="posts"
                  docs={block.docs}
                  pagination={block.pagination}
                  nextCursor={block.nextCursor}
                  hasNextPage={block.hasNextPage}
                  showViewAll={block.showViewAll}
                  viewAllLabel={block.viewAllLabel}
                  viewAllHref={block.viewAllHref}
                />,
              )
            }

            if (block.feedType === 'videos') {
              return wrap(
                <FeedSection
                  key={feedKey}
                  locale={locale}
                  sectionId={ids.sectionId}
                  headingId={ids.headingId}
                  heading={block.heading}
                  description={block.description}
                  cursorPopup={block.cursorPopup}
                  cursorPopupEmpty={block.cursorPopupEmpty}
                  cursorPopupItem={block.cursorPopupItem}
                  cursorPopupViewAll={block.cursorPopupViewAll}
                  feedType="videos"
                  docs={block.docs}
                  pagination={block.pagination}
                  nextCursor={block.nextCursor}
                  hasNextPage={block.hasNextPage}
                  showViewAll={block.showViewAll}
                  viewAllLabel={block.viewAllLabel}
                  viewAllHref={block.viewAllHref}
                />,
              )
            }

            return wrap(
              <FeedSection
                key={feedKey}
                locale={locale}
                sectionId={ids.sectionId}
                headingId={ids.headingId}
                heading={block.heading}
                description={block.description}
                cursorPopup={block.cursorPopup}
                cursorPopupEmpty={block.cursorPopupEmpty}
                cursorPopupItem={block.cursorPopupItem}
                cursorPopupViewAll={block.cursorPopupViewAll}
                feedType="projects"
                docs={block.docs}
                pagination={block.pagination}
                nextCursor={block.nextCursor}
                hasNextPage={block.hasNextPage}
                showViewAll={block.showViewAll}
                viewAllLabel={block.viewAllLabel}
                viewAllHref={block.viewAllHref}
              />,
            )
          }

          case 'layoutRichTextWithoutBlock':
            return wrap(
              <section className="px-4 py-8">
                <CmsRichText
                  data={block.content}
                  className="mx-auto max-w-3xl text-sm leading-relaxed text-foreground"
                />
              </section>,
            )

          case 'contentMedia':
            return wrap(<ContentMediaBlock block={block} />)

          case 'contentGallery':
            return wrap(<DeferredBlockPlaceholder blockType="contentGallery" blockId={block.id} />)

          case 'layoutRelatedItems':
            return wrap(<DeferredBlockPlaceholder blockType="layoutRelatedItems" blockId={block.id} />)

          case 'layoutTypewriter':
            return wrap(<TypewriterBlock block={block} />)

          case 'layoutScrambleHover':
            return wrap(<ScrambleHoverBlock block={block} />)

          case 'layoutBlankSpace':
            return wrap(<BlankSpaceBlock block={block} />)

          case 'layoutFooter':
            return wrap(<FooterBlock block={block} siteName={siteName} />)

          default: {
            if (process.env.NODE_ENV !== 'production') {
              console.warn('[PageBlocks] Unsupported block type skipped.', block)
            }
            return null
          }
        }
      })}
    </div>
  )
}