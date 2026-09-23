import { useEffect, useRef, useState } from 'react'
import {
  AcademicCapIcon,
  ArchiveBoxIcon,
  BellIcon,
  BeakerIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  CloudIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  EnvelopeIcon,
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
  SparklesIcon,
  StarIcon,
  FunnelIcon,
  TruckIcon,
  UserCircleIcon,
  UserGroupIcon,
  WalletIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
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
  quotes: DocumentTextIcon,
  insights: ChartBarIcon,
  discover: MagnifyingGlassIcon,
  rfqs: DocumentTextIcon,
  suppliers: UserGroupIcon,
  wallet: CreditCardIcon,
  messages: EnvelopeIcon,
  notifications: BellIcon,
  reviews: StarIcon,
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
  operators: UserGroupIcon,
  maintenance: WrenchScrewdriverIcon,
  agreements: DocumentTextIcon,
  damage: FolderOpenIcon,
  overdue: ExclamationTriangleIcon,
  finance: ChartBarIcon,
  payouts: WalletIcon,
  disputes: ScaleIcon,
  settlements: CreditCardIcon,
  help: QuestionMarkCircleIcon,
  analytics: ChartBarIcon,
  services: WrenchScrewdriverIcon,
  appointments: CalendarDaysIcon,
  reports: ClipboardDocumentCheckIcon,
  portfolio: FolderOpenIcon,
  consultancy: ChatBubbleLeftRightIcon,
  testing: BeakerIcon,
  repair: WrenchScrewdriverIcon,
  aerial: PaperAirplaneIcon,
  irrigation: CloudIcon,
  courses: AcademicCapIcon,
  learners: UserGroupIcon,
  sessions: CalendarDaysIcon,
  assessments: ClipboardDocumentCheckIcon,
  qna: ChatBubbleLeftRightIcon,
  selfpaced: AcademicCapIcon,
  live: CalendarDaysIcon,
  certifications: AcademicCapIcon,
  mandi: CurrencyRupeeIcon,
  weather: CloudIcon,
  schemes: SparklesIcon,
}

interface ShellNavProps {
  onNavigate: (page: PageId) => void
  searchPlaceholder: string
  breadcrumbs: string[]
}

function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-[12px] text-white shadow-[0_6px_16px_rgba(91,92,226,0.28)]"
      style={{
        width: size,
        height: size,
        background: 'var(--cv-sidebar-logo-bg)',
      }}
      aria-hidden
    >
      <SparklesIcon style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={2.2} />
    </span>
  )
}

function SidebarNavButton({
  active,
  collapsed,
  label,
  count,
  onClick,
  icon: Icon,
}: {
  active: boolean
  collapsed: boolean
  label: string
  count?: number
  onClick: () => void
  icon: typeof HomeIcon
}) {
  return (
    <li className="group relative">
      <button
        type="button"
        title={label}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'focus-ring flex min-h-10 w-full items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-[13.5px] font-medium transition',
          active
            ? 'bg-[var(--cv-sidebar-active-bg)] font-semibold text-[var(--cv-sidebar-active-fg)]'
            : 'text-[var(--cv-sidebar-muted)] hover:bg-[var(--cv-sidebar-hover)] hover:text-[var(--cv-sidebar-text)]',
          collapsed && 'lg:h-10 lg:w-10 lg:justify-center lg:px-0 lg:py-0',
        )}
        onClick={onClick}
      >
        <Icon
          className={cn(
            'h-[18px] w-[18px] shrink-0',
            active ? 'text-[var(--cv-sidebar-active-fg)]' : 'text-[var(--cv-sidebar-muted)]',
          )}
          strokeWidth={active ? 2 : 1.7}
        />
        <span className={cn('min-w-0 flex-1 truncate text-left', collapsed && 'lg:hidden')}>
          {label}
        </span>
        {!collapsed && count !== undefined && count > 0 ? (
          <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[var(--cv-sidebar-badge-bg)] px-1 text-[10px] font-bold text-white">
            {count > 15 ? '15+' : count}
          </span>
        ) : null}
      </button>
      {collapsed ? (
        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-xl bg-white px-3 py-1.5 text-sm font-medium text-[var(--cv-sidebar-text)] shadow-[var(--shadow-md)] group-hover:lg:block">
          {label}
          {count ? ` (${count})` : ''}
        </span>
      ) : null}
    </li>
  )
}

