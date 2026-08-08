import type { Metadata } from 'next'

import {
  ProjectsFeedPage,
  generateProjectsFeedMetadata,
} from '@/app/(frontend)/_components/feed/projects-feed-page'

export function generateMetadata(): Promise<Metadata> {
  return generateProjectsFeedMetadata('en')
}

export default function EnglishProjectsPage() {
  return <ProjectsFeedPage locale="en" />
}