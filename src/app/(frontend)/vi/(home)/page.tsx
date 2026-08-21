import type { Metadata } from 'next'

import { generateHomeMetadata, HomePage } from '@/app/(frontend)/_components/home/home-page'

export function generateMetadata(): Promise<Metadata> {
  return generateHomeMetadata('vi')
}

export default function VietnameseHomePage() {
  return <HomePage locale="vi" />
}
