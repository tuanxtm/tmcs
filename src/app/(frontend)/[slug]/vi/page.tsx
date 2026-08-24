import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

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
  getThingBySlug,
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

  if (resolved.collection === 'things') {
    return { title: 'Redirecting...' }
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
    return <DetailPage view={post} locale="vi" imageKey="featuredImage" />
  }

  if (resolved.collection === 'projects') {
    const project = await getProjectBySlug('vi', slug)
    if (!project) notFound()
    return <DetailPage view={project} locale="vi" imageKey="coverImage" />
  }

  if (resolved.collection === 'things') {
    const thing = await getThingBySlug('vi', slug)
    if (!thing) notFound()
    if (!thing.primaryUrl) notFound()
    redirect(thing.primaryUrl)
  }

  return <CmsPage locale="vi" slug={slug} />
}
