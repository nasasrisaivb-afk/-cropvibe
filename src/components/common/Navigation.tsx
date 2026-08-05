import {
  AcademicCapIcon,
  ArchiveBoxIcon,
  BellIcon,
  BeakerIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronDownIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  CloudIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  FolderOpenIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MapIcon,
  PaperAirplaneIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  ScaleIcon,
  Squares2X2Icon,
  FunnelIcon,
  TruckIcon,
  UserCircleIcon,
  UserGroupIcon,
  WalletIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getMobileTabs,
  getNavItems,
  getNavSections,
  PRIMARY_CTA,
  ROLE_LABELS,
} from '../../config/navigation'
import { useAppStore } from '../../store/appStore'
import type { PageId } from '../../types/roles'
import { cn } from '../../utils/format'
import { Badge } from './Badge'
import { HeaderAccountMenu } from './MobileAccountMenu'
import { ThemeToggle } from './ThemeToggle'

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
  create: PlusIcon,
  equipment: WrenchScrewdriverIcon,
  machinery: TruckIcon,
  labours: UserGroupIcon,
  drivers: TruckIcon,
  land: MapIcon,
  warehouses: BuildingOffice2Icon,
  bookings: ClipboardDocumentListIcon,
  scheduling: CalendarDaysIcon,
  calendar: CalendarDaysIcon,
  agreements: DocumentTextIcon,
  damage: FolderOpenIcon,
  overdue: ExclamationTriangleIcon,
  finance: ChartBarIcon,
  payouts: WalletIcon,
  disputes: ScaleIcon,
  settlements: CreditCardIcon,
  help: QuestionMarkCircleIcon,
  analytics: ChartBarIcon,
  consultancy: ChatBubbleLeftRightIcon,
  testing: BeakerIcon,
  repair: WrenchScrewdriverIcon,
  aerial: PaperAirplaneIcon,
  irrigation: CloudIcon,
  selfpaced: AcademicCapIcon,
  live: CalendarDaysIcon,
  certifications: AcademicCapIcon,
}

