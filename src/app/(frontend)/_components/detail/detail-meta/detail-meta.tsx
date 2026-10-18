import Image from 'next/image'
import { ImageGlow } from '@/app/(frontend)/_components/media/image-glow'
import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import { FieldRow } from '@/app/(frontend)/_components/layout/field-row'
import { PageBlocks } from '@/app/(frontend)/_components/blocks/page-blocks'
import type { NavItemView, PostDetailView, ProjectDetailView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import styles from './detail-meta.module.css'
type DetailMetaProps = {
  view: PostDetailView | ProjectDetailView
  locale: LocaleCode
  siteName: string
  /** Top-level nav items rendered by the site header inside the nested PageBlocks. */
  navigation: NavItemView[]
}
export function DetailMeta({ view, locale, siteName, navigation }: DetailMetaProps) {
  const readingTime = 'readingTime' in view ? view.readingTime : null
  const hasReadingTime = typeof readingTime === 'number' && readingTime > 0
  return (
    <section className={styles.root}>
      <div className={styles.spacing}>
        <div className={styles.grid}>
          <aside className={styles.metadata}>
            {view.author ? <AuthorFieldRow author={view.author} /> : null}

            {view.publishedAt ? (
              <FieldRow label="published">
                <time className={styles.mono} dateTime={view.publishedAt}>
                  {formatDate(view.publishedAt)}
                </time>
              </FieldRow>
            ) : null}

            {hasReadingTime ? (
              <FieldRow label="reading time">
                <span className={styles.mono}>{readingTime} min read</span>
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

          <article className={styles.content}>
            {view.content ? <CmsRichText data={view.content} className={styles.richText} /> : null}
            {view.blocks.length > 0 ? (
              <PageBlocks
                blocks={view.blocks}
                locale={locale}
                siteName={siteName}
                navigation={navigation}
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
      <div className={styles.author}>
        {author.avatar ? (
          <ImageGlow className={styles.avatar}>
            <Image
              src={author.avatar.url}
              alt={author.avatar.alt || author.name}
              fill
              sizes="40px"
              className={styles.avatarImage}
            />
          </ImageGlow>
        ) : null}
        <span className={styles.authorCopy}>
          <span>{author.name}</span>
          {author.jobTitle ? <span className={styles.authorRole}>{author.jobTitle}</span> : null}
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
