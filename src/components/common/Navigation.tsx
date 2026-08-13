import {
  AcademicCapIcon,
  ArchiveBoxIcon,
  BellIcon,
  BeakerIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  Bars3BottomLeftIcon,
  ChevronDoubleRightIcon,
  ChevronUpDownIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  CloudIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  FolderOpenIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MapIcon,
  MoonIcon,
  PaperAirplaneIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  ScaleIcon,
  Squares2X2Icon,
  SparklesIcon,
  FunnelIcon,
  SunIcon,
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
  'Reports & issues': ExclamationTriangleIcon,
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

function SidebarThemeToggle({ collapsed }: { collapsed: boolean }) {
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={cn(
        'focus-ring cv-sidebar-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition',
        collapsed && 'lg:justify-center lg:px-2',
      )}
      onClick={toggleTheme}
    >
      {isDark ? (
        <SunIcon className="h-[18px] w-[18px] shrink-0 opacity-70" strokeWidth={1.5} />
      ) : (
        <MoonIcon className="h-[18px] w-[18px] shrink-0 opacity-70" strokeWidth={1.5} />
      )}
      <span className={cn('truncate', collapsed && 'lg:hidden')}>
        {isDark ? 'Light mode' : 'Dark mode'}
      </span>
    </button>
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
          'focus-ring flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition',
          active
            ? 'border font-medium shadow-[var(--cv-sidebar-active-shadow)]'
            : 'border border-transparent hover:bg-[var(--cv-sidebar-hover)]',
          active
            ? 'border-[var(--cv-sidebar-active-border)] bg-[var(--cv-sidebar-active-bg)] text-[var(--cv-sidebar-text)]'
            : 'text-[var(--cv-sidebar-muted)] hover:text-[var(--cv-sidebar-text)]',
          collapsed && 'lg:justify-center lg:px-2',
        )}
        onClick={onClick}
      >
        <Icon
          className={cn(
            'h-[18px] w-[18px] shrink-0',
            active ? 'text-[var(--cv-sidebar-text)]' : 'opacity-70 group-hover:opacity-100',
          )}
          strokeWidth={1.5}
        />
        <span className={cn('min-w-0 flex-1 truncate text-left', collapsed && 'lg:hidden')}>
          {label}
        </span>
        {!collapsed && count !== undefined && count > 0 ? (
          <span className="shrink-0 rounded-md bg-[var(--cv-sidebar-badge-bg)] px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--cv-sidebar-text)]">
            {count > 15 ? '15+' : count > 9 ? '9+' : count}
          </span>
        ) : null}
      </button>
      {collapsed ? (
        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-[var(--cv-sidebar-border)] bg-[var(--cv-sidebar-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--cv-sidebar-text)] shadow-lg group-hover:block lg:group-hover:block">
          {label}
          {count ? ` (${count})` : ''}
        </span>
      ) : null}
    </li>
  )
}

