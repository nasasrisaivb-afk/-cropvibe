import type { Metadata } from 'next'
import { MarketplaceReport } from '@/components/insights/Reports'

export const metadata: Metadata = { title: 'Marketplace reports' }

export default function Page() {
  return (
    <MarketplaceReport />
  )
}
