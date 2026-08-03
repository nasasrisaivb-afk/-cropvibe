import {
  AcademicCapIcon,
  ArchiveBoxIcon,
  Bars3Icon,
  BellIcon,
  BeakerIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CloudIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MapIcon,
  PaperAirplaneIcon,
  PlusIcon,
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
  getMobileTabs,
  getNavItems,
  getNavSections,
  PRIMARY_CTA,
  ROLE_LABELS,
} from '../../config/navigation'
import { useAppStore } from '../../store/appStore'
import type { PageId } from '../../types/roles'
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
  create: PlusIcon,
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
  const switchRole = useAppStore((state) => state.switchRole)

  const role = user?.activeRole ?? 'seller'
  const roles = user?.roles ?? []
  const sections = getNavSections(role)
  const kycPending = user?.kycStatus === 'pending'
  const firstName = user?.profile.name?.split(' ')[0] ?? 'User'
  const closeDrawer = () => setSidebarOpen(false)

  const renderItem = (id: PageId, label: string) => {
    const Icon = NAV_ICONS[id] ?? ArchiveBoxIcon
    const active = currentPage === id
    return (
      <li key={`${id}-${label}`}>
        <button
          aria-current={active ? 'page' : undefined}
          className={`focus-ring group flex min-h-11 w-full items-center gap-3 rounded-xl px-2 py-2.5 text-sm transition active:scale-[0.99] ${
            active
              ? 'bg-[var(--cv-primary-soft)] font-semibold text-[var(--cv-primary)]'
              : 'text-[var(--cv-text)]/90 hover:bg-[var(--cv-elevated)] hover:text-[var(--cv-text)]'
          } ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}`}
          title={label}
          type="button"
          onClick={() => {
            onNavigate(id)
            closeDrawer()
          }}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
              active
                ? 'bg-[var(--cv-primary)] text-[var(--cv-btn-text)]'
                : 'bg-[var(--cv-elevated)] text-[var(--cv-muted)] group-hover:text-[var(--cv-text)]'
            }`}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className={`truncate ${sidebarCollapsed ? 'lg:hidden' : ''}`}>{label}</span>
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
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(20rem,92vw)] max-w-sm flex-col border-r border-[var(--cv-border)] bg-[#111111] transition-all duration-200 lg:static lg:z-0 lg:max-w-none lg:translate-x-0 ${
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          paddingTop: 'var(--cv-safe-top)',
          paddingBottom: 'var(--cv-safe-bottom)',
          paddingLeft: 'var(--cv-safe-left)',
        }}
      >
        <div
          className={`flex shrink-0 flex-col justify-center border-b border-[var(--cv-border)] ${
            sidebarCollapsed ? 'h-16 px-3 lg:items-center' : 'min-h-16 px-4 py-3'
          }`}
        >
          <div className="flex items-center gap-2">
            <Link
              className="min-w-0 flex-1"
              to="/dashboard"
              onClick={() => {
                onNavigate('dashboard')
                closeDrawer()
              }}
            >
              {!sidebarCollapsed ? (
                <>
                  <p className="cv-logo truncate text-lg leading-none tracking-wide text-[var(--cv-accent)]">
                    CROPVIBE
                  </p>
                  <p className="mt-1 text-xs font-medium text-[var(--cv-text)]/80">{ROLE_LABELS[role]}</p>
                </>
              ) : (
                <span className="cv-logo text-sm text-[var(--cv-accent)]" title="CropVibe">
                  CV
                </span>
              )}
              <span className="sr-only">CropVibe {ROLE_LABELS[role]}</span>
            </Link>
            <button
              aria-label="Close menu"
              className="cv-touch flex items-center justify-center rounded-xl text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)] hover:text-[var(--cv-text)] lg:hidden"
              type="button"
              onClick={closeDrawer}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 [-webkit-overflow-scrolling:touch]">
          {!sidebarCollapsed && kycPending ? (
            <div className="mb-4 rounded-lg border border-[var(--cv-warning)]/30 bg-[rgba(245,185,66,0.12)] px-3 py-2 text-xs text-[var(--cv-warning)]">
              KYC Pending — create/offer locked
            </div>
          ) : null}

          <nav aria-label="Sidebar navigation">
            <div className="space-y-5">
              {sections.map((section, index) => (
                <div key={section.title}>
                  {index > 0 ? (
                    <div
                      className={`mb-4 border-t border-[var(--cv-border)] ${sidebarCollapsed ? 'lg:mx-1' : ''}`}
                    />
                  ) : null}
                  <p
                    className={`mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--cv-muted)] ${
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
          </nav>
        </div>

        <div className="shrink-0 border-t border-[var(--cv-border)] p-3 pb-[max(0.75rem,var(--cv-safe-bottom))]">
          {roles.length > 1 ? (
            <div className={sidebarCollapsed ? 'lg:hidden' : ''}>
              <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--cv-muted)]">
                Switch role
              </p>
              <div className="mb-3 grid grid-cols-1 gap-1.5">
                {roles.map((r) => {
                  const active = r === role
                  return (
                    <button
                      key={r}
                      type="button"
                      aria-current={active ? 'true' : undefined}
                      className={`focus-ring flex min-h-11 w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition ${
                        active
                          ? 'bg-[var(--cv-primary-soft)] font-semibold text-[var(--cv-primary)] ring-1 ring-[var(--cv-primary)]/30'
                          : 'bg-[var(--cv-elevated)] text-[var(--cv-text)] hover:brightness-110'
                      }`}
                      onClick={() => switchRole(r)}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111111] text-base">
                        {ROLE_ICONS[r]}
                      </span>
                      <span className="truncate">{ROLE_LABELS[r]}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          {roles.length > 1 && sidebarCollapsed ? (
            <div className="mb-2 hidden flex-col gap-1.5 lg:flex">
              {roles.map((r) => (
                <button
                  key={r}
                  type="button"
                  title={ROLE_LABELS[r]}
                  aria-label={`Switch to ${ROLE_LABELS[r]}`}
                  className={`focus-ring mx-auto flex h-10 w-10 items-center justify-center rounded-full text-base transition ${
                    r === role
                      ? 'bg-[var(--cv-primary-soft)] ring-1 ring-[var(--cv-primary)]/40'
                      : 'bg-[var(--cv-elevated)]'
                  }`}
                  onClick={() => switchRole(r)}
                >
                  {ROLE_ICONS[r]}
                </button>
              ))}
            </div>
          ) : null}

          <button
            className={`focus-ring hidden w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)] hover:text-[var(--cv-text)] lg:flex ${
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
            <div className="mt-2 flex items-center gap-3 rounded-xl bg-[var(--cv-elevated)] px-3 py-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--cv-btn-bg)] text-sm font-bold text-[var(--cv-btn-text)]">
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
  const role = user?.activeRole ?? 'seller'
  const cta = PRIMARY_CTA[role]
  const kycPending = user?.kycStatus === 'pending'
  const createLocked = kycPending && role !== 'buyer'

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--cv-border)] bg-[var(--cv-surface)]/95 backdrop-blur-md cv-mobile-header supports-[backdrop-filter]:bg-[var(--cv-surface)]/85">
      <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-4 lg:px-8">
        <button
          aria-label="Open menu"
          className="cv-touch flex items-center justify-center rounded-xl text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)] hover:text-[var(--cv-text)] lg:hidden"
          type="button"
          onClick={() => setSidebarOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        <div className="min-w-0 flex-1">
          {breadcrumbs.length > 1 ? (
            <p className="hidden truncate text-xs text-[var(--cv-muted)] sm:block">
              {breadcrumbs.slice(0, -1).join(' / ')}
            </p>
          ) : null}
          <h1 className="truncate text-[15px] font-semibold tracking-tight text-[var(--cv-text)] sm:text-base">
            {breadcrumbs[breadcrumbs.length - 1]}
          </h1>
          <p className="truncate text-[11px] text-[var(--cv-muted)] sm:hidden">{ROLE_LABELS[role]}</p>
        </div>

        <div className="relative mx-2 hidden max-w-lg flex-1 md:block">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cv-muted)]" />
          <input
            aria-label="Search"
            className="focus-ring cv-input w-full rounded-xl py-2.5 pl-10 pr-3 text-sm"
            placeholder={searchPlaceholder}
            type="search"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {kycPending ? (
            <span className="hidden md:inline-flex">
              <Badge status="pending">KYC Pending</Badge>
            </span>
          ) : null}

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
            className="cv-touch hidden items-center justify-center rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] text-[var(--cv-muted)] hover:text-[var(--cv-text)] sm:inline-flex"
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
            className="cv-touch flex items-center justify-center rounded-full bg-[var(--cv-btn-bg)] text-sm font-bold text-[var(--cv-btn-text)] md:hidden"
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
  const tabs = getMobileTabs(role)
  const navItems = getNavItems(role)

  return (
    <nav
      aria-label="Bottom navigation"
      className="cv-mobile-tabbar fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--cv-border)] bg-[var(--cv-surface)]/95 px-1 pt-1.5 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--cv-surface)]/80 lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 gap-0.5">
        {tabs.map((tab) => {
          const item = navItems.find((nav) => nav.id === tab)
          const label =
            item?.label ??
            (tab === 'dashboard' ? 'Home' : tab.charAt(0).toUpperCase() + tab.slice(1))
          const shortLabel =
            label.length > 10
              ? tab === 'dashboard'
                ? 'Home'
                : label.split(' ')[0]
              : label
          const Icon = NAV_ICONS[tab] ?? HomeIcon
          const active = currentPage === tab
          return (
            <li key={tab}>
              <button
                aria-current={active ? 'page' : undefined}
                className="focus-ring flex w-full flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-[10px] font-semibold tracking-wide"
                style={{ color: active ? 'var(--cv-primary)' : 'var(--cv-muted)' }}
                type="button"
                onClick={() => onNavigate(tab)}
              >
                <span
                  className={`flex h-8 w-12 items-center justify-center rounded-full transition ${
                    active ? 'bg-[var(--cv-primary-soft)]' : ''
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
                </span>
                <span className="max-w-full truncate">{shortLabel}</span>
              </button>
            </li>
          )
        })}
      </ul>
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
      className="cv-mobile-fab focus-ring fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--cv-btn-bg)] text-[var(--cv-btn-text)] shadow-[0_10px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/10 transition active:scale-95 lg:hidden"
      type="button"
      onClick={() => onNavigate('create')}
    >
      <PlusIcon className="h-7 w-7" />
    </button>
  )
}
