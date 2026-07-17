'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[50vh] dash-b py-20">
      <p className="page-label">Error</p>
      <h1 className="mt-4 text-3xl font-medium tracking-tight">Something went wrong</h1>
      <p className="mt-3 max-w-lg text-sm text-muted-foreground">
        The page could not be loaded. Please try again.
      </p>
      <Button type="button" className="mt-6 min-h-11" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
