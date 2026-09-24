import type { Metadata } from 'next'
import { ResourceScreen } from '@/components/resource/ResourceScreen'
import { RevenueLedgerIntro } from '@/components/insights/RevenueInsights'

export const metadata: Metadata = { title: 'Revenue ledger' }

export default function Page() {
  return (
    <ResourceScreen resource="revenue" intro={<RevenueLedgerIntro />} />
  )
}