const SECTION_ICONS: Record<string, typeof HomeIcon> = {
  Home: HomeIcon,
  Inventory: ArchiveBoxIcon,
  Bookings: CalendarDaysIcon,
  Documents: DocumentTextIcon,
  Money: WalletIcon,
  Services: WrenchScrewdriverIcon,
  Sell: Squares2X2Icon,
  Buy: Squares2X2Icon,
  Learn: AcademicCapIcon,
  Courses: AcademicCapIcon,
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
  const kycPending = user?.kycStatus === 'pending'
  const closeDrawer = () => setSidebarOpen(false)

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev }
      for (const section of sections) {
        const containsActive = section.items.some((item) => item.id === currentPage)
        if (containsActive) next[section.title] = true
        else if (next[section.title] === undefined) next[section.title] = section.items.length <= 3
      }
      return next
    })
  }, [sections, currentPage, role])

  const go = (id: PageId) => {
    onNavigate(id)
    closeDrawer()
  }

  const isOpen = (title: string) => expanded[title] ?? true

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
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(18rem,92vw)] max-w-sm flex-col border-r border-white/[0.06] bg-[var(--cv-nav-active-bg)] text-white transition-all duration-300 ease-in-out lg:static lg:z-0 lg:max-w-none lg:translate-x-0',
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-60',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{
          paddingTop: 'var(--cv-safe-top)',
          paddingBottom: 'var(--cv-safe-bottom)',
          paddingLeft: 'var(--cv-safe-left)',
        }}
      >
        {/* Workspace header */}
        <div
          className={cn(
            'flex shrink-0 items-center gap-2 px-3 pt-3',
            sidebarCollapsed ? 'justify-center px-2' : '',
          )}
        >
          <Link
            to="/dashboard"
            className={cn(
              'group flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl px-2 py-2 transition hover:bg-white/[0.04]',
              sidebarCollapsed && 'flex-none justify-center px-0',
            )}
            onClick={() => go('dashboard')}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] text-[var(--cv-nav-active-fg)]">
              <Squares2X2Icon className="h-4 w-4" strokeWidth={1.5} />
            </span>
            {!sidebarCollapsed ? (
              <span className="min-w-0 flex-1">
                <span className="cv-logo block truncate text-[15px] leading-tight tracking-wide text-white">
                  CropVibe
                </span>
                <span className="block truncate text-[11px] text-white/45">{ROLE_LABELS[role]}</span>
              </span>
            ) : null}
            {!sidebarCollapsed ? (
              <ChevronDownIcon className="h-4 w-4 shrink-0 text-white/35" strokeWidth={1.5} />
            ) : null}
            <span className="sr-only">CropVibe {ROLE_LABELS[role]}</span>
          </Link>

          <button
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="focus-ring hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.06] hover:text-white/80 lg:inline-flex"
            type="button"
            onClick={toggleSidebarCollapsed}
          >
            {sidebarCollapsed ? (
              <ChevronDoubleRightIcon className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <ChevronDoubleLeftIcon className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>

          <button
            aria-label="Close menu"
            className="cv-touch flex items-center justify-center rounded-xl text-white/50 hover:bg-white/[0.06] hover:text-white lg:hidden"
            type="button"
            onClick={closeDrawer}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-2.5 pb-4 pt-3 [-webkit-overflow-scrolling:touch]">
          {!sidebarCollapsed && kycPending ? (
            <div className="mb-3 rounded-2xl border border-[var(--cv-warning)]/30 bg-[var(--color-warning-soft)] px-3 py-2 text-xs text-[var(--cv-warning)]">
              KYC Pending — create/offer locked
            </div>
          ) : null}

          <nav aria-label="Sidebar navigation" className="space-y-6">
            {sections.map((section) => {
              const open = isOpen(section.title)
              const sectionActive = section.items.some((i) => i.id === currentPage)

              return (
                <div key={section.title}>
                  {/* Section header — Folders-style */}
                  {!sidebarCollapsed ? (
                    <button
                      type="button"
                      aria-expanded={open}
                      className="mb-1.5 flex w-full items-center gap-1.5 px-2.5 py-1 text-left"
                      onClick={() =>
                        setExpanded((prev) => ({ ...prev, [section.title]: !open }))
                      }
                    >
                      <ChevronDownIcon
                        className={cn(
                          'h-3.5 w-3.5 shrink-0 text-white/35 transition duration-200',
                          open ? '' : '-rotate-90',
                        )}
                        strokeWidth={2}
                      />
                      <span
                        className={cn(
                          'min-w-0 flex-1 truncate text-[12px] font-medium',
                          sectionActive ? 'text-white/70' : 'text-white/40',
                        )}
                      >
                        {section.title}
                      </span>
                    </button>
                  ) : (
                    <div className="mb-1 flex justify-center py-1" title={section.title}>
                      <span className="h-1 w-1 rounded-full bg-white/25" />
                    </div>
                  )}

                  {open || sidebarCollapsed ? (
                    <ul className="space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = NAV_ICONS[item.id] ?? SECTION_ICONS[section.title] ?? ArchiveBoxIcon
                        const active = currentPage === item.id

                        return (
                          <li key={item.id} className="group relative">
                            <button
                              type="button"
                              title={item.label}
                              aria-current={active ? 'page' : undefined}
                              className={cn(
                                'focus-ring flex min-h-10 w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-[13px] transition',
                                active
                                  ? 'bg-white/[0.08] font-medium text-white'
                                  : 'text-white/65 hover:bg-white/[0.04] hover:text-white/90',
                                sidebarCollapsed && 'lg:justify-center lg:px-2',
                              )}
                              onClick={() => go(item.id)}
                            >
                              <Icon
                                className={cn(
                                  'h-[18px] w-[18px] shrink-0',
                                  active ? 'text-white' : 'text-white/45 group-hover:text-white/70',
                                )}
                                strokeWidth={1.5}
                              />
                              <span
                                className={cn(
                                  'min-w-0 flex-1 truncate text-left',
                                  sidebarCollapsed && 'lg:hidden',
                                )}
                              >
                                {item.label}
                              </span>
                            </button>
                            {sidebarCollapsed ? (
                              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-xl bg-[var(--cv-nav-active-bg)] px-2.5 py-1.5 text-xs font-medium text-white shadow-lg ring-1 ring-white/10 group-hover:block lg:group-hover:block">
                                {item.label}
                              </span>
                            ) : null}
                          </li>
                        )
                      })}
                    </ul>
                  ) : null}
                </div>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}

export function DashboardHeader({ onNavigate, searchPlaceholder, breadcrumbs }: ShellNavProps) {
  const user = useAppStore((state) => state.user)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const role = user?.activeRole ?? 'seller'
  const kycPending = user?.kycStatus === 'pending'

  return (
    <header className="cv-frost sticky top-0 z-30 border-b border-[var(--cv-border)] cv-mobile-header">
      {/* Mobile app bar — logo + notifications */}
      <div className="flex h-14 items-center justify-between gap-3 px-4 lg:hidden">
        <button
          type="button"
          aria-label="Open menu"
          className="flex items-center gap-2.5 rounded-xl text-left"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--cv-btn-bg)] text-[var(--cv-btn-text)]">
            <Squares2X2Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <span>
            <span className="block text-[15px] font-bold tracking-tight text-[var(--cv-text)]">
              CropVibe
            </span>
            <span className="block text-[11px] text-[var(--cv-muted)]">{ROLE_LABELS[role]}</span>
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <button
            aria-label="Messages"
            className="cv-touch flex items-center justify-center rounded-2xl bg-[var(--cv-elevated)] text-[var(--cv-text)]"
            type="button"
            onClick={() => onNavigate('messages')}
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <button
            aria-label="Notifications"
            className="cv-touch relative flex items-center justify-center rounded-2xl bg-[var(--cv-elevated)] text-[var(--cv-text)]"
            type="button"
            onClick={() => onNavigate('notifications')}
          >
            <BellIcon className="h-5 w-5" strokeWidth={1.75} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[var(--cv-nav-active-fg)] ring-2 ring-[var(--cv-surface)]" />
          </button>
          <HeaderAccountMenu onNavigate={onNavigate} />
        </div>
      </div>

      {/* Desktop header — unchanged structure */}
      <div className="hidden h-16 items-center gap-3 px-4 lg:flex lg:px-8">
        <div className="min-w-0 flex-1">
          {breadcrumbs.length > 1 ? (
            <p className="truncate text-[13px] text-[var(--cv-muted)]">
              {breadcrumbs.slice(0, -1).join(' / ')}
            </p>
          ) : null}
          <h1 className="truncate text-base font-semibold tracking-tight text-[var(--cv-text)]">
            {breadcrumbs[breadcrumbs.length - 1]}
          </h1>
        </div>

        <div className="relative mx-2 max-w-lg flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cv-muted)]" />
          <input
            aria-label="Search"
            className="focus-ring cv-input w-full rounded-xl py-2.5 pl-10 pr-3 text-sm"
            placeholder={searchPlaceholder}
            type="search"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          {kycPending ? (
            <span className="inline-flex">
              <Badge status="pending">KYC Pending</Badge>
            </span>
          ) : null}

          <button
            aria-label="Help"
            className="cv-touch flex items-center justify-center rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] text-[var(--cv-muted)] hover:text-[var(--cv-text)]"
            type="button"
            onClick={() => onNavigate('help')}
          >
            <QuestionMarkCircleIcon className="h-5 w-5" strokeWidth={1.5} />
          </button>

          <button
            aria-label="Notifications"
            className="cv-touch relative flex items-center justify-center rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] text-[var(--cv-muted)] hover:text-[var(--cv-text)]"
            type="button"
            onClick={() => onNavigate('notifications')}
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--cv-accent)]" />
          </button>

          <button
            aria-label="Messages"
            className="cv-touch inline-flex items-center justify-center rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] text-[var(--cv-muted)] hover:text-[var(--cv-text)]"
            type="button"
            onClick={() => onNavigate('messages')}
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
          </button>

          <HeaderAccountMenu onNavigate={onNavigate} />
        </div>
      </div>
    </header>
  )
}

