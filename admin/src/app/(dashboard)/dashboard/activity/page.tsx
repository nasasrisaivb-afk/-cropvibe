import type { Metadata } from 'next'
import { ActivityFeed } from '@/components/insights/ActivityFeed'

export const metadata: Metadata = { title: 'Platform activity' }

export default function Page() {
  return (
    <ActivityFeed />
  )
}
