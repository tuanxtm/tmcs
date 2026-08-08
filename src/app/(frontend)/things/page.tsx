import type { Metadata } from 'next'

import ThingsFeedPage, {
  generateThingsFeedMetadata,
} from '@/app/(frontend)/_components/feed/things-feed-page'

export function generateMetadata(): Promise<Metadata> {
  return generateThingsFeedMetadata('en')
}

export default function EnglishThingsPage() {
  return <ThingsFeedPage locale="en" />
}