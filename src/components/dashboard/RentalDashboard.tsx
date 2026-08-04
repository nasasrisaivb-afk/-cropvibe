import { useNavigate } from 'react-router-dom'
import {
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  StarIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { LargeTitle } from '../common/LargeTitle'
import { useScrollCollapse } from '../../hooks/useScrollCollapse'
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
  available: { label: 'Available', className: 'bg-[var(--cv-primary-soft)] text-[var(--cv-primary)]' },
  booked: { label: 'Booked', className: 'bg-[rgba(56,189,248,0.14)] text-[var(--cv-info)]' },
  maintenance: { label: 'Maintenance', className: 'bg-[var(--cv-elevated)] text-[var(--cv-muted)]' },
}

function StatCard({
  title,
  value,
  hint,
  positive,
  icon: Icon,
  emphasize,
}: {
  title: string
  value: string
  hint?: string
  positive?: boolean
  icon: typeof CurrencyRupeeIcon
  emphasize?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-[16px] border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4 transition hover:shadow-[var(--shadow-md)]',
        emphasize && 'ring-1 ring-[var(--cv-primary)]/15',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-[var(--cv-muted)]">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--cv-text)]">{value}</p>
          {hint ? (
            <p
              className={cn(
                'mt-1.5 text-[13px] font-medium',
                positive === true && 'text-[var(--cv-success)]',
                positive === false && 'text-[var(--cv-danger)]',
                positive === undefined && 'text-[var(--cv-muted)]',
              )}
            >
              {positive === true ? '↑ ' : positive === false ? '↓ ' : ''}
              {hint}
            </p>
          ) : null}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--cv-primary-soft)] text-[var(--cv-primary)]">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
      </div>
    </div>
  )
}

