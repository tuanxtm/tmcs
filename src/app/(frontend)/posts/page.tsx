import type { Metadata } from 'next'

import {
  PostsFeedPage,
  generatePostsFeedMetadata,
} from '@/app/(frontend)/_components/feed/posts-feed-page'

export function generateMetadata(): Promise<Metadata> {
  return generatePostsFeedMetadata('en')
}

export default function EnglishPostsPage() {
  return <PostsFeedPage locale="en" />
}