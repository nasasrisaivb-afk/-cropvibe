'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
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
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/cn'
import { useUiStore } from '@/lib/store/ui'
import { getOverviewKpis } from '@/lib/api/overview.api'

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
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, setMobileNavOpen } = useUiStore()
  const { data } = useQuery({ queryKey: ['overview'], queryFn: getOverviewKpis })

  const nav = (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border-default bg-bg-surface transition-all duration-200',
        sidebarCollapsed ? 'w-20' : 'w-60'
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-border-light px-4">
        {!sidebarCollapsed ? (
          <div>
            <p className="text-sm font-bold text-brand-lime">CropVibe</p>
            <p className="text-[10px] text-text-muted">Admin Console</p>
          </div>
        ) : (
          <span className="text-sm font-bold text-brand-lime">CV</span>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden rounded-md p-1.5 text-text-muted hover:bg-bg-surfaceHover hover:text-text-primary lg:inline-flex"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin p-3">
        {sections.map((section) => (
          <div key={section.title} className="mb-4">
            {!sidebarCollapsed ? (
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                {section.title}
              </p>
            ) : null}
            <ul className="space-y-1">
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
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        active
                          ? 'bg-brand-lime/12 text-brand-lime'
                          : 'text-text-secondary hover:bg-bg-surfaceHover hover:text-text-primary'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!sidebarCollapsed ? (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {badge != null && badge > 0 ? (
                            <span
                              className={cn(
                                'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                                'urgent' in item && item.urgent
                                  ? 'bg-status-error/20 text-status-error'
                                  : 'warn' in item && item.warn
                                    ? 'bg-status-warning/20 text-status-warning'
                                    : 'bg-bg-surfaceAlt text-text-muted'
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

      <div className="border-t border-border-light p-3 space-y-1">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-surfaceHover hover:text-text-primary"
        >
          <LogOut className="h-4 w-4" />
          {!sidebarCollapsed ? 'Logout' : null}
        </button>
        {!sidebarCollapsed ? (
          <>
            <a
              href="https://cropvibe.com"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-surfaceHover"
            >
              <Info className="h-4 w-4" /> About
            </a>
            <a
              href="mailto:support@cropvibe.com"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-surfaceHover"
            >
              <HelpCircle className="h-4 w-4" /> Help
            </a>
          </>
        ) : null}
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
