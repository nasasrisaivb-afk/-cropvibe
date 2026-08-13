import { useNavigate } from 'react-router-dom'
import {
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  StarIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { DashboardStatCard } from '../common/DashboardStatCard'
import { useAppStore } from '../../store/appStore'
import { formatCurrency, cn } from '../../utils/format'

const EQUIPMENT = [
  { name: 'Tractor #1', category: 'Machinery', status: 'available' as const, next: 'Ready now' },
  { name: 'Tractor #2', category: 'Machinery', status: 'booked' as const, next: 'Return today' },
  { name: 'Harvester #1', category: 'Machinery', status: 'booked' as const, next: 'Return in 3 days' },
  { name: 'Rotavator #1', category: 'Equipment', status: 'available' as const, next: 'Ready now' },
  { name: 'Sprayer #1', category: 'Equipment', status: 'available' as const, next: 'Ready now' },
  { name: 'Sprayer #2', category: 'Equipment', status: 'maintenance' as const, next: 'Service in progress' },
  { name: 'Pump #1', category: 'Equipment', status: 'available' as const, next: 'Ready now' },
  { name: 'Seeder #1', category: 'Equipment', status: 'booked' as const, next: 'Return tomorrow' },
]

const BOOKINGS = [
  { id: 'BK-4412', day: 'Today', equipment: 'Tractor #2', renter: 'Farm Ltd', action: 'Return', time: '5:00 PM', status: 'active' as const },
  { id: 'BK-4413', day: 'Tomorrow', equipment: 'Harvester #1', renter: 'ABC Farm', action: 'Return', time: '8:00 PM', status: 'accepted' as const },
  { id: 'BK-4418', day: 'Thu', equipment: 'Sprayer #1', renter: 'MNO Farm', action: 'Pickup', time: '9:00 AM', status: 'pending' as const },
  { id: 'BK-4420', day: 'Fri', equipment: 'Rotavator #1', renter: 'XYZ Inc', action: 'Pickup', time: '11:00 AM', status: 'pending' as const },
]

const REVENUE = [
  { name: 'Tractors', amount: 234500, pct: 100 },
  { name: 'Harvesters', amount: 145300, pct: 62 },
  { name: 'Rotavators', amount: 78200, pct: 33 },
  { name: 'Sprayers', amount: 45600, pct: 19 },
]

const ALERTS = [
  { type: 'warn' as const, text: 'Tractor #3 — next service due in 5 days' },
  { type: 'ok' as const, text: 'Sprayer #2 — maintenance completed yesterday' },
  { type: 'warn' as const, text: '2 overdue returns need follow-up' },
]

const statusMeta = {
  available: { label: 'Available', className: 'bg-[#eef1ec] text-[#121612] dark:bg-[rgba(255,255,255,0.08)] dark:text-[#f5f5f3]' },
  booked: { label: 'Booked', className: 'bg-[color-mix(in_srgb,var(--cv-info)_12%,transparent)] text-[var(--cv-info)]' },
  maintenance: { label: 'Maintenance', className: 'bg-[var(--cv-sidebar-search-bg)] text-[var(--cv-sidebar-muted)]' },
}

function StatCard(props: Parameters<typeof DashboardStatCard>[0] & { featured?: boolean }) {
  return <DashboardStatCard {...props} />
}

function PanelHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--cv-sidebar-border)] px-5 py-4">
      <div>
        <h3 className="text-[15px] font-semibold text-[var(--cv-sidebar-text)]">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-[var(--cv-sidebar-muted)]">{subtitle}</p> : null}
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="focus-ring inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-[var(--cv-sidebar-muted)] transition hover:bg-[var(--cv-sidebar-hover)] hover:text-[var(--cv-sidebar-text)]"
        >
          {actionLabel}
          <ChevronRightIcon className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      ) : null}
    </div>
  )
}

