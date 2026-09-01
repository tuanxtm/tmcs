import Image from 'next/image'

import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import { FieldRow } from '@/app/(frontend)/_components/layout/field-row'
import { PageBlocks } from '@/app/(frontend)/_components/blocks/page-blocks'
import type { PostDetailView, ProjectDetailView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

type DetailMetaProps = {
  view: PostDetailView | ProjectDetailView
  locale: LocaleCode
  siteName: string
}

export function DetailMeta({ view, locale, siteName }: DetailMetaProps) {
  const readingTime = 'readingTime' in view ? view.readingTime : null
  const hasReadingTime = typeof readingTime === 'number' && readingTime > 0

  return (
    <section
      className={cn(
        'page-frame bg-background',
        'border-l-primary border-l-3 md:border-l-4 lg:border-l-5',
        'dash-line-b',
      )}
    >
      <div className="pt-2 md:pt-1 md:pb-1.5">
        <div
          className={cn(
            'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4',
            'gap-y-4 md:gap-y-8 lg:gap-x-8 lg:gap-y-16',
          )}
        >
          <aside
            className={cn(
              'px-2 py-4 md:p-3 lg:p-4',
              'flex flex-col gap-y-4 md:gap-y-8 lg:gap-y-16',
            )}
          >
            {view.author ? <AuthorFieldRow author={view.author} /> : null}

            {view.publishedAt ? (
              <FieldRow label="published">
                <time dateTime={view.publishedAt}>{formatDate(view.publishedAt)}</time>
              </FieldRow>
            ) : null}

            {hasReadingTime ? (
              <FieldRow label="reading time">
                <span>{readingTime} min read</span>
              </FieldRow>
            ) : null}

            {view.tags.length > 0 ? (
              <FieldRow label="tags">
                <span>{view.tags.map((t) => t.name).join(', ')}</span>
              </FieldRow>
            ) : null}

            {view.categories.length > 0 ? (
              <FieldRow label="categories">
                <span>{view.categories.map((c) => c.name).join(', ')}</span>
              </FieldRow>
            ) : null}
          </aside>

          <article
            className={cn('col-span-1 md:col-span-2 lg:col-span-3', 'px-2 py-4 md:p-3 lg:p-4')}
          >
            {view.content ? (
              <CmsRichText
                data={view.content}
                className="text-foreground text-sm leading-relaxed md:text-base"
              />
            ) : null}
            {view.blocks.length > 0 ? (
              <PageBlocks
                blocks={view.blocks}
                locale={locale}
                siteName={siteName}
                className="mt-6"
              />
            ) : null}
          </article>
        </div>
      </div>
    </section>
  )
}

function AuthorFieldRow({
  author,
}: {
  author: NonNullable<PostDetailView['author']> | NonNullable<ProjectDetailView['author']>
}) {
  return (
    <FieldRow label="author">
      <div className="flex items-center gap-3">
        {author.avatar ? (
          <span className="relative inline-block size-8 overflow-hidden rounded-full md:size-10">
            <Image
              src={author.avatar.url}
              alt={author.avatar.alt || author.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          </span>
        ) : null}
        <span className="flex flex-col leading-tight">
          <span>{author.name}</span>
          {author.jobTitle ? (
            <span className="text-muted-foreground/70 text-[0.75rem] tracking-tight">
              {author.jobTitle}
            </span>
          ) : null}
        </span>
      </div>
    </FieldRow>
  )
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}
