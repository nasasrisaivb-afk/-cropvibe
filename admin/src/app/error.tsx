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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-base p-6 text-center">
      <h1 className="text-3xl font-bold text-text-primary">Something went wrong</h1>
      <p className="max-w-md text-sm text-text-secondary">{error.message || 'Unexpected error'}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
