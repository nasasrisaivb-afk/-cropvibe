import type { Metadata } from 'next'
import { PendingActions } from '@/components/insights/PendingActions'

export const metadata: Metadata = { title: 'Pending actions' }

export default function Page() {
  return (
    <PendingActions />
  )
}
