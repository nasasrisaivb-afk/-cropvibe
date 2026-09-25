import type { Metadata } from 'next'
import { ResourceScreen } from '@/components/resource/ResourceScreen'

export const metadata: Metadata = { title: 'Drivers' }

export default function Page() {
  return <ResourceScreen resource="driverUsers" />
}
