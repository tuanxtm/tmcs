import { headers } from 'next/headers'

import { parseLocale, SITE_LOCALE_HEADER } from '@/app/(frontend)/_lib/locale'
import { NotFoundPage } from '@/app/(frontend)/_components/pages/not-found-page'

export default async function NotFound() {
  const headerList = await headers()
  const locale = parseLocale(headerList.get(SITE_LOCALE_HEADER))
  return <NotFoundPage locale={locale} />
}
