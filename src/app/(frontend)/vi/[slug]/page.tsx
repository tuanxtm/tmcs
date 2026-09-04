import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'

import { generateDetailMetadata } from '@/app/(frontend)/_components/detail/detail-metadata'
import {
  CmsPage,
  generateCmsPageMetadata,
  isReservedPageSlug,
} from '@/app/(frontend)/_components/pages/cms-page'
import {
  getPageSlugById,
  getPostBySlug,
  getProjectBySlug,
  resolveSlug,
} from '@/app/(frontend)/_lib/page-data'

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
    return generateDetailMetadata(post, 'vi', 'featuredImage')
  }

  if (resolved.collection === 'projects') {
    const project = await getProjectBySlug('vi', slug)
    if (!project) return { title: 'Not found' }
    return generateDetailMetadata(project, 'vi', 'coverImage')
  }

  return generateCmsPageMetadata('vi', slug)
}

export default function VietnameseCmsPage({ params }: PageProps) {
  // See `[slug]/page.tsx` - wrap the slug-dependent render in <Suspense> so
  // the page itself stays in the static shell on client navigation.
  return (
    <Suspense>
      <VietnameseCmsPageBody params={params} />
    </Suspense>
  )
}

async function VietnameseCmsPageBody({ params }: PageProps) {
  const { slug } = await params
  if (isReservedPageSlug(slug)) notFound()

  const resolved = await resolveSlug('vi', slug)
  if (!resolved) notFound()

  if (resolved.collection === 'posts') {
    const post = await getPostBySlug('vi', slug)
    if (!post) notFound()

    const templateSlug = await getPageSlugById('vi', post.templatePageId)
    if (!templateSlug) notFound()
    return (
      <CmsPage locale="vi" slug={templateSlug} detailView={{ kind: 'post', view: post }} />
    )
  }

  if (resolved.collection === 'projects') {
    const project = await getProjectBySlug('vi', slug)
    if (!project) notFound()

    const templateSlug = await getPageSlugById('vi', project.templatePageId)
    if (!templateSlug) notFound()
    return (
      <CmsPage locale="vi" slug={templateSlug} detailView={{ kind: 'project', view: project }} />
    )
  }

  return <CmsPage locale="vi" slug={slug} />
}
