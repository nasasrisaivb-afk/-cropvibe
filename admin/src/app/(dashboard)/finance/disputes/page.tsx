import type { Metadata } from 'next'
import { ResourceScreen } from '@/components/resource/ResourceScreen'

export const metadata: Metadata = { title: 'Financial disputes' }

export default function Page() {
  return <ResourceScreen resource="financialDisputes" />
}
