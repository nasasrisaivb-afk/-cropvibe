'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from '@/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import { Bell, ChevronRight, LogOut, Menu, Search, Settings, UserRound } from 'lucide-react'
import { matchNav } from '@/config/navigation'
import { getUnreadCount } from '@/lib/api/notifications.api'
import { useUiStore } from '@/lib/store/ui'
import { resetMockData } from '@/lib/data/store'
import { ADMIN_ROLE_LABELS } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown'

const roundBtn =
  'relative flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full border border-border-default bg-bg-surface text-text-secondary transition hover:border-border-strong hover:text-text-primary'

/**
 * Figma header (81px): page title + context on the left, three 50px round actions on the right,
 * followed by the right-aligned breadcrumb row.
 */
export function Topbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { setMobileNavOpen, setCommandOpen } = useUiStore()
  const { data: unread } = useQuery({ queryKey: ['unread-count'], queryFn: getUnreadCount, refetchInterval: 30000 })

  const match = matchNav(pathname)
  const title = match ? match.leaf.label : 'CropVibe Admin'
  const description = match?.leaf.description
  const name = session?.user?.name ?? 'Admin'
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      <header className="cv-frost sticky top-0 z-30 border-b border-border-default">
        <div className="flex min-h-[81px] items-center gap-4 px-4 py-3 md:px-6">
          <button
            type="button"
            className={`${roundBtn} lg:hidden`}
            aria-label="Open menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold tracking-tight text-text-primary md:text-2xl">
              {match?.isDetail ? `${title} · details` : title}
            </h1>
            {description ? (
              <p className="mt-0.5 hidden truncate text-sm text-text-secondary sm:block">{description}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className={roundBtn} aria-label="Search (⌘K)" onClick={() => setCommandOpen(true)}>
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              className={`${roundBtn} hidden sm:flex`}
              aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
              onClick={() => router.push('/notifications')}
            >
              <Bell className="h-5 w-5" />
              {unread && unread > 0 ? (
                <span className="tabular absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-lime px-1 text-2xs font-bold text-brand-ink ring-2 ring-bg-base">
                  {unread > 9 ? '9+' : unread}
                </span>
              ) : null}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Account menu"
                  className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-brand-lime text-lg font-bold text-brand-ink transition hover:bg-brand-limeSoft"
                >
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60">
                <div className="px-2.5 py-2">
                  <p className="truncate text-sm font-semibold text-text-primary">{name}</p>
                  <p className="truncate text-xs text-text-muted">{session?.user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>
                  {session?.user?.role ? ADMIN_ROLE_LABELS[session.user.role] : 'Admin'}
                </DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => router.push('/users/admins')}>
                  <UserRound /> Admin team
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/settings')}>
                  <Settings /> Platform settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive onSelect={() => signOut({ callbackUrl: '/login' })}>
                  <LogOut /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Breadcrumb row */}
      <div className="flex min-h-[44px] flex-wrap items-center justify-between gap-2 px-4 pt-4 md:px-6">
        <p className="flex items-center gap-2 text-xs text-text-muted">
          <span className="rounded bg-status-warning/15 px-1.5 py-0.5 font-semibold uppercase tracking-wide text-status-warning">
            Staging
          </span>
          <span className="hidden sm:inline">Mock data · your changes are kept in this browser tab ·</span>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all demo data to its original state? Changes made in this tab will be lost.')) {
                resetMockData()
                window.location.reload()
              }
            }}
            className="font-medium text-text-secondary underline-offset-2 hover:text-text-primary hover:underline"
          >
            Reset demo data
          </button>
        </p>
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 text-sm">
            <li>
              <Link href="/" className="text-text-muted transition hover:text-text-primary">
                Home
              </Link>
            </li>
            {match && match.leaf.href !== '/' ? (
              <>
                <li aria-hidden>
                  <ChevronRight className="h-4 w-4 text-text-muted" />
                </li>
                <li className="text-text-muted">{match.module.label}</li>
                <li aria-hidden>
                  <ChevronRight className="h-4 w-4 text-text-muted" />
                </li>
                <li>
                  {match.isDetail ? (
                    <Link href={match.leaf.href} className="text-text-muted transition hover:text-text-primary">
                      {match.leaf.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="font-medium text-brand-lime">
                      {match.leaf.label}
                    </span>
                  )}
                </li>
                {match.isDetail ? (
                  <>
                    <li aria-hidden>
                      <ChevronRight className="h-4 w-4 text-text-muted" />
                    </li>
                    <li aria-current="page" className="font-medium text-brand-lime">
                      Details
                    </li>
                  </>
                ) : null}
              </>
            ) : null}
          </ol>
        </nav>
      </div>
    </>
  )
}
