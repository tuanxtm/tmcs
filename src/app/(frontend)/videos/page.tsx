import type { Metadata } from 'next'

import {
  VideosFeedPage,
  generateVideosFeedMetadata,
} from '@/app/(frontend)/_components/feed/videos-feed-page'

export function generateMetadata(): Promise<Metadata> {
  return generateVideosFeedMetadata('en')
}

export default function EnglishVideosPage() {
  return <VideosFeedPage locale="en" />
}