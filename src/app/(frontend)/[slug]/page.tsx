import type { Metadata } from 'next'

import {
  CmsPage,
  generateCmsPageMetadata,
  isReservedPageSlug,
} from '@/app/(frontend)/_components/pages/cms-page'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (isReservedPageSlug(slug)) {
    return { title: 'Not found' }
  }
  return generateCmsPageMetadata('en', slug)
}

export default async function EnglishCmsPage({ params }: PageProps) {
  const { slug } = await params
  if (isReservedPageSlug(slug)) notFound()
  return <CmsPage locale="en" slug={slug} />
}
