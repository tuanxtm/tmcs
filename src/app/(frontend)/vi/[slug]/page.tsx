import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { generatePostMetadata, PostPage } from '@/app/(frontend)/_components/posts/post-page'
import {
  CmsPage,
  generateCmsPageMetadata,
  isReservedPageSlug,
} from '@/app/(frontend)/_components/pages/cms-page'
import { getPageBySlug, getPostBySlug, resolveSlug } from '@/app/(frontend)/_lib/page-data'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (isReservedPageSlug(slug)) return { title: 'Not found' }

  const resolved = await resolveSlug('vi', slug)
  if (!resolved) return { title: 'Not found' }

  if (resolved.collection === 'posts') {
    const post = await getPostBySlug('vi', slug)
    if (!post) return { title: 'Not found' }
    return generatePostMetadata(post, 'vi')
  }

  return generateCmsPageMetadata('vi', slug)
}

export default async function VietnameseCmsPage({ params }: PageProps) {
  const { slug } = await params
  if (isReservedPageSlug(slug)) notFound()

  const resolved = await resolveSlug('vi', slug)
  if (!resolved) notFound()

  if (resolved.collection === 'posts') {
    const post = await getPostBySlug('vi', slug)
    if (!post) notFound()
    return <PostPage view={post} locale="vi" />
  }

  return <CmsPage locale="vi" slug={slug} />
}
