import type { Metadata } from 'next'

import { generateHomeMetadata, HomePage } from '@/app/(frontend)/_components/home/home-page'

export const dynamic = 'force-dynamic'

export function generateMetadata(): Promise<Metadata> {
  return generateHomeMetadata('en')
}

export default function EnglishHomePage() {
  return <HomePage locale="en" />
}
