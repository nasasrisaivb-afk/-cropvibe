'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Scale,
  Package,
  CreditCard,
  ArrowLeftRight,
  Bell,
  BarChart3,
  FileText,
  KeyRound,
  Settings,
  LogOut,
  HelpCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  MoreHorizontal,
  Sprout,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUiStore } from '@/lib/store/ui'
import { getOverviewKpis } from '@/lib/api/overview.api'
import { Avatar } from '@/components/ui/avatar'
import { ADMIN_ROLE_LABELS } from '@/lib/types'

const sections = [
  {
    title: 'Operations',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard, badgeKey: null },
      { href: '/users', label: 'Users', icon: Users, badgeKey: 'users' as const },
      { href: '/kyc', label: 'KYC Queue', icon: ShieldCheck, badgeKey: 'kyc' as const, urgent: true },
      { href: '/disputes', label: 'Disputes', icon: Scale, badgeKey: 'disputes' as const, warn: true },
      { href: '/listings', label: 'Listings', icon: Package, badgeKey: 'listings' as const },
    ],
  },
  {
    title: 'Finance & Fulfillment',
    items: [
      { href: '/subscriptions', label: 'Subscriptions', icon: CreditCard, badgeKey: null },
      { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight, badgeKey: null },
    ],
  },
  {
    title: 'Communication & Support',
    items: [
      { href: '/notifications', label: 'Notifications', icon: Bell, badgeKey: null },
      { href: '/analytics', label: 'Analytics', icon: BarChart3, badgeKey: null },
    ],
  },
  {
    title: 'Platform Management',
    items: [
      { href: '/content', label: 'Content', icon: FileText, badgeKey: null },
      { href: '/roles-permissions', label: 'Roles & Permissions', icon: KeyRound, badgeKey: null },
      { href: '/settings', label: 'Settings', icon: Settings, badgeKey: null },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, setMobileNavOpen, setCommandOpen } =
    useUiStore()
  const { data } = useQuery({ queryKey: ['overview'], queryFn: getOverviewKpis })

  const userName = session?.user?.name ?? 'Admin'
  const userRole = session?.user?.role
    ? ADMIN_ROLE_LABELS[session.user.role]
    : 'Administrator'

  const nav = (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border-default bg-bg-surface transition-all duration-200',
        sidebarCollapsed ? 'w-[4.5rem]' : 'w-60'
      )}
    >
      {/* Workspace header */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border-light px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-lime text-text-inverse shadow-sm">
            <Sprout className="h-4 w-4" strokeWidth={2.25} />
          </span>
          {!sidebarCollapsed ? (
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-1 rounded-md py-1 text-left hover:bg-bg-surfaceHover"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-text-primary">
                  CropVibe
                </span>
                <span className="block truncate text-[11px] text-text-muted">Admin Console</span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden shrink-0 rounded-md p-1.5 text-text-muted hover:bg-bg-surfaceHover hover:text-text-primary lg:inline-flex"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Search */}
      {!sidebarCollapsed ? (
        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="flex h-9 w-full items-center gap-2 rounded-lg border border-border-default bg-bg-base/40 px-2.5 text-left text-sm text-text-muted transition hover:border-border-focus/40 hover:bg-bg-surfaceHover"
          >
            <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span className="flex-1 truncate">Search…</span>
            <kbd className="rounded border border-border-default bg-bg-surfaceAlt px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
              ⌘K
            </kbd>
          </button>
        </div>
      ) : (
        <div className="flex justify-center px-2 pt-3">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default text-text-muted hover:bg-bg-surfaceHover hover:text-text-primary"
            aria-label="Search"
          >
            <Search className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      )}

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3">
        {sections.map((section, sectionIndex) => (
          <div
            key={section.title}
            className={cn(sectionIndex > 0 && 'mt-4 border-t border-border-light pt-4')}
          >
            {!sidebarCollapsed ? (
              <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                {section.title}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon
                const badge =
                  item.badgeKey && data ? data.badgeCounts[item.badgeKey] : null
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={cn(
                        'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                        sidebarCollapsed && 'justify-center px-0',
                        active
                          ? 'bg-brand-lime/15 font-medium text-brand-lime'
                          : 'text-text-secondary hover:bg-bg-surfaceHover hover:text-text-primary'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-[18px] w-[18px] shrink-0',
                          active ? 'text-brand-lime' : 'text-text-muted group-hover:text-text-secondary'
                        )}
                        strokeWidth={active ? 2 : 1.75}
                      />
                      {!sidebarCollapsed ? (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {badge != null && badge > 0 ? (
                            <span
                              className={cn(
                                'min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold tabular-nums',
                                'urgent' in item && item.urgent
                                  ? 'bg-status-error text-white'
                                  : 'warn' in item && item.warn
                                    ? 'bg-status-warning text-text-inverse'
                                    : 'bg-brand-lime text-text-inverse'
                              )}
                            >
                              {badge > 999 ? '999+' : badge}
                            </span>
                          ) : null}
                        </>
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 space-y-2 border-t border-border-light p-3">
        {!sidebarCollapsed ? (
          <div className="space-y-0.5">
            <a
              href="mailto:support@cropvibe.com"
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-text-secondary hover:bg-bg-surfaceHover hover:text-text-primary"
            >
              <HelpCircle className="h-[18px] w-[18px] text-text-muted" strokeWidth={1.75} />
              Help
            </a>
            <a
              href="https://cropvibe.com"
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-text-secondary hover:bg-bg-surfaceHover hover:text-text-primary"
            >
              <Info className="h-[18px] w-[18px] text-text-muted" strokeWidth={1.75} />
              About
            </a>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-text-secondary hover:bg-bg-surfaceHover hover:text-text-primary"
            >
              <LogOut className="h-[18px] w-[18px] text-text-muted" strokeWidth={1.75} />
              Logout
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-bg-surfaceHover hover:text-text-primary"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}

        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-border-default bg-bg-base/30 p-2">
            <Avatar name={userName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{userName}</p>
              <p className="truncate text-[11px] text-text-muted">{userRole}</p>
            </div>
            <button
              type="button"
              className="rounded-md p-1 text-text-muted hover:bg-bg-surfaceHover hover:text-text-primary"
              aria-label="Account menu"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Avatar name={userName} size="sm" />
          </div>
        )}
      </div>
    </aside>
  )

  return (
    <>
      <div className="hidden lg:block">{nav}</div>
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative z-10 h-full w-60">{nav}</div>
        </div>
      ) : null}
    </>
  )
}
