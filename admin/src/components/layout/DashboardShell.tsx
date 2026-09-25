'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Lock } from 'lucide-react'
import { matchNav, leafPermission } from '@/config/navigation'
import { can } from '@/lib/rbac'
import { useUiStore } from '@/lib/store/ui'
import { setCurrentActor } from '@/lib/data/store'
import { useActor } from '@/lib/rbac'
import { buttonVariants } from '@/components/ui/button'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { Footer } from './Footer'
import { CommandPalette } from './CommandPalette'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const actor = useActor()

  useEffect(() => {
    setCurrentActor(actor)
  }, [actor.name, actor.role]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void useUiStore.persist.rehydrate()
  }, [])

  // Route-level RBAC: the sidebar hides modules, this stops deep links into them
  const match = matchNav(pathname)
  const permissions = session?.user?.permissions
  const forbidden = Boolean(match && permissions && !can(permissions, leafPermission(match), 'view'))

  return (
    <div className="flex min-h-screen bg-bg-base">
      <a
        href="#main"
        className="sr-only z-[70] rounded-md bg-brand-lime px-3 py-2 font-semibold text-brand-ink focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main id="main" className="flex-1 overflow-x-hidden px-4 pb-4 pt-4 md:px-6">
          {forbidden ? <Forbidden module={match!.module.label} /> : children}
        </main>
        <Footer />
      </div>
      <CommandPalette />
    </div>
  )
}

function Forbidden({ module }: { module: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-border-default bg-bg-surface px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-surfaceAlt text-text-secondary">
        <Lock className="h-5 w-5" aria-hidden />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-text-primary">You don&apos;t have access to {module}</h2>
      <p className="mt-2 text-sm text-text-secondary">
        Ask a Super Admin to grant your role access in Role management.
      </p>
      <Link href="/" className={`${buttonVariants({ variant: 'secondary' })} mt-6`}>
        Back to dashboard
      </Link>
    </div>
  )
}
