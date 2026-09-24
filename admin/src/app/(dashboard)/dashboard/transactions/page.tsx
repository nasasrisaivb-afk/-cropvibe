import type { Metadata } from 'next'
import { TransactionMonitor } from '@/components/insights/TransactionMonitor'

export const metadata: Metadata = { title: 'Transactions monitor' }

export default function Page() {
  return (
    <TransactionMonitor />
  )
}
