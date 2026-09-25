'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from '@/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, LogOut, PanelLeftClose, PanelLeftOpen, Search, X } from 'lucide-react'
import { NAV_SECTIONS, matchNav, type NavModule } from '@/config/navigation'
import { getNavBadges, type NavBadges } from '@/lib/api/nav.api'
import { useUiStore } from '@/lib/store/ui'
import { can } from '@/lib/rbac'
import { cn } from '@/lib/cn'
import { IconTile } from '@/components/ui/icon-tile'
import { Avatar } from '@/components/ui/avatar'
import { ADMIN_ROLE_LABELS } from '@/lib/types'
import { Wordmark } from './Wordmark'

function Count({ value, urgent }: { value: number; urgent?: boolean }) {
  return (
    <span
      className={cn(
        'tabular min-w-[1.375rem] rounded-full px-1.5 py-0.5 text-center text-2xs font-bold',
        urgent ? 'bg-status-error text-white' : 'bg-bg-elevated text-text-primary'
      )}
    >
      {value > 99 ? '99+' : value}
    </span>
  )
}

function moduleBadge(module: NavModule, badges?: NavBadges) {
  if (!badges) return { total: 0, urgent: false }
  let total = 0
  let urgent = false
  for (const leaf of module.children) {
    // Pending actions aggregates other modules' queues — counting it here would double up
    if (!leaf.badge || leaf.badge === 'pendingActions') continue
    const n = badges[leaf.badge] ?? 0
    total += n
    if (leaf.urgent && n > 0) urgent = true
  }
  return { total, urgent }
}

/**
 * Figma "cropvibe | Admin | Side bar": brand block, search field, then grouped sections.
 * Module rows use the 34px icon tile + label + trailing tile anatomy; children are revealed
 * progressively so the full IA stays scannable.
 */
