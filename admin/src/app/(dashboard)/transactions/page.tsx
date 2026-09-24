import type { Metadata } from 'next'
import { ResourceScreen } from '@/components/resource/ResourceScreen'

export const metadata: Metadata = { title: 'Transactions' }

export default function Page() {
  return <ResourceScreen resource="transactions" />
}
