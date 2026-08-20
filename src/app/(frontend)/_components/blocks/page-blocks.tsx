import { FeedSection } from '@/app/(frontend)/_components/feed/feed-section'
import { Hero } from '@/app/(frontend)/_components/blocks/hero'
import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import { ContentMediaBlock } from '@/app/(frontend)/_components/blocks/content-media'
import { TypewriterBlock } from '@/app/(frontend)/_components/blocks/typewriter'
import { ScrambleHoverBlock } from '@/app/(frontend)/_components/blocks/scramble-hover'
import { BlankSpaceBlock } from '@/app/(frontend)/_components/blocks/blank-space'
import { FooterBlock } from '@/app/(frontend)/_components/blocks/footer'
import { ThingsSection } from '@/app/(frontend)/_components/things/things-section'
import type { ResolvedBlockView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'

type PageBlocksProps = {
  blocks: ResolvedBlockView[]
  locale: LocaleCode
  className?: string
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
      className="border-border bg-foreground/5 text-muted-foreground mx-auto my-8 max-w-3xl rounded border border-dashed px-4 py-6 text-center text-xs tracking-wide uppercase"
    >
      <span className="font-mono">{blockType}</span>
      <span className="text-foreground/60 ml-2">- coming soon</span>
    </aside>
  )
}

export function PageBlocks({ blocks, locale, className, siteName }: PageBlocksProps) {
  if (blocks.length === 0) return null

  return (
    <div className={className}>
      {blocks.map((block) => {
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
              return (
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
                  showViewAll={block.showViewAll}
                  viewAllLabel={block.viewAllLabel}
                  viewAllHref={block.viewAllHref}
                />
              )
            }

            if (block.feedType === 'posts') {
              return (
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
                  decorations={block.decorations}
                />
              )
            }

            if (block.feedType === 'videos') {
              return (
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
                  decorations={block.decorations}
                />
              )
            }

            return (
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
                decorations={block.decorations}
              />
            )
          }

          case 'layoutRichTextWithoutBlock':
            return (
              <section key={block.id} className="px-4 py-8">
                <CmsRichText
                  data={block.content}
                  className="text-foreground mx-auto max-w-3xl text-sm leading-relaxed"
                />
              </section>
            )

          case 'contentMedia':
            return <ContentMediaBlock key={block.id} block={block} />

          case 'contentGallery':
            return (
              <DeferredBlockPlaceholder
                key={block.id}
                blockType="contentGallery"
                blockId={block.id}
              />
            )

          case 'layoutRelatedItems':
            return (
              <DeferredBlockPlaceholder
                key={block.id}
                blockType="layoutRelatedItems"
                blockId={block.id}
              />
            )

          case 'layoutTypewriter':
            return <TypewriterBlock key={block.id} block={block} />

          case 'layoutScrambleHover':
            return <ScrambleHoverBlock key={block.id} block={block} />

          case 'layoutBlankSpace':
            return <BlankSpaceBlock key={block.id} block={block} />

          case 'layoutFooter':
            return <FooterBlock key={block.id} block={block} locale={locale} siteName={siteName} />

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
