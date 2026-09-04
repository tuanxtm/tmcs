import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'

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
  getThingBySlug,
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
    // Post carries its own SEO. Template pages only adjust layout, not metadata.
    return generateDetailMetadata(post, 'en', 'featuredImage')
  }

  if (resolved.collection === 'projects') {
    const project = await getProjectBySlug('en', slug)
    if (!project) return { title: 'Not found' }
    return generateDetailMetadata(project, 'en', 'coverImage')
  }

  if (resolved.collection === 'things') {
    return { title: 'Redirecting...' }
  }

  return generateCmsPageMetadata('en', slug)
}

export default function EnglishCmsPage({ params }: PageProps) {
  // `await params` is runtime data; wrap the slug-dependent render in
  // <Suspense> so the page itself stays in the static shell and the body
  // streams into this boundary on navigation.
  return (
    <Suspense>
      <EnglishCmsPageBody params={params} />
    </Suspense>
  )
}

async function EnglishCmsPageBody({ params }: PageProps) {
  const { slug } = await params
  if (isReservedPageSlug(slug)) notFound()

  const resolved = await resolveSlug('en', slug)
  if (!resolved) notFound()

  if (resolved.collection === 'posts') {
    const post = await getPostBySlug('en', slug)
    if (!post) notFound()

    // `templatePage` is required on the collection, so `templatePageId` is
    // always a number. If the page is unpublished or missing in this locale,
    // route to a 404 - there is no fallback path anymore.
    const templateSlug = await getPageSlugById('en', post.templatePageId)
    if (!templateSlug) notFound()
    return (
      <CmsPage locale="en" slug={templateSlug} detailView={{ kind: 'post', view: post }} />
    )
  }

  if (resolved.collection === 'projects') {
    const project = await getProjectBySlug('en', slug)
    if (!project) notFound()

    const templateSlug = await getPageSlugById('en', project.templatePageId)
    if (!templateSlug) notFound()
    return (
      <CmsPage locale="en" slug={templateSlug} detailView={{ kind: 'project', view: project }} />
    )
  }

  if (resolved.collection === 'things') {
    const thing = await getThingBySlug('en', slug)
    if (!thing) notFound()
    if (!thing.primaryUrl) notFound()
    redirect(thing.primaryUrl)
  }

  return <CmsPage locale="en" slug={slug} />
}
