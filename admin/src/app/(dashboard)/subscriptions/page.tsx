import type { Metadata } from 'next'
import { ResourceScreen } from '@/components/resource/ResourceScreen'

export const metadata: Metadata = { title: 'Subscriptions' }

export default function Page() {
  return <ResourceScreen resource="subscriptions" />
}
