import type { Metadata } from 'next'
import { ResourceScreen } from '@/components/resource/ResourceScreen'

export const metadata: Metadata = { title: 'Bookings' }

export default function Page() {
  return <ResourceScreen resource="bookings" />
}
