import { cache } from 'react'
import { headers } from 'next/headers'

import { parseLocale, SITE_LOCALE_HEADER } from '@/app/(frontend)/_lib/locale'

/**
 * Reads the active locale from the `SITE_LOCALE_HEADER` injected by `src/proxy.ts`.
 *
 * Wrapped with `React.cache()` so multiple server components in the same render
 * tree (e.g. `LocaleMeta` in `<head>` and `LocaleAwareShell` in `<body>`) share
 * the same value without re-reading `headers()`.
 */
export const readActiveLocale = cache(async () => {
  const headerList = await headers()
  return parseLocale(headerList.get(SITE_LOCALE_HEADER))
})