export function MobileSearchBar({
  placeholder,
  onFilterClick,
}: {
  placeholder: string
  onFilterClick?: () => void
}) {
  return (
    <div className="mb-4 flex items-center gap-2.5 lg:hidden">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search</span>
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cv-muted)]" />
        <input
          type="search"
          placeholder={placeholder}
          className="cv-mobile-search focus-ring w-full border border-[var(--cv-border)] bg-[var(--cv-surface)] py-3 pl-10 pr-4 text-sm text-[var(--cv-text)] placeholder:text-[var(--cv-muted)] shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
        />
      </label>
      <button
        type="button"
        aria-label="Filters"
        className="cv-mobile-filter-btn cv-touch flex shrink-0 items-center justify-center border border-[var(--cv-border)] bg-[var(--cv-surface)] text-[var(--cv-text)] shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
        onClick={onFilterClick}
      >
        <FunnelIcon className="h-5 w-5" strokeWidth={1.75} />
      </button>
    </div>
  )
}

export function MobileBottomNav({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const user = useAppStore((state) => state.user)
  const currentPage = useAppStore((state) => state.currentPage)
  const role = user?.activeRole ?? 'seller'
  const tabs = getMobileTabs(role)
  const navItems = getNavItems(role)
  const left = tabs.slice(0, 2)
  const right = tabs.slice(2, 4)

  const renderTab = (tab: PageId) => {
    const item = navItems.find((nav) => nav.id === tab)
    const label =
      item?.label ??
      (tab === 'dashboard' ? 'Home' : tab.charAt(0).toUpperCase() + tab.slice(1))
    const shortLabel =
      tab === 'dashboard'
        ? 'Home'
        : label.length > 9
          ? label.split(' ')[0]
          : label
    const Icon = NAV_ICONS[tab] ?? HomeIcon
    const active = currentPage === tab
    return (
      <button
        key={tab}
        aria-current={active ? 'page' : undefined}
        className="focus-ring flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-1 text-[10px] font-bold uppercase tracking-wide"
        style={{ color: active ? 'var(--cv-primary)' : 'var(--cv-muted)' }}
        type="button"
        onClick={() => onNavigate(tab)}
      >
        <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.7} />
        <span className="max-w-full truncate">{shortLabel}</span>
      </button>
    )
  }

  return (
    <nav
      aria-label="Bottom navigation"
      className="cv-mobile-tabbar fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--cv-border)] bg-[var(--cv-surface)] px-2 pt-2 lg:hidden"
    >
      <div className="relative mx-auto flex max-w-lg items-end">
        <div className="flex flex-1 items-center justify-around gap-0.5 pb-1">
          {left.map(renderTab)}
        </div>

        {/* Center FAB spacer */}
        <div className="w-16 shrink-0" aria-hidden />

        <div className="flex flex-1 items-center justify-around gap-0.5 pb-1">
          {right.map(renderTab)}
        </div>
      </div>
    </nav>
  )
}

export function MobileCreateFab({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const user = useAppStore((state) => state.user)
  const role = user?.activeRole ?? 'seller'
  const kycPending = user?.kycStatus === 'pending'
  const locked = kycPending && role !== 'buyer'
  const cta = PRIMARY_CTA[role]

  if (locked) return null

  return (
    <button
      aria-label={cta.label}
      className="cv-mobile-fab focus-ring fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--cv-btn-bg)] text-[var(--cv-btn-text)] shadow-[0_8px_24px_rgba(15,23,42,0.2)] ring-4 ring-[var(--cv-bg)] transition duration-150 ease-out active:scale-95 lg:hidden"
      type="button"
      onClick={() => onNavigate('create')}
    >
      <PlusIcon className="h-7 w-7" strokeWidth={2.25} />
    </button>
  )
}