export function DashboardSidebar({
  onNavigate,
  searchPlaceholder,
}: Pick<ShellNavProps, 'onNavigate' | 'searchPlaceholder'>) {
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
  const firstName = user?.profile.name?.split(' ')[0] ?? 'User'
  const initial = (user?.profile.name ?? 'U').slice(0, 1)

  const go = (id: PageId) => {
    onNavigate(id)
    closeDrawer()
  }

  const alertItems: { id: PageId; label: string; Icon: typeof EnvelopeIcon; count: number }[] = [
    { id: 'messages', label: 'Inbox', Icon: EnvelopeIcon, count: 3 },
    { id: 'notifications', label: 'Notifications', Icon: BellIcon, count: 8 },
  ]

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
          sidebarCollapsed ? 'lg:w-[88px]' : 'lg:w-[272px]',
        )}
      >
        <aside
          className={cn(
            'cv-sidebar cv-sidebar-panel fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out lg:static lg:z-0 lg:translate-x-0',
            sidebarCollapsed ? 'w-[min(17.5rem,92vw)] lg:w-[76px]' : 'w-[min(17.5rem,92vw)] lg:w-[260px]',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
          style={{
            paddingTop: 'var(--cv-safe-top)',
            paddingBottom: 'var(--cv-safe-bottom)',
            paddingLeft: 'var(--cv-safe-left)',
          }}
        >
          {/* Brand header — Pointsale-style */}
          <div
            className={cn(
              'flex shrink-0 items-center gap-2.5 px-4 pb-3 pt-4',
              sidebarCollapsed && 'lg:justify-center lg:px-2',
            )}
          >
            <Link
              to="/dashboard"
              className={cn(
                'flex min-w-0 flex-1 items-center gap-3',
                sidebarCollapsed && 'lg:flex-none lg:justify-center',
              )}
              onClick={() => go('dashboard')}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--cv-sidebar-logo-bg)] text-[var(--cv-sidebar-logo-fg)] shadow-sm">
                <Squares2X2Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              </span>
              {!sidebarCollapsed ? (
                <span className="min-w-0">
                  <span className="cv-logo block truncate text-[15px] font-semibold leading-tight text-[var(--cv-sidebar-text)]">
                    CropVibe
                  </span>
                  <span className="block truncate text-[11px] text-[var(--cv-sidebar-muted)]">
                    {ROLE_LABELS[role]}
                  </span>
                </span>
              ) : null}
            </Link>

            {!sidebarCollapsed ? (
              <button
                aria-label="Collapse sidebar"
                className="focus-ring hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--cv-sidebar-muted)] transition hover:bg-[var(--cv-sidebar-hover)] hover:text-[var(--cv-sidebar-text)] lg:inline-flex"
                type="button"
                onClick={toggleSidebarCollapsed}
              >
                <Bars3BottomLeftIcon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
            ) : (
              <button
                aria-label="Expand sidebar"
                className="focus-ring hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--cv-sidebar-muted)] transition hover:bg-[var(--cv-sidebar-hover)] hover:text-[var(--cv-sidebar-text)] lg:inline-flex"
                type="button"
                onClick={toggleSidebarCollapsed}
              >
                <ChevronDoubleRightIcon className="h-4 w-4" strokeWidth={1.5} />
              </button>
            )}

            <button
              aria-label="Close menu"
              className="cv-touch flex h-9 w-9 items-center justify-center rounded-lg text-[var(--cv-sidebar-muted)] hover:bg-[var(--cv-sidebar-hover)] hover:text-[var(--cv-sidebar-text)] lg:hidden"
              type="button"
              onClick={closeDrawer}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-3 [-webkit-overflow-scrolling:touch]">
              {/* Quick search */}
              {!sidebarCollapsed ? (
                <label className="relative mb-3 block">
                  <span className="sr-only">Quick search</span>
                  <MagnifyingGlassIcon
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cv-sidebar-muted)]"
                    strokeWidth={1.75}
                  />
                  <input
                    type="search"
                    placeholder={searchPlaceholder || 'Quick search'}
                    aria-label="Quick search"
                    className="focus-ring w-full rounded-xl border border-transparent bg-[var(--cv-sidebar-search-bg)] py-2.5 pl-9 pr-3 text-[13px] text-[var(--cv-sidebar-text)] placeholder:text-[var(--cv-sidebar-muted)]"
                  />
                </label>
              ) : (
                <button
                  type="button"
                  title="Quick search"
                  aria-label="Quick search"
                  className="focus-ring mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--cv-sidebar-search-bg)] text-[var(--cv-sidebar-muted)] hover:text-[var(--cv-sidebar-text)] lg:flex"
                >
                  <MagnifyingGlassIcon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </button>
              )}

              {/* Inbox / notifications */}
              <ul className="mb-1 space-y-0.5">
                {alertItems.map(({ id, label, Icon, count }) => (
                  <SidebarNavButton
                    key={id}
                    active={currentPage === id}
                    collapsed={sidebarCollapsed}
                    label={label}
                    count={count}
                    icon={Icon}
                    onClick={() => go(id)}
                  />
                ))}
              </ul>

              <div className="my-3 h-px bg-[var(--cv-sidebar-border)]" aria-hidden />

              {/* Main menu */}
              <nav aria-label="Sidebar navigation" className="space-y-4">
                {sections.map((section, sectionIndex) => (
                  <div key={section.title}>
                    {!sidebarCollapsed ? (
                      <p className="mb-2 px-3 text-[12px] font-medium text-[var(--cv-sidebar-muted)]">
                        {sectionIndex === 0 ? 'Menu' : section.title}
                      </p>
                    ) : sectionIndex > 0 ? (
                      <div className="mb-2 flex justify-center">
                        <span className="h-px w-5 bg-[var(--cv-sidebar-border)]" />
                      </div>
                    ) : null}

                    <ul className="space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = NAV_ICONS[item.id] ?? SECTION_ICONS[section.title] ?? ArchiveBoxIcon
                        return (
                          <SidebarNavButton
                            key={item.id}
                            active={currentPage === item.id}
                            collapsed={sidebarCollapsed}
                            label={item.label}
                            icon={Icon}
                            onClick={() => go(item.id)}
                          />
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </nav>

              {/* Promo / KYC card */}
              {!sidebarCollapsed && kycPending ? (
                <div className="mt-4 rounded-2xl border border-[var(--cv-sidebar-promo-border)] bg-[var(--cv-sidebar-promo-bg)] p-3.5">
                  <div className="flex items-start gap-2">
                    <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" strokeWidth={1.75} />
                    <div>
                      <p className="text-[13px] font-semibold text-[var(--cv-sidebar-text)]">
                        Verification pending
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[var(--cv-sidebar-muted)]">
                        Complete KYC to unlock create and offer actions.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--cv-sidebar-border)] bg-[var(--cv-sidebar-active-bg)] px-3 py-2 text-xs font-semibold text-[var(--cv-sidebar-text)] shadow-sm hover:bg-[var(--cv-sidebar-hover)]"
                    onClick={() => go('profile')}
                  >
                    <SparklesIcon className="h-3.5 w-3.5" strokeWidth={2} />
                    Complete KYC
                  </button>
                </div>
              ) : sidebarCollapsed && kycPending ? (
                <button
                  type="button"
                  title="Complete KYC"
                  aria-label="Complete KYC"
                  className="focus-ring mx-auto mt-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--cv-sidebar-promo-bg)] text-indigo-500 lg:flex"
                  onClick={() => go('profile')}
                >
                  <SparklesIcon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </button>
              ) : null}
            </div>

            {/* Footer — system + profile */}
            <div className="shrink-0 border-t border-[var(--cv-sidebar-border)] px-3 py-3">
              <div className="space-y-0.5">
                <button
                  type="button"
                  title="Preferences"
                  className={cn(
                    'focus-ring cv-sidebar-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-[var(--cv-sidebar-muted)] transition hover:bg-[var(--cv-sidebar-hover)] hover:text-[var(--cv-sidebar-text)]',
                    sidebarCollapsed && 'lg:justify-center lg:px-2',
                  )}
                  onClick={() => go('settings')}
                >
                  <Cog6ToothIcon className="h-[18px] w-[18px] shrink-0 opacity-70" strokeWidth={1.5} />
                  <span className={cn('truncate', sidebarCollapsed && 'lg:hidden')}>Preferences</span>
                </button>
                <SidebarThemeToggle collapsed={sidebarCollapsed} />
                <button
                  type="button"
                  title="Help"
                  className={cn(
                    'focus-ring cv-sidebar-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-[var(--cv-sidebar-muted)] transition hover:bg-[var(--cv-sidebar-hover)] hover:text-[var(--cv-sidebar-text)]',
                    sidebarCollapsed && 'lg:justify-center lg:px-2',
                  )}
                  onClick={() => go('help')}
                >
                  <QuestionMarkCircleIcon className="h-[18px] w-[18px] shrink-0 opacity-70" strokeWidth={1.5} />
                  <span className={cn('truncate', sidebarCollapsed && 'lg:hidden')}>Help</span>
                </button>
              </div>

              <button
                type="button"
                title="Account"
                className={cn(
                  'focus-ring mt-2 flex w-full items-center gap-3 rounded-xl border border-[var(--cv-sidebar-border)] bg-[var(--cv-sidebar-search-bg)] px-2.5 py-2 text-left transition hover:bg-[var(--cv-sidebar-hover)]',
                  sidebarCollapsed && 'lg:justify-center lg:px-2',
                )}
                onClick={() => go('profile')}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--cv-sidebar-logo-bg)] text-sm font-bold text-[var(--cv-sidebar-logo-fg)]">
                  {initial}
                </span>
                {!sidebarCollapsed ? (
                  <>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-[var(--cv-sidebar-text)]">
                        {firstName}
                      </span>
                      <span className="block truncate text-[11px] text-[var(--cv-sidebar-muted)]">
                        {ROLE_LABELS[role]}
                      </span>
                    </span>
                    <ChevronUpDownIcon className="h-4 w-4 shrink-0 text-[var(--cv-sidebar-muted)]" strokeWidth={1.5} />
                  </>
                ) : null}
              </button>
            </div>
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

  return (
    <header className="sticky top-0 z-30 bg-[var(--cv-bg)] cv-mobile-header lg:bg-transparent lg:pb-2">
      {/* Mobile app bar */}
      <div className="flex h-14 items-center justify-between gap-3 border-b border-[var(--cv-sidebar-border)] px-4 lg:hidden">
        <button
          type="button"
          aria-label="Open menu"
          className="flex items-center gap-2.5 rounded-xl text-left"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--cv-sidebar-logo-bg)] text-[var(--cv-sidebar-logo-fg)]">
            <Squares2X2Icon className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <span>
            <span className="block text-[15px] font-semibold tracking-tight text-[var(--cv-sidebar-text)]">
              CropVibe
            </span>
            <span className="block text-[11px] text-[var(--cv-sidebar-muted)]">{ROLE_LABELS[role]}</span>
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <button
            aria-label="Messages"
            className="cv-touch flex items-center justify-center rounded-xl border border-[var(--cv-sidebar-border)] bg-[var(--cv-sidebar-bg)] text-[var(--cv-sidebar-text)]"
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

      {/* Desktop header */}
      <div className="hidden h-14 items-center gap-3 px-2 lg:flex">
        <div className="min-w-0 flex-1">
          {breadcrumbs.length > 1 ? (
            <p className="truncate text-[13px] text-[var(--cv-sidebar-muted)]">
              {breadcrumbs.slice(0, -1).join(' / ')}
            </p>
          ) : null}
          <h1 className="truncate text-base font-semibold tracking-tight text-[var(--cv-sidebar-text)]">
            {breadcrumbs[breadcrumbs.length - 1]}
          </h1>
        </div>

        <div className="relative mx-2 max-w-md flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cv-sidebar-muted)]" />
          <input
            aria-label="Search"
            className="focus-ring cv-input w-full py-2.5 pl-10 pr-3 text-sm"
            placeholder={searchPlaceholder}
            type="search"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          {kycPending ? (
            <span className="inline-flex">
              <Badge status="pending">KYC pending</Badge>
            </span>
          ) : null}

          <button
            aria-label="Help"
            className="cv-touch flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--cv-sidebar-border)] bg-[var(--cv-sidebar-bg)] text-[var(--cv-sidebar-muted)] hover:text-[var(--cv-sidebar-text)]"
            type="button"
            onClick={() => onNavigate('help')}
          >
            <QuestionMarkCircleIcon className="h-5 w-5" strokeWidth={1.5} />
          </button>

          <button
            aria-label="Notifications"
            className="cv-touch relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--cv-sidebar-border)] bg-[var(--cv-sidebar-bg)] text-[var(--cv-sidebar-muted)] hover:text-[var(--cv-sidebar-text)]"
            type="button"
            onClick={() => onNavigate('notifications')}
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--cv-sidebar-logo-bg)]" />
          </button>

          <button
            aria-label="Messages"
            className="cv-touch inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--cv-sidebar-border)] bg-[var(--cv-sidebar-bg)] text-[var(--cv-sidebar-muted)] hover:text-[var(--cv-sidebar-text)]"
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
          className="cv-mobile-search focus-ring w-full border border-[var(--cv-sidebar-border)] bg-[var(--cv-sidebar-bg)] py-3 pl-10 pr-4 text-sm text-[var(--cv-sidebar-text)] placeholder:text-[var(--cv-sidebar-muted)] shadow-[var(--shadow-sm)]"
        />
      </label>
      <button
        type="button"
        aria-label="Filters"
        className="cv-mobile-filter-btn cv-touch flex shrink-0 items-center justify-center border border-[var(--cv-sidebar-border)] bg-[var(--cv-sidebar-bg)] text-[var(--cv-sidebar-text)] shadow-[var(--shadow-sm)]"
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
      className="cv-mobile-tabbar fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--cv-sidebar-border)] bg-[var(--cv-sidebar-bg)] px-2 pt-2 lg:hidden"
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
