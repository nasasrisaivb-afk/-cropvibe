import type { Metadata } from 'next'
import { ResourceScreen } from '@/components/resource/ResourceScreen'

export const metadata: Metadata = { title: 'Disputes & issues' }

export default function Page() {
  return <ResourceScreen resource="disputes" />
}
