import type { Metadata } from 'next'

import {
  VideosFeedPage,
  generateVideosFeedMetadata,
} from '@/app/(frontend)/_components/feed/videos-feed-page'

export function generateMetadata(): Promise<Metadata> {
  return generateVideosFeedMetadata('vi')
}

export default function VietnameseVideosPage() {
  return <VideosFeedPage locale="vi" />
}