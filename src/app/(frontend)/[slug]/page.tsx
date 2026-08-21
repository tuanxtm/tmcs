import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { DetailPage } from '@/app/(frontend)/_components/detail/detail-page'
import { generateDetailMetadata } from '@/app/(frontend)/_components/detail/detail-metadata'
import {
  CmsPage,
  generateCmsPageMetadata,
  isReservedPageSlug,
} from '@/app/(frontend)/_components/pages/cms-page'
import {
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

  const resolved = await resolveSlug('en', slug)
  if (!resolved) return { title: 'Not found' }

  if (resolved.collection === 'posts') {
    const post = await getPostBySlug('en', slug)
    if (!post) return { title: 'Not found' }
    return generateDetailMetadata(post, 'en', 'featuredImage')
  }

  if (resolved.collection === 'projects') {
    const project = await getProjectBySlug('en', slug)
    if (!project) return { title: 'Not found' }
    return generateDetailMetadata(project, 'en', 'coverImage')
  }

  return generateCmsPageMetadata('en', slug)
}

export default async function EnglishCmsPage({ params }: PageProps) {
  const { slug } = await params
  if (isReservedPageSlug(slug)) notFound()

  const resolved = await resolveSlug('en', slug)
  if (!resolved) notFound()

  if (resolved.collection === 'posts') {
    const post = await getPostBySlug('en', slug)
    if (!post) notFound()
    return <DetailPage view={post} locale="en" imageKey="featuredImage" />
  }

  if (resolved.collection === 'projects') {
    const project = await getProjectBySlug('en', slug)
    if (!project) notFound()
    return <DetailPage view={project} locale="en" imageKey="coverImage" />
  }

  return <CmsPage locale="en" slug={slug} />
}
