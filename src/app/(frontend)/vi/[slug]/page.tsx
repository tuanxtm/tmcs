import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  CmsPage,
  generateCmsPageMetadata,
  isReservedPageSlug,
} from '@/app/(frontend)/_components/pages/cms-page'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (isReservedPageSlug(slug)) {
    return { title: 'Not found' }
  }
  return generateCmsPageMetadata('vi', slug)
}

export default async function VietnameseCmsPage({ params }: PageProps) {
  const { slug } = await params
  if (isReservedPageSlug(slug)) notFound()
  return <CmsPage locale="vi" slug={slug} />
}
