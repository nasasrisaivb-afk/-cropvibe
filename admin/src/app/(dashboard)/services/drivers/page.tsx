import type { Metadata } from 'next'
import { ResourceScreen } from '@/components/resource/ResourceScreen'

export const metadata: Metadata = { title: 'Driver services' }

export default function Page() {
  return <ResourceScreen resource="drivers" />
}
