import {
  ArchiveBoxIcon,
  Bars3Icon,
  BellIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MapIcon,
  QuestionMarkCircleIcon,
  Squares2X2Icon,
  TruckIcon,
  UserCircleIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import {
  getNavItems,
  getNavSections,
  MOBILE_TABS,
  PRIMARY_CTA,
  RENTAL_MOBILE_TABS,
  ROLE_LABELS,
} from '../../config/navigation'
import { useAppStore } from '../../store/appStore'
import type { PageId, Role } from '../../types/roles'
import { ROLE_ICONS } from '../../types/roles'
import { Badge } from './Badge'
import { Button } from './Button'

const NAV_ICONS: Partial<Record<PageId, typeof HomeIcon>> = {
  dashboard: HomeIcon,
  listings: Squares2X2Icon,
  orders: ClipboardDocumentListIcon,
  wallet: CreditCardIcon,
  messages: ChatBubbleLeftRightIcon,
  notifications: BellIcon,
  reviews: ClipboardDocumentCheckIcon,
  profile: UserCircleIcon,
  settings: Cog6ToothIcon,
  create: Squares2X2Icon,
  equipment: WrenchScrewdriverIcon,
  machinery: TruckIcon,
  labours: UserGroupIcon,
  drivers: TruckIcon,
  land: MapIcon,
  warehouses: BuildingOffice2Icon,
  bookings: ClipboardDocumentListIcon,
  calendar: CalendarDaysIcon,
  agreements: DocumentTextIcon,
  damage: ExclamationTriangleIcon,
  overdue: ClockIcon,
  settlements: CreditCardIcon,
  help: QuestionMarkCircleIcon,
  analytics: Squares2X2Icon,
}

interface ShellNavProps {
  onNavigate: (page: PageId) => void
  searchPlaceholder: string
  breadcrumbs: string[]
}

export function DashboardSidebar({ onNavigate }: Pick<ShellNavProps, 'onNavigate'>) {
  const user = useAppStore((state) => state.user)
  const currentPage = useAppStore((state) => state.currentPage)
  const sidebarOpen = useAppStore((state) => state.sidebarOpen)
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const toggleSidebarCollapsed = useAppStore((state) => state.toggleSidebarCollapsed)

  const role = user?.activeRole ?? 'seller'
  const sections = getNavSections(role)
  const navItems = getNavItems(role)
  const kycPending = user?.kycStatus === 'pending'
  const firstName = user?.profile.name?.split(' ')[0] ?? 'User'
  const closeDrawer = () => setSidebarOpen(false)
  const isRental = role === 'rental'

  const renderItem = (id: PageId, label: string) => {
    const Icon = NAV_ICONS[id] ?? ArchiveBoxIcon
    const active = currentPage === id
    return (
      <li key={id}>
        <button
          aria-current={active ? 'page' : undefined}
          className={`focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
            active
              ? 'border-l-4 border-[var(--cv-primary)] bg-[var(--cv-primary-soft)] font-semibold text-[var(--cv-primary)]'
              : 'border-l-4 border-transparent text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)] hover:text-[var(--cv-text)]'
          } ${sidebarCollapsed ? 'lg:justify-center lg:px-2 lg:border-l-0' : ''}`}
          title={label}
          type="button"
          onClick={() => {
            onNavigate(id)
            closeDrawer()
          }}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span className={sidebarCollapsed ? 'lg:hidden' : ''}>{label}</span>
        </button>
      </li>
    )
  }

  return (
    <>
      {sidebarOpen ? (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          type="button"
          onClick={closeDrawer}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--cv-border)] bg-[var(--cv-surface)] transition-all duration-200 lg:static lg:z-0 lg:translate-x-0 ${
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div
          className={`flex h-16 shrink-0 items-center gap-2 border-b border-[var(--cv-border)] ${
            sidebarCollapsed ? 'px-3 lg:justify-center' : 'px-4'
          }`}
        >
          <Link
            className="flex min-w-0 items-center gap-2.5"
            to="/dashboard"
            onClick={() => {
              onNavigate('dashboard')
              closeDrawer()
            }}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--cv-btn-bg)] text-[var(--cv-accent)] ring-1 ring-[var(--cv-accent)]/30">
              🌱
            </span>
            {!sidebarCollapsed ? (
              <span className="cv-logo truncate text-lg">
                Crop<span className="cv-logo-accent">Vibe</span>
                {isRental ? (
                  <span className="ml-1 align-middle text-[10px] font-normal tracking-normal text-[var(--cv-muted)]">
                    Provider
                  </span>
                ) : null}
              </span>
            ) : (
              <span className="sr-only">CropVibe</span>
            )}
          </Link>
          <button
            className="ml-auto rounded-md p-1.5 text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)] hover:text-[var(--cv-text)] lg:hidden"
            type="button"
            onClick={closeDrawer}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {!sidebarCollapsed && kycPending ? (
            <div className="mb-3 rounded-lg border border-[var(--cv-warning)]/30 bg-[rgba(245,185,66,0.12)] px-3 py-2 text-xs text-[var(--cv-warning)]">
              KYC Pending — create/offer locked
            </div>
          ) : null}

          <nav aria-label="Sidebar navigation">
            {sections ? (
              <div className="space-y-5">
                {sections.map((section) => (
                  <div key={section.title}>
                    <p
                      className={`mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--cv-accent)] ${
                        sidebarCollapsed ? 'lg:text-center lg:px-0' : ''
                      }`}
                    >
                      {sidebarCollapsed ? '·' : section.title}
                    </p>
                    <ul className="space-y-0.5">
                      {section.items.map((item) => renderItem(item.id, item.label))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <p
                  className={`mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--cv-muted)] ${
                    sidebarCollapsed ? 'lg:text-center lg:px-0' : ''
                  }`}
                >
                  {sidebarCollapsed ? '···' : 'Menu'}
                </p>
                <ul className="space-y-0.5">
                  {navItems.map((item) => renderItem(item.id, item.label))}
                </ul>
              </>
            )}
          </nav>
        </div>

        <div className="shrink-0 border-t border-[var(--cv-border)] p-3">
          <button
            className={`focus-ring hidden w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)] hover:text-[var(--cv-text)] lg:flex ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            type="button"
            onClick={toggleSidebarCollapsed}
          >
            {sidebarCollapsed ? (
              <ChevronDoubleRightIcon className="h-5 w-5" />
            ) : (
              <>
                <ChevronDoubleLeftIcon className="h-5 w-5" />
                <span>Collapse</span>
              </>
            )}
          </button>

          {!sidebarCollapsed ? (
            <div className="mt-2 flex items-center gap-3 rounded-lg bg-[var(--cv-elevated)] px-3 py-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--cv-btn-bg)] text-sm font-bold text-white">
                {firstName.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--cv-text)]">{user?.profile.name}</p>
                <p className="truncate text-xs text-[var(--cv-muted)]">{ROLE_LABELS[role]}</p>
              </div>
            </div>
          ) : null}
        </div>
      </aside>
    </>
  )
}

export function DashboardHeader({ onNavigate, searchPlaceholder, breadcrumbs }: ShellNavProps) {
  const user = useAppStore((state) => state.user)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const switchRole = useAppStore((state) => state.switchRole)
  const role = user?.activeRole ?? 'seller'
  const cta = PRIMARY_CTA[role]
  const kycPending = user?.kycStatus === 'pending'
  const createLocked = kycPending && role !== 'buyer'
  const roles = user?.roles ?? []

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--cv-border)] bg-[var(--cv-surface)]/95 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-8">
        <button
          aria-label="Open menu"
          className="rounded-lg p-2 text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)] hover:text-[var(--cv-text)] lg:hidden"
          type="button"
          onClick={() => setSidebarOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        <div className="min-w-0">
          {breadcrumbs.length > 1 ? (
            <p className="hidden truncate text-xs text-[var(--cv-muted)] sm:block">
              {breadcrumbs.slice(0, -1).join(' / ')}
            </p>
          ) : null}
          <h1 className="truncate text-base font-semibold text-[var(--cv-text)]">
            {breadcrumbs[breadcrumbs.length - 1]}
          </h1>
        </div>

        <div className="relative mx-4 hidden max-w-lg flex-1 md:block">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cv-muted)]" />
          <input
            aria-label="Search"
            className="focus-ring cv-input w-full rounded-xl py-2.5 pl-10 pr-3 text-sm"
            placeholder={searchPlaceholder}
            type="search"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {kycPending ? (
            <span className="hidden md:inline-flex">
              <Badge status="pending">KYC Pending</Badge>
            </span>
          ) : null}

          {roles.length > 1 ? (
            <select
              aria-label="Switch role"
              className="focus-ring hidden max-w-[180px] appearance-none rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] py-2 pl-3 pr-8 text-sm font-medium text-[var(--cv-text)] sm:block"
              value={role}
              onChange={(e) => switchRole(e.target.value as Role)}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_ICONS[r]} {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          ) : null}

          <button
            aria-label="Notifications"
            className="relative rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] p-2.5 text-[var(--cv-muted)] hover:text-[var(--cv-text)]"
            type="button"
            onClick={() => onNavigate('notifications')}
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--cv-accent)]" />
          </button>

          <button
            aria-label="Messages"
            className="hidden rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] p-2.5 text-[var(--cv-muted)] hover:text-[var(--cv-text)] sm:inline-flex"
            type="button"
            onClick={() => onNavigate('messages')}
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
          </button>

          <Button
            className="hidden md:inline-flex"
            disabled={createLocked}
            size="sm"
            title={createLocked ? 'KYC approval required' : undefined}
            onClick={() => onNavigate('create')}
          >
            {cta.label}
          </Button>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--cv-btn-bg)] text-sm font-bold text-white md:hidden"
            type="button"
            onClick={() => onNavigate('profile')}
          >
            {(user?.profile.name ?? 'U').slice(0, 1)}
          </button>
        </div>
      </div>
    </header>
  )
}

export function MobileBottomNav({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const user = useAppStore((state) => state.user)
  const currentPage = useAppStore((state) => state.currentPage)
  const role = user?.activeRole ?? 'seller'
  const tabs = role === 'rental' ? RENTAL_MOBILE_TABS : MOBILE_TABS
  const navItems = getNavItems(role)

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--cv-border)] bg-[var(--cv-surface)]/95 px-1 py-1 backdrop-blur sm:hidden"
    >
      <ul className="grid grid-cols-5 gap-0.5">
        {tabs.map((tab) => {
          const item = navItems.find((nav) => nav.id === tab)
          const label =
            item?.label ??
            (tab === 'dashboard' ? 'Home' : tab.charAt(0).toUpperCase() + tab.slice(1))
          const Icon = NAV_ICONS[tab] ?? HomeIcon
          const active = currentPage === tab
          return (
            <li key={tab}>
              <button
                aria-current={active ? 'page' : undefined}
                className="focus-ring flex w-full flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium"
                style={{ color: active ? 'var(--cv-primary)' : 'var(--cv-muted)' }}
                type="button"
                onClick={() => onNavigate(tab)}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