export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, setMobileNavOpen, setCommandOpen, expandedModules, toggleModule } =
    useUiStore()
  const { data: badges } = useQuery({ queryKey: ['nav-badges'], queryFn: getNavBadges, refetchInterval: 30000 })

  const permissions = session?.user?.permissions
  const active = matchNav(pathname)
  const userName = session?.user?.name ?? 'Admin'
  const userRole = session?.user?.role ? ADMIN_ROLE_LABELS[session.user.role] : 'Administrator'

  const sections = NAV_SECTIONS.map((s) => ({
    ...s,
    modules: s.modules
      .map((m) => ({
        ...m,
        children: m.children.filter((l) => !permissions || can(permissions, l.permission ?? m.permission, 'view')),
      }))
      .filter((m) => m.children.length > 0 && (!permissions || can(permissions, m.permission, 'view'))),
  })).filter((s) => s.modules.length > 0)

  const renderNav = (collapsed: boolean) => (
    <aside
      aria-label="Primary"
      className={cn(
        'flex h-full flex-col bg-bg-surface transition-[width] duration-200',
        collapsed ? 'w-[5.5rem]' : 'w-sidebar'
      )}
    >
      {/* Brand */}
      <div className={cn('flex shrink-0 items-center gap-3 px-6 pb-4 pt-7', collapsed && 'justify-center px-0')}>
        {!collapsed ? (
          <Link href="/" className="min-w-0 flex-1 rounded-md" onClick={() => setMobileNavOpen(false)}>
            <Wordmark />
            <span className="mt-2 block text-xs font-medium text-text-muted">Admin console</span>
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => (mobileNavOpen ? setMobileNavOpen(false) : toggleSidebar())}
          className="hidden h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-surfaceAlt text-text-secondary transition hover:text-text-primary lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
        </button>
        <button
          type="button"
          onClick={() => setMobileNavOpen(false)}
          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-surfaceAlt text-text-secondary lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-4 pb-4" aria-label="Admin modules">
        {/* Search */}
        <div className="mb-5">
          {!collapsed ? (
            <>
              <p className="px-2 pb-2 pt-1 text-2xs font-semibold uppercase tracking-[0.12em] text-text-muted">Search</p>
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false)
                  setCommandOpen(true)
                }}
                className="flex h-[38px] w-full items-center gap-3 rounded-lg border border-border-default bg-bg-inset px-3 text-left text-sm text-text-muted transition hover:border-border-strong"
              >
                <Search className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                <span className="flex-1 truncate">Search anything</span>
                <kbd className="rounded border border-border-default px-1.5 py-0.5 font-mono text-2xs">⌘K</kbd>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              aria-label="Search"
              className="mx-auto flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-border-default bg-bg-inset text-text-muted hover:text-text-primary"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>

        {sections.map((section) => (
          <div key={section.title} className="mb-5">
            {!collapsed ? (
              <p className="px-2 pb-2 text-2xs font-semibold uppercase tracking-[0.12em] text-text-muted">{section.title}</p>
            ) : (
              <div className="mx-auto mb-2 h-px w-8 bg-border-default" aria-hidden />
            )}
            <ul className="space-y-1">
              {section.modules.map((mod) => {
                const isActive = active?.module.id === mod.id
                const expanded = isActive || expandedModules.includes(mod.id)
                const { total, urgent } = moduleBadge(mod, badges)
                const single = mod.children.length === 1

                if (collapsed) {
                  return (
                    <li key={mod.id}>
                      <Link
                        href={mod.children[0]!.href}
                        title={mod.label}
                        aria-label={mod.label}
                        aria-current={isActive ? 'page' : undefined}
                        className="relative mx-auto flex h-[50px] w-[50px] items-center justify-center rounded-xl hover:bg-bg-surfaceAlt"
                      >
                        <IconTile icon={mod.icon} active={isActive} />
                        {total > 0 ? (
                          <span
                            className={cn(
                              'absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-bg-surface',
                              urgent ? 'bg-status-error' : 'bg-brand-lime'
                            )}
                            aria-hidden
                          />
                        ) : null}
                      </Link>
                    </li>
                  )
                }

                const rowClass = cn(
                  'group flex h-[50px] w-full items-center gap-3 rounded-xl px-2 text-left text-sm font-medium transition-colors',
                  isActive ? 'bg-bg-surfaceAlt text-text-primary' : 'text-text-secondary hover:bg-bg-surfaceAlt/60 hover:text-text-primary'
                )

                return (
                  <li key={mod.id}>
                    {single ? (
                      <Link
                        href={mod.children[0]!.href}
                        onClick={() => setMobileNavOpen(false)}
                        aria-current={isActive ? 'page' : undefined}
                        className={rowClass}
                      >
                        <IconTile icon={mod.icon} active={isActive} />
                        <span className="flex-1 truncate">{mod.label}</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        // The module holding the current page always stays open
                        onClick={() => !isActive && toggleModule(mod.id)}
                        aria-expanded={expanded}
                        aria-controls={`nav-${mod.id}`}
                        className={rowClass}
                      >
                        <IconTile icon={mod.icon} active={isActive} />
                        <span className="flex-1 truncate">{mod.label}</span>
                        {!expanded && total > 0 ? <Count value={total} urgent={urgent} /> : null}
                        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg text-text-muted">
                          <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} aria-hidden />
                        </span>
                      </button>
                    )}

                    {!single && expanded ? (
                      <ul id={`nav-${mod.id}`} className="relative my-1 ml-[1.625rem] space-y-0.5 border-l border-border-default pl-3">
                        {mod.children.map((leaf) => {
                          const leafActive = active?.leaf.href === leaf.href
                          const n = leaf.badge && badges ? badges[leaf.badge] : 0
                          return (
                            <li key={leaf.href}>
                              <Link
                                href={leaf.href}
                                onClick={() => setMobileNavOpen(false)}
                                aria-current={leafActive ? 'page' : undefined}
                                className={cn(
                                  'relative flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-colors',
                                  leafActive
                                    ? 'bg-brand-lime/10 font-semibold text-brand-lime'
                                    : 'text-text-secondary hover:bg-bg-surfaceAlt/60 hover:text-text-primary'
                                )}
                              >
                                {leafActive ? (
                                  <span className="absolute -left-[13px] top-1.5 h-6 w-0.5 rounded-full bg-brand-lime" aria-hidden />
                                ) : null}
                                <span className="flex-1 truncate">{leaf.label}</span>
                                {n > 0 ? <Count value={n} urgent={leaf.urgent} /> : null}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Account */}
      <div className={cn('shrink-0 border-t border-border-default p-4', collapsed && 'px-2')}>
        {!collapsed ? (
          <div className="flex items-center gap-3 rounded-xl bg-bg-surfaceAlt p-2.5">
            <Avatar name={userName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary">{userName}</p>
              <p className="truncate text-xs text-text-muted">{userRole}</p>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition hover:bg-bg-elevated hover:text-text-primary"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            aria-label="Log out"
            className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg text-text-muted hover:bg-bg-surfaceAlt hover:text-text-primary"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  )

  return (
    <>
      <div className="sticky top-0 hidden h-screen shrink-0 border-r border-border-default lg:block">
        {renderNav(sidebarCollapsed)}
      </div>
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            className="absolute inset-0 animate-fade-in bg-black/70"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative z-10 h-full w-[min(19.5rem,88vw)] shadow-drawer [&>aside]:w-full">{renderNav(false)}</div>
        </div>
      ) : null}
    </>
  )
}
