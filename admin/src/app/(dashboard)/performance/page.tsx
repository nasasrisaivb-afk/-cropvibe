import type { Metadata } from 'next'
import { PlatformPerformance } from '@/components/insights/PlatformPerformance'

export const metadata: Metadata = { title: 'Platform performance' }

export default function Page() {
  return (
    <PlatformPerformance />
  )
}
