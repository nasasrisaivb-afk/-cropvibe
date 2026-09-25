import type { Metadata } from 'next'
import { RevenueInsights } from '@/components/insights/RevenueInsights'

export const metadata: Metadata = { title: 'Revenue' }

export default function Page() {
  return (
    <RevenueInsights />
  )
}
