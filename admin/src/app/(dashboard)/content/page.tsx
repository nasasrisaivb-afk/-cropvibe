import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ResourceScreen } from '@/components/resource/ResourceScreen'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Content (CMS)' }

export default function Page() {
  return (
    <ResourceScreen
      resource="content"
      toolbar={
        <Link href="/content/new" className={buttonVariants()}>
          <Plus className="h-4 w-4" />
          New content
        </Link>
      }
    />
  )
}
