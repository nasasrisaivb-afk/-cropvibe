'use client'

import { Suspense } from 'react'
import { getResource, type ResourceKey } from '@/lib/resources/registry'
import { Skeleton } from '@/components/ui/loading'
import { ResourcePage } from './ResourcePage'

/** Client boundary: server route files pass a key, this resolves the (function-bearing) config. */
export function ResourceScreen({
  resource,
  intro,
  outro,
  toolbar,
}: {
  resource: ResourceKey
  toolbar?: React.ReactNode
  intro?: React.ReactNode
  outro?: React.ReactNode
}) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <ResourcePage config={getResource(resource)} intro={intro} outro={outro} toolbar={toolbar} />
    </Suspense>
  )
}
