import type { Metadata } from 'next'

import {
  ProjectsFeedPage,
  generateProjectsFeedMetadata,
} from '@/app/(frontend)/_components/feed/projects-feed-page'

export function generateMetadata(): Promise<Metadata> {
  return generateProjectsFeedMetadata('vi')
}

export default function VietnameseProjectsPage() {
  return <ProjectsFeedPage locale="vi" />
}