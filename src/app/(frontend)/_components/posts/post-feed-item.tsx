'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'

import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

import type { PostCardView } from '@/app/(frontend)/_lib/types'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'

type PostFeedItemProps = {
  post: PostCardView
  locale: LocaleCode
  index: number
}

function formatDate(value: string | null, locale: LocaleCode): string | null {
  if (!value) return null
  try {
    return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value))
  } catch {
    return null
  }
}

function Title({ post }: { post: PostCardView }) {
  if (post.href) {
    return (
      <Link href={post.href} className="transition-opacity hover:opacity-70">
        {post.title}
      </Link>
    )
  }
  return <span>{post.title}</span>
}

function Cover({ post, sizes }: { post: PostCardView; sizes: string }) {
  const cover = post.image ? (
    <CmsImage
      media={post.image}
      sizes={sizes}
      className="aspect-[16/10]"
      imgClassName="aspect-[16/10] transition-transform duration-500 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
    />
  ) : (
    <div className="flex aspect-[16/10] items-center justify-center bg-muted/30">
      <span className="page-label">No cover</span>
    </div>
  )

  if (post.href) {
    return (
      <Link href={post.href} className="group block overflow-hidden border border-border">
        {cover}
      </Link>
    )
  }

  return <div className="overflow-hidden border border-border">{cover}</div>
}

export function PostFeedItem({ post, locale, index }: PostFeedItemProps) {
  const reduceMotion = useReducedMotion()
  const dateLabel = formatDate(post.publishedAt, locale)
  const label = String(index + 1).padStart(2, '0')

  return (
    <motion.article
      className="page-rule-solid min-h-[min(100svh,42rem)] border-b border-border lg:min-h-0"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="page-frame">
        {/* Mobile: text above image */}
        <div className="flex flex-col gap-6 py-10 md:hidden">
          <div>
            <p className="page-label">
              {label} / Post
              {dateLabel ? ` · ${dateLabel}` : ''}
            </p>
            <h2 className="mt-4 text-3xl font-medium tracking-tight">
              <Title post={post} />
            </h2>
            {post.excerpt ? (
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{post.excerpt}</p>
            ) : null}
            <MetaRow post={post} className="mt-4" />
          </div>

          <Cover post={post} sizes="100vw" />
        </div>

        {/* Tablet / desktop: 1/3 title left, 2/3 content right */}
        <div className="hidden grid-cols-12 gap-0 py-12 md:grid">
          <div className="col-span-5 border-r border-dashed border-[color:var(--border-dashed)] pr-6 lg:col-span-4 lg:pr-8">
            <p className="page-label">
              {label} / Post
              {dateLabel ? ` · ${dateLabel}` : ''}
            </p>
            <h2 className="mt-5 text-3xl font-medium tracking-tight lg:text-4xl">
              <Title post={post} />
            </h2>
            <MetaRow post={post} className="mt-6" />
          </div>

          <div className="col-span-7 pl-6 lg:col-span-8 lg:pl-10">
            <Cover post={post} sizes="(min-width: 1024px) 48vw, 58vw" />
            {post.excerpt ? (
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

function MetaRow({ post, className }: { post: PostCardView; className?: string }) {
  const bits = [
    post.authorName,
    post.readingTime ? `${post.readingTime} min` : null,
    post.categories[0]?.title,
  ].filter(Boolean)

  if (bits.length === 0) return null

  return (
    <p
      className={cn(
        'font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground',
        className,
      )}
    >
      {bits.join(' · ')}
    </p>
  )
}
