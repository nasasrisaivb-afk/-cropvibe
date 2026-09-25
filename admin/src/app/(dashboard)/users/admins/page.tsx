import type { Metadata } from 'next'
import { ResourceScreen } from '@/components/resource/ResourceScreen'

export const metadata: Metadata = { title: 'Admins' }

export default function Page() {
  return <ResourceScreen resource="admins" />
}