export function DashboardSidebar({
  onNavigate,
}: Pick<ShellNavProps, 'onNavigate' | 'searchPlaceholder'>) {
  const user = useAppStore((state) => state.user)
  const currentPage = useAppStore((state) => state.currentPage)
  const sidebarOpen = useAppStore((state) => state.sidebarOpen)
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const toggleSidebarCollapsed = useAppStore((state) => state.toggleSidebarCollapsed)
  const role = user?.activeRole ?? 'seller'
  const sections = getNavSections(role)
  const closeDrawer = () => setSidebarOpen(false)
  const [folded, setFolded] = useState<Record<string, boolean>>({})
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const go = (id: PageId) => {
    onNavigate(id)
    closeDrawer()
  }

  const toggleFold = (title: string) => {
    setFolded((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <>
      {sidebarOpen ? (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          type="button"
          onClick={closeDrawer}
        />
      ) : null}

      <div
        className={cn(
          'cv-sidebar-shell shrink-0',
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-[256px]',
        )}
      >
        <aside
          className={cn(
            'cv-sidebar cv-sidebar-panel fixed inset-y-0 left-0 z-50 flex h-full flex-col transition-all duration-300 ease-in-out lg:static lg:z-0 lg:translate-x-0',
            sidebarCollapsed ? 'w-[min(17.5rem,92vw)] lg:w-[72px]' : 'w-[min(17.5rem,92vw)] lg:w-[256px]',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
          style={{
            paddingTop: 'var(--cv-safe-top)',
            paddingBottom: 'var(--cv-safe-bottom)',
            paddingLeft: 'var(--cv-safe-left)',
          }}
        >
          <div
            className={cn(
              'flex shrink-0 items-center gap-2 px-3 pb-4 pt-4',
              sidebarCollapsed && 'lg:justify-center lg:px-2',
            )}
          >
            <Link
              to="/dashboard"
              className={cn(
                'flex min-w-0 flex-1 items-center gap-2.5',
                sidebarCollapsed && 'lg:flex-none lg:justify-center',
              )}
              onClick={() => go('dashboard')}
            >
              <BrandMark size={32} />
              {!sidebarCollapsed ? (
                <span className="min-w-0">
                  <span className="cv-logo block truncate text-[15px] font-semibold leading-none text-[var(--cv-sidebar-text)]">
                    CropVibe
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[var(--cv-sidebar-muted)]">
                    {ROLE_LABELS[role].split(' ')[0]}
                  </span>
                </span>
              ) : null}
            </Link>

            {!sidebarCollapsed ? (
            <button
              aria-label="Collapse sidebar"
              className="focus-ring hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[var(--cv-sidebar-muted)] hover:bg-[var(--cv-sidebar-hover)] hover:text-[var(--cv-sidebar-text)] lg:inline-flex"
              type="button"
              onClick={toggleSidebarCollapsed}
            >
              <ChevronDownIcon className="h-4 w-4 rotate-90" strokeWidth={2} />
            </button>
            ) : null}

            <button
              aria-label="Close menu"
              className="cv-touch flex h-8 w-8 items-center justify-center rounded-lg text-[var(--cv-sidebar-muted)] hover:bg-[var(--cv-sidebar-hover)] hover:text-[var(--cv-sidebar-text)] lg:hidden"
              type="button"
              onClick={closeDrawer}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            {!sidebarCollapsed ? (
              <div className="px-3 pb-3">
                <label className="relative block">
                  <span className="sr-only">Search navigation</span>
                  <MagnifyingGlassIcon
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cv-sidebar-muted)]"
                    strokeWidth={1.75}
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search"
                    className="w-full rounded-xl border-0 bg-[var(--cv-sidebar-search-bg)] py-2.5 pl-9 pr-3 text-sm text-[var(--cv-sidebar-text)] placeholder:text-[var(--cv-sidebar-muted)] outline-none ring-0 focus:ring-2 focus:ring-[var(--cv-primary)]/25"
                  />
                </label>
              </div>
            ) : (
              <div className="hidden justify-center px-2 pb-2 lg:flex">
                <button
                  type="button"
                  aria-label="Expand to search"
                  className="flex h-10 w-10 items-center justify-center rounded-[12px] text-[var(--cv-sidebar-muted)] hover:bg-[var(--cv-sidebar-hover)]"
                  onClick={toggleSidebarCollapsed}
                >
                  <MagnifyingGlassIcon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </button>
              </div>
            )}
            <nav
              aria-label="Sidebar navigation"
              className={cn(
                'flex-1 overflow-y-auto overscroll-contain pb-4 [-webkit-overflow-scrolling:touch]',
                sidebarCollapsed ? 'px-2' : 'px-3',
              )}
            >
              {sections.map((section) => {
                const items = q
                  ? section.items.filter((item) => item.label.toLowerCase().includes(q))
                  : section.items
                if (q && items.length === 0) return null
                const isFolded = Boolean(folded[section.title]) && !q
                return (
                  <div key={section.title} className="mb-3">
                    {!sidebarCollapsed ? (
                      <button
                        type="button"
                        className="mb-1 flex w-full items-center justify-between gap-1 px-2 py-1.5 text-[13px] font-semibold text-[var(--cv-sidebar-text)]"
                        onClick={() => toggleFold(section.title)}
                      >
                        {section.title}
                        {isFolded ? (
                          <ChevronRightIcon className="h-4 w-4 text-[var(--cv-sidebar-muted)]" strokeWidth={2} />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4 text-[var(--cv-sidebar-muted)]" strokeWidth={2} />
                        )}
                      </button>
                    ) : (
                      <div className="my-2 flex justify-center" aria-hidden>
                        <span className="h-px w-4 bg-[var(--cv-sidebar-border)]" />
                      </div>
                    )}
                    {!isFolded || sidebarCollapsed ? (
                      <ul className={cn('space-y-0.5', sidebarCollapsed && 'lg:flex lg:flex-col lg:items-center')}>
                        {items.map((item) => {
                          const Icon = NAV_ICONS[item.id] ?? ArchiveBoxIcon
                          return (
                            <SidebarNavButton
                              key={item.id}
                              active={currentPage === item.id}
                              collapsed={sidebarCollapsed}
                              label={item.label}
                              count={item.count}
                              icon={Icon}
                              onClick={() => go(item.id)}
                            />
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
      </div>
    </>
  )
}

export function DashboardHeader({ onNavigate, searchPlaceholder, breadcrumbs }: ShellNavProps) {
  const user = useAppStore((state) => state.user)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const role = user?.activeRole ?? 'seller'
  const kycPending = user?.kycStatus === 'pending'
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement | null)?.isContentEditable) return
      e.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="sticky top-0 z-30 bg-white cv-mobile-header">
      <div className="flex h-14 items-center justify-between gap-3 border-b border-[var(--cv-border)] px-4 lg:hidden">
        <button
          type="button"
          aria-label="Open menu"
          className="flex items-center gap-2.5 rounded-xl text-left"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-[12px] text-[var(--cv-sidebar-logo-fg)]" style={{ background: 'var(--cv-sidebar-logo-bg)' }}>
            <SparklesIcon className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <span>
            <span className="block text-[15px] font-semibold tracking-tight text-[var(--cv-text)]">
              CropVibe
            </span>
            <span className="block text-[11px] text-[var(--cv-muted)]">{ROLE_LABELS[role]}</span>
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <button
            aria-label="Inbox"
            className="cv-touch relative flex items-center justify-center rounded-full border border-[var(--cv-border)] bg-[var(--cv-surface)] text-[var(--cv-text)]"
            type="button"
            onClick={() => onNavigate('messages')}
          >
            <EnvelopeIcon className="h-5 w-5" strokeWidth={1.75} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[var(--cv-sidebar-badge-bg)] ring-2 ring-[var(--cv-surface)]" />
          </button>
          <button
            aria-label="Notifications"
            className="cv-touch relative flex items-center justify-center rounded-full border border-[var(--cv-border)] bg-[var(--cv-surface)] text-[var(--cv-text)]"
            type="button"
            onClick={() => onNavigate('notifications')}
          >
            <BellIcon className="h-5 w-5" strokeWidth={1.75} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[var(--cv-sidebar-badge-bg)] ring-2 ring-[var(--cv-surface)]" />
          </button>
          <HeaderAccountMenu onNavigate={onNavigate} />
        </div>
      </div>

      <div className="hidden h-[72px] items-center gap-3 bg-white px-6 lg:flex">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[24px] font-bold tracking-tight text-[var(--cv-text)]">
            {breadcrumbs[breadcrumbs.length - 1]}
          </h1>
        </div>

        <label className="relative hidden max-w-sm flex-1 xl:block">
          <span className="sr-only">Search</span>
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cv-muted)]"
            strokeWidth={1.75}
          />
          <input
            ref={searchRef}
            aria-label="Search"
            className="focus-ring w-full rounded-xl border-0 bg-white py-2.5 pl-10 pr-3 text-sm text-[var(--cv-text)] shadow-[var(--shadow-sm)] placeholder:text-[var(--cv-muted)]"
            placeholder={searchPlaceholder}
            type="search"
          />
        </label>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Search"
            className="cv-header-icon focus-ring xl:hidden"
            onClick={() => searchRef.current?.focus()}
          >
            <MagnifyingGlassIcon className="h-5 w-5" strokeWidth={1.6} />
          </button>
          <ThemeToggle />
          {kycPending ? (
            <span className="inline-flex">
              <Badge status="pending">KYC pending</Badge>
            </span>
          ) : null}
          <button
            aria-label="Inbox"
            className="cv-header-icon focus-ring relative"
            type="button"
            onClick={() => onNavigate('messages')}
          >
            <EnvelopeIcon className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--cv-sidebar-badge-bg)]" />
          </button>
          <button
            aria-label="Notifications"
            className="cv-header-icon focus-ring relative"
            type="button"
            onClick={() => onNavigate('notifications')}
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--cv-sidebar-badge-bg)]" />
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
          className="cv-mobile-search focus-ring w-full border border-[var(--cv-border)] bg-[var(--cv-surface)] py-3 pl-10 pr-4 text-sm text-[var(--cv-text)] placeholder:text-[var(--cv-muted)] shadow-[var(--shadow-sm)]"
        />
      </label>
      <button
        type="button"
        aria-label="Filters"
          className="cv-mobile-filter-btn cv-touch flex shrink-0 items-center justify-center border border-[var(--cv-border)] bg-[var(--cv-surface)] text-[var(--cv-text)] shadow-[var(--shadow-sm)]"
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