export function RentalDashboard() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const kycPending = user?.kycStatus === 'pending'
  const name = user?.profile.name?.split(' ')[0] ?? 'Rakesh'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const available = EQUIPMENT.filter((e) => e.status === 'available').length
  const booked = EQUIPMENT.filter((e) => e.status === 'booked').length

  return (
    <div className="space-y-5 lg:space-y-6">
      {kycPending ? (
        <div className="flex items-start gap-3 rounded-2xl border border-[var(--cv-sidebar-promo-border)] bg-[var(--cv-sidebar-promo-bg)] px-4 py-3 text-sm text-[var(--cv-sidebar-text)]">
          <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--cv-warning)]" strokeWidth={1.5} />
          <div>
            <strong>KYC pending — review status.</strong> Adding equipment stays locked until approval.
          </div>
        </div>
      ) : null}

      {/* Welcome panel */}
      <section className="cv-dashboard-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-[var(--cv-sidebar-muted)]">Rental provider</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-[var(--cv-sidebar-text)] sm:text-[28px]">
            {greeting}, {name}
          </h1>
          <p className="mt-1.5 text-sm text-[var(--cv-sidebar-muted)]">
            Last login: 1 hour ago · {user?.profile.location ?? 'Nagpur, MH'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => navigate('/dashboard/scheduling')}>
            Open schedule
          </Button>
          <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/create')}>
            Add equipment
          </Button>
        </div>
      </section>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3 xl:gap-4">
        <StatCard title="Total revenue" value={formatCurrency(582300)} hint="18% YoY" positive icon={CurrencyRupeeIcon} featured />
        <StatCard title="This month" value={formatCurrency(123450)} hint="₹ 34,200" positive icon={ArrowTrendingUpIcon} />
        <StatCard title="Fleet utilization" value={`${booked} of ${EQUIPMENT.length}`} hint={`${Math.round((booked / EQUIPMENT.length) * 100)}% booked`} icon={TruckIcon} />
        <StatCard title="Available now" value={String(available)} hint="Ready to rent" positive icon={CheckCircleIcon} />
        <StatCard title="Active bookings" value="8" hint="Next pickup in 2h" icon={CalendarDaysIcon} />
        <StatCard title="Avg rating" value="4.8 / 5.0" hint="89 reviews" icon={StarIcon} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        {/* Bookings table */}
        <section className="cv-dashboard-panel overflow-hidden">
          <PanelHeader
            title="Upcoming bookings"
            subtitle="Pickups and returns this week"
            actionLabel="View all"
            onAction={() => navigate('/dashboard/scheduling')}
          />
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--cv-sidebar-border)] text-[11px] font-medium uppercase tracking-wide text-[var(--cv-sidebar-muted)]">
                  <th className="px-5 py-3">Booking</th>
                  <th className="px-5 py-3">When</th>
                  <th className="px-5 py-3">Equipment</th>
                  <th className="px-5 py-3">Renter</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {BOOKINGS.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-[var(--cv-sidebar-border)] last:border-0 transition hover:bg-[var(--cv-sidebar-hover)]"
                  >
                    <td className="px-5 py-3.5 font-semibold text-[var(--cv-sidebar-text)]">{b.id}</td>
                    <td className="px-5 py-3.5 text-[var(--cv-sidebar-muted)]">
                      {b.day}
                      <span className="block text-xs">{b.time}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--cv-sidebar-muted)]">{b.equipment}</td>
                    <td className="px-5 py-3.5 text-[var(--cv-sidebar-muted)]">{b.renter}</td>
                    <td className="px-5 py-3.5 font-medium text-[var(--cv-sidebar-text)]">{b.action}</td>
                    <td className="px-5 py-3.5">
                      <Badge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-2 p-4 md:hidden">
            {BOOKINGS.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-[var(--cv-sidebar-border)] bg-[var(--cv-sidebar-search-bg)] p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[var(--cv-sidebar-text)]">{b.id}</span>
                  <Badge status={b.status} />
                </div>
                <p className="mt-1 text-sm text-[var(--cv-sidebar-muted)]">
                  {b.equipment} · {b.renter}
                </p>
                <p className="text-sm font-medium text-[var(--cv-sidebar-text)]">
                  {b.action} · {b.day} {b.time}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-5">
          {/* Alert card */}
          <section className="cv-dashboard-panel p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--cv-warning)_15%,transparent)] text-[var(--cv-warning)]">
                <ClockIcon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[var(--cv-sidebar-text)]">Pending returns</h3>
                <p className="mt-1 text-sm text-[var(--cv-sidebar-muted)]">
                  <strong className="text-[var(--cv-sidebar-text)]">2 assets</strong> due today — follow up before
                  overdue fees apply.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => navigate('/dashboard/overdue')}>
                    Review overdue
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/scheduling')}>
                    Scheduling
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Revenue */}
          <section className="cv-dashboard-panel p-5">
            <h3 className="text-[15px] font-semibold text-[var(--cv-sidebar-text)]">Revenue by category</h3>
            <div className="mt-4 space-y-4">
              {REVENUE.map((r) => (
                <div key={r.name}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium text-[var(--cv-sidebar-muted)]">{r.name}</span>
                    <span className="font-semibold text-[var(--cv-sidebar-text)]">{formatCurrency(r.amount)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--cv-sidebar-search-bg)]">
                    <div
                      className="h-full rounded-full bg-[var(--cv-sidebar-logo-bg)]"
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Maintenance */}
          <section className="cv-dashboard-panel p-5">
            <h3 className="text-[15px] font-semibold text-[var(--cv-sidebar-text)]">Maintenance</h3>
            <ul className="mt-4 space-y-3">
              {ALERTS.map((a) => (
                <li key={a.text} className="flex gap-2.5 text-sm text-[var(--cv-sidebar-muted)]">
                  {a.type === 'warn' ? (
                    <WrenchScrewdriverIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cv-warning)]" />
                  ) : (
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cv-success)]" />
                  )}
                  <span>{a.text}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* Fleet grid */}
      <section className="cv-dashboard-panel overflow-hidden">
        <PanelHeader
          title="Fleet status"
          subtitle="Live availability across equipment"
          actionLabel="Manage fleet"
          onAction={() => navigate('/dashboard/machinery')}
        />
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          {EQUIPMENT.map((eq) => (
            <button
              key={eq.name}
              type="button"
              className="rounded-2xl border border-[var(--cv-sidebar-border)] bg-[var(--cv-sidebar-search-bg)] p-4 text-left transition hover:border-[color-mix(in_srgb,var(--cv-sidebar-logo-bg)_35%,var(--cv-sidebar-border))] hover:shadow-sm"
              onClick={() => navigate('/dashboard/equipment')}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[var(--cv-sidebar-text)]">{eq.name}</p>
                  <p className="mt-0.5 text-xs text-[var(--cv-sidebar-muted)]">{eq.category}</p>
                </div>
                <TruckIcon className="h-4 w-4 shrink-0 text-[var(--cv-sidebar-muted)]" />
              </div>
              <span className={cn('mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium', statusMeta[eq.status].className)}>
                {statusMeta[eq.status].label}
              </span>
              <p className="mt-2 text-xs text-[var(--cv-sidebar-muted)]">{eq.next}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="cv-dashboard-panel flex flex-wrap gap-2 p-4">
        <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/finance')}>
          Finance
        </Button>
        <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/agreements')}>
          Agreements
        </Button>
        <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/damage')}>
          Reports
        </Button>
        <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/payouts')}>
          Payouts
        </Button>
      </section>
    </div>
  )
}
