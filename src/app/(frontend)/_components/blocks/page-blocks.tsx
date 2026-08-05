import Link from 'next/link'
import type { ReactNode } from 'react'

import { FeedSection } from '@/app/(frontend)/_components/feed/feed-section'
import { Hero } from '@/app/(frontend)/_components/hero'
import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import { TypewriterBlock } from '@/app/(frontend)/_components/blocks/typewriter'
import { ScrambleHoverBlock } from '@/app/(frontend)/_components/blocks/scramble-hover'
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
        const spaced = index > 0 && previous?.blockType !== 'hero'
        const wrap = (node: ReactNode) => (
          <div key={block.id} className={spaced ? 'mt-12' : undefined}>
            {node}
          </div>
        )

        switch (block.blockType) {
          case 'hero':
            return <Hero key={block.id} hero={block} />

          case 'feedSection': {
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

          case 'projectsGrid': {
            const ids = sectionDomIds(block.id)
            const feedKey = [
              ids.sectionId,
              'projects',
              'static',
              'start',
              block.docs[0]?.id ?? 'empty',
              block.docs.length,
            ].join(':')
            return wrap(
              <FeedSection
                key={feedKey}
                locale={locale}
                sectionId={ids.sectionId}
                headingId={ids.headingId}
                heading={block.heading || 'projects'}
                feedType="projects"
                docs={block.docs}
                showViewAll={false}
              />,
            )
          }

          case 'richText':
            return wrap(
              <section className="px-4 py-8">
                <CmsRichText
                  data={block.content}
                  className="mx-auto max-w-3xl text-sm leading-relaxed text-foreground"
                />
              </section>,
            )

          case 'media':
            return wrap(
              <section className="px-4 py-8">
                <figure className="mx-auto max-w-4xl">
                  <CmsImage
                    media={block.media}
                    sizes="(min-width: 1024px) 56rem, 100vw"
                    className="w-full"
                    imgClassName="h-auto w-full"
                  />
                  {block.caption ? (
                    <figcaption className="mt-2 font-mono text-xs text-muted-foreground">
                      {block.caption}
                    </figcaption>
                  ) : null}
                </figure>
              </section>,
            )

          case 'callToAction':
            return wrap(
              <section className="px-4 py-10">
                <div className="mx-auto flex max-w-3xl flex-col gap-3 text-center">
                  <h2 className="display-title text-foreground">{block.heading}</h2>
                  {block.body ? (
                    <p className="font-mono text-sm text-muted-foreground">{block.body}</p>
                  ) : null}
                  {block.links.length > 0 ? (
                    <ul className="mt-2 flex flex-wrap items-center justify-center gap-3">
                      {block.links.map((link) => (
                        <li key={link.id}>
                          <Link
                            href={link.href}
                            target={link.newTab ? '_blank' : undefined}
                            rel={
                              link.newTab || link.external ? 'noopener noreferrer' : undefined
                            }
                            className="inline-flex min-h-11 items-center border border-foreground px-4 font-mono text-xs uppercase tracking-wide text-foreground transition-colors hover:bg-hover-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>,
            )

          case 'typewriter':
            return wrap(<TypewriterBlock block={block} />)

          case 'scramble-hover':
            return wrap(<ScrambleHoverBlock block={block} />)

          case 'footer':
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
