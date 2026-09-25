import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LiveTracking } from '@/components/insights/LiveTracking'

export const metadata: Metadata = { title: 'Tracking' }

export default function Page() {
  return (
    <Suspense>
      <LiveTracking />
    </Suspense>
  )
}
