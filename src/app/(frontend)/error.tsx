'use client'

import { useEffect } from 'react'

import { useLocale } from '@/app/(frontend)/_components/providers/locale'
import { ErrorPage } from '@/app/(frontend)/_components/pages/error-page'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const locale = useLocale()

  useEffect(() => {
    console.error(error)
  }, [error])

  return <ErrorPage locale={locale} reset={reset} />
}
