import type { Metadata } from 'next'
import { ResourceScreen } from '@/components/resource/ResourceScreen'

export const metadata: Metadata = { title: 'Listing approvals' }

export default function Page() {
  return <ResourceScreen resource="listingApprovals" />
}
