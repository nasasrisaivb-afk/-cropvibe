import type { Metadata } from 'next'
import { OperationsReport } from '@/components/insights/Reports'

export const metadata: Metadata = { title: 'Operations reports' }

export default function Page() {
  return (
    <OperationsReport />
  )
}