export function RentalDashboard() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const collapsed = useScrollCollapse()
  const kycPending = user?.kycStatus === 'pending'
  const name = user?.profile.name?.split(' ')[0] ?? 'Rakesh'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const available = EQUIPMENT.filter((e) => e.status === 'available').length
  const booked = EQUIPMENT.filter((e) => e.status === 'booked').length

  return (
    <div className="space-y-8">
      {kycPending ? (
        <div className="flex items-start gap-3 rounded-[16px] border border-[var(--cv-warning)]/30 bg-[rgba(245,185,66,0.12)] px-4 py-3 text-sm text-[var(--cv-warning)]">
          <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} />
          <div>
            <strong>KYC Pending — Review status.</strong> Adding equipment stays locked until approval.
          </div>
        </div>
      ) : null}

      <LargeTitle
        collapsed={collapsed}
        eyebrow="Rental Provider"
        title={`${greeting}, ${name}`}
        subtitle={`Last login: 1 hour ago · ${user?.profile.location ?? 'Nagpur, MH'}`}
        actions={
          <>
            <Button disabled={kycPending} onClick={() => navigate('/dashboard/create')}>
              + Add Equipment
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard/machinery')}>
              View Listing Types
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <StatCard title="Total Revenue" value={formatCurrency(582300)} hint="18% YoY" positive icon={CurrencyRupeeIcon} emphasize />
        <StatCard title="This Month" value={formatCurrency(123450)} hint="₹ 34,200" positive icon={ArrowTrendingUpIcon} />
        <StatCard title="Fleet Utilization" value={`${booked} of ${EQUIPMENT.length}`} hint={`${Math.round((booked / EQUIPMENT.length) * 100)}% booked`} icon={TruckIcon} />
        <StatCard title="Available Now" value={String(available)} hint="Ready to rent" positive icon={CheckCircleIcon} />
        <StatCard title="Active Bookings" value="8" hint="Next pickup in 2h" icon={CalendarDaysIcon} emphasize />
        <StatCard title="Avg Rating" value="4.8 / 5.0" hint="89 reviews" icon={StarIcon} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Card className="!rounded-2xl !p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--cv-border)] px-5 py-4">
            <div>
              <h3 className="font-semibold text-[var(--cv-text)]">Upcoming Bookings</h3>
              <p className="text-xs text-[var(--cv-muted)]">Pickups and returns this week</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/scheduling')}>
              View all
            </Button>
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--cv-border)] text-xs uppercase tracking-wide text-[var(--cv-muted)]">
                  <th className="px-5 py-3 font-medium">Booking</th>
                  <th className="px-5 py-3 font-medium">When</th>
                  <th className="px-5 py-3 font-medium">Equipment</th>
                  <th className="px-5 py-3 font-medium">Renter</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {BOOKINGS.map((b) => (
                  <tr key={b.id} className="border-b border-[var(--cv-border)] last:border-0 hover:bg-[var(--cv-elevated)]">
                    <td className="px-5 py-3.5 font-semibold text-[var(--cv-text)]">{b.id}</td>
                    <td className="px-5 py-3.5 text-[var(--cv-muted)]">
                      {b.day}
                      <span className="block text-xs">{b.time}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--cv-muted)]">{b.equipment}</td>
                    <td className="px-5 py-3.5 text-[var(--cv-muted)]">{b.renter}</td>
                    <td className="px-5 py-3.5 font-medium text-[var(--cv-text)]">{b.action}</td>
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
              <div key={b.id} className="rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[var(--cv-text)]">{b.id}</span>
                  <Badge status={b.status} />
                </div>
                <p className="mt-1 text-sm text-[var(--cv-muted)]">
                  {b.equipment} · {b.renter}
                </p>
                <p className="text-sm font-medium text-[var(--cv-text)]">
                  {b.action} · {b.day} {b.time}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="!rounded-2xl border-[var(--cv-warning)]/30 bg-[rgba(245,185,66,0.08)]">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(245,185,66,0.15)] text-[var(--cv-warning)]">
                <ClockIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[var(--cv-text)]">Pending returns</h3>
                <p className="mt-1 text-sm text-[var(--cv-muted)]">
                  <strong className="text-[var(--cv-text)]">2 assets</strong> due today — follow up before overdue fees apply.
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
          </Card>

          <Card className="!rounded-2xl" title="Revenue by Category">
            <div className="space-y-4">
              {REVENUE.map((r) => (
                <div key={r.name}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium text-[var(--cv-muted)]">{r.name}</span>
                    <span className="font-semibold text-[var(--cv-primary)]">{formatCurrency(r.amount)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--cv-elevated)]">
                    <div className="h-full rounded-full bg-[var(--cv-primary)]" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="!rounded-2xl" title="Maintenance">
            <ul className="space-y-3">
              {ALERTS.map((a) => (
                <li key={a.text} className="flex gap-2 text-sm text-[var(--cv-muted)]">
                  {a.type === 'warn' ? (
                    <WrenchScrewdriverIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cv-warning)]" />
                  ) : (
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cv-primary)]" />
                  )}
                  <span>{a.text}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card className="!rounded-2xl !p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--cv-border)] px-5 py-4">
          <div>
            <h3 className="font-semibold text-[var(--cv-text)]">Fleet Status</h3>
            <p className="text-xs text-[var(--cv-muted)]">Live availability across equipment</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/machinery')}>
            Manage fleet
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          {EQUIPMENT.map((eq) => (
            <button
              key={eq.name}
              type="button"
              className="rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] p-4 text-left transition hover:border-[var(--cv-primary)]/30 hover:bg-[var(--cv-surface)]"
              onClick={() => navigate('/dashboard/equipment')}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[var(--cv-text)]">{eq.name}</p>
                  <p className="mt-0.5 text-xs text-[var(--cv-muted)]">{eq.category}</p>
                </div>
                <TruckIcon className="h-4 w-4 shrink-0 text-[var(--cv-muted)]" />
              </div>
              <span
                className={cn(
                  'mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                  statusMeta[eq.status].className,
                )}
              >
                {statusMeta[eq.status].label}
              </span>
              <p className="mt-2 text-xs text-[var(--cv-muted)]">{eq.next}</p>
            </button>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => navigate('/dashboard/scheduling')}>
          Scheduling
        </Button>
        <Button variant="secondary" onClick={() => navigate('/dashboard/finance')}>
          Finance
        </Button>
        <Button variant="secondary" onClick={() => navigate('/dashboard/agreements')}>
          Agreements
        </Button>
        <Button variant="ghost" onClick={() => navigate('/dashboard/damage')}>
          Reports
        </Button>
      </div>
    </div>
  )
}
