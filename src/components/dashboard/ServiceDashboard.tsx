import { useNavigate } from 'react-router-dom'
import {
  ArrowTrendingUpIcon,
  BeakerIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  Cog6ToothIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  StarIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { LargeTitle } from '../common/LargeTitle'
import { useScrollCollapse } from '../../hooks/useScrollCollapse'
import { useAppStore } from '../../store/appStore'
import { formatCurrency, cn } from '../../utils/format'

const OFFERINGS = [
  { name: 'Soil Health Pack', category: 'Soil Testing', status: 'open' as const, next: '3 slots this week' },
  { name: 'Season Crop Plan', category: 'Consultancy', status: 'booked' as const, next: 'Visit tomorrow 10 AM' },
  { name: 'Pump & Engine Fix', category: 'Mechanic', status: 'open' as const, next: 'Ready for callouts' },
  { name: 'Drip Layout Install', category: 'Irrigation', status: 'booked' as const, next: 'Site survey Fri' },
  { name: 'Sprayer Overhaul', category: 'Equipment Repair', status: 'paused' as const, next: 'Paused — parts wait' },
  { name: 'Drone Spray Slot', category: 'Drone Spraying', status: 'open' as const, next: '5 acre min' },
  { name: 'Pest Scout Visit', category: 'Crop Inspection', status: 'booked' as const, next: 'Plot 12 today 3 PM' },
  { name: 'Video Advisory', category: 'Consultancy', status: 'open' as const, next: 'Ready now' },
]

const APPOINTMENTS = [
  {
    id: 'AP-2210',
    day: 'Today',
    time: '2:00 PM',
    service: 'Farm Consultancy',
    client: 'Farmer ABC',
    location: 'XYZ Farm',
    action: 'Visit',
    status: 'accepted' as const,
  },
  {
    id: 'AP-2211',
    day: 'Today',
    time: '4:30 PM',
    service: 'Soil Testing',
    client: 'Farmer XYZ',
    location: 'Village A',
    action: 'Collect',
    status: 'accepted' as const,
  },
  {
    id: 'AP-2214',
    day: 'Tomorrow',
    time: '10:00 AM',
    service: 'Equipment Repair',
    client: 'Workshop DEF',
    location: 'Workshop',
    action: 'Service',
    status: 'pending' as const,
  },
  {
    id: 'AP-2218',
    day: 'Thu',
    time: '3:00 PM',
    service: 'Crop Inspection',
    client: 'Green Fields',
    location: 'Plot 12',
    action: 'Scout',
    status: 'accepted' as const,
  },
]

const REVENUE = [
  { name: 'Farm Consultancy', amount: 123600, pct: 100 },
  { name: 'Soil Testing', amount: 78300, pct: 63 },
  { name: 'Equipment Repair', amount: 45200, pct: 37 },
  { name: 'Crop Inspection', amount: 32450, pct: 26 },
]

const ALERTS = [
  { type: 'warn' as const, text: '2 clients waiting for invoices — settle this week' },
  { type: 'ok' as const, text: 'Soil Health Pack — 3 new inquiries yesterday' },
  { type: 'warn' as const, text: 'Drone Spray Slot — weather may delay Thu bookings' },
]

const statusMeta = {
  open: { label: 'Open', className: 'bg-[var(--cv-primary-soft)] text-[var(--cv-primary)]' },
  booked: { label: 'Booked', className: 'bg-[var(--color-info-soft)] text-[var(--cv-info)]' },
  paused: { label: 'Paused', className: 'bg-[var(--cv-elevated)] text-[var(--cv-muted)]' },
}

const categoryIcon = {
  'Soil Testing': BeakerIcon,
  Consultancy: UserGroupIcon,
  Mechanic: WrenchScrewdriverIcon,
  Irrigation: Cog6ToothIcon,
  'Equipment Repair': WrenchScrewdriverIcon,
  'Drone Spraying': PaperAirplaneIcon,
  'Crop Inspection': ClipboardDocumentCheckIcon,
} as const

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
        'rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4 transition hover:border-[var(--cv-primary)]/25',
        emphasize && 'ring-1 ring-[var(--cv-primary)]/20',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--cv-text)]">{value}</p>
          {hint ? (
            <p
              className={cn(
                'mt-1.5 text-xs font-medium',
                positive === true && 'text-[var(--cv-primary)]',
                positive === false && 'text-[var(--cv-danger)]',
                positive === undefined && 'text-[var(--cv-muted)]',
              )}
            >
              {positive === true ? '↑ ' : positive === false ? '↓ ' : ''}
              {hint}
            </p>
          ) : null}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--cv-primary-soft)] text-[var(--cv-primary)]">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  )
}

export function ServiceDashboard() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const collapsed = useScrollCollapse()
  const kycPending = user?.kycStatus === 'pending'
  const name = user?.profile.name?.split(' ')[0] ?? 'Dr. Sharma'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const open = OFFERINGS.filter((o) => o.status === 'open').length
  const booked = OFFERINGS.filter((o) => o.status === 'booked').length

  return (
    <div className="space-y-8">
      {kycPending ? (
        <div className="flex items-start gap-3 rounded-[16px] border border-[var(--cv-warning)]/30 bg-[var(--color-warning-soft)] px-4 py-3 text-sm text-[var(--cv-warning)]">
          <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} />
          <div>
            <strong>KYC Pending — Review status.</strong> Offering services stays locked until approval.
          </div>
        </div>
      ) : null}

      <LargeTitle
        collapsed={collapsed}
        eyebrow="Service Provider"
        title={`${greeting}, ${name}`}
        subtitle={`Last login: 30 min ago · ${user?.profile.location ?? 'Bangalore, India'}`}
        actions={
          <>
            <Button disabled={kycPending} onClick={() => navigate('/dashboard/create')}>
              + Create Service Offering
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard/consultancy')}>
              View Service Types
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(345600)}
          hint="18% YoY"
          positive
          icon={CurrencyRupeeIcon}
          emphasize
        />
        <StatCard
          title="This Month"
          value={formatCurrency(78450)}
          hint="₹ 15,300"
          positive
          icon={ArrowTrendingUpIcon}
        />
        <StatCard
          title="Offer Utilization"
          value={`${booked} of ${OFFERINGS.length}`}
          hint={`${Math.round((booked / OFFERINGS.length) * 100)}% booked`}
          icon={ClipboardDocumentCheckIcon}
        />
        <StatCard title="Open Now" value={String(open)} hint="Ready to book" positive icon={CheckCircleIcon} />
        <StatCard title="Active Appointments" value="8" hint="Next visit in 2h" icon={CalendarDaysIcon} emphasize />
        <StatCard title="Avg Rating" value="4.9 / 5.0" hint="42 reviews" icon={StarIcon} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Card className="!rounded-2xl !p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--cv-border)] px-5 py-4">
            <div>
              <h3 className="font-semibold text-[var(--cv-text)]">Upcoming Appointments</h3>
              <p className="text-xs text-[var(--cv-muted)]">Visits and callouts this week</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/orders')}>
              View all
            </Button>
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--cv-border)] text-xs uppercase tracking-wide text-[var(--cv-muted)]">
                  <th className="px-5 py-3 font-medium">Appointment</th>
                  <th className="px-5 py-3 font-medium">When</th>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {APPOINTMENTS.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-[var(--cv-border)] last:border-0 hover:bg-[var(--cv-elevated)]"
                  >
                    <td className="px-5 py-3.5 font-semibold text-[var(--cv-text)]">{a.id}</td>
                    <td className="px-5 py-3.5 text-[var(--cv-muted)]">
                      {a.day}
                      <span className="block text-xs">{a.time}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--cv-muted)]">{a.service}</td>
                    <td className="px-5 py-3.5 text-[var(--cv-muted)]">
                      {a.client}
                      <span className="block text-xs">{a.location}</span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[var(--cv-text)]">{a.action}</td>
                    <td className="px-5 py-3.5">
                      <Badge status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-2 p-4 md:hidden">
            {APPOINTMENTS.map((a) => (
              <div key={a.id} className="rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[var(--cv-text)]">{a.id}</span>
                  <Badge status={a.status} />
                </div>
                <p className="mt-1 text-sm text-[var(--cv-muted)]">
                  {a.service} · {a.client}
                </p>
                <p className="text-sm font-medium text-[var(--cv-text)]">
                  {a.action} · {a.day} {a.time}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="!rounded-2xl border-[var(--cv-warning)]/30 bg-[var(--color-warning-soft)]">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-warning-soft)] text-[var(--cv-warning)]">
                <ClockIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[var(--cv-text)]">Pending confirmations</h3>
                <p className="mt-1 text-sm text-[var(--cv-muted)]">
                  <strong className="text-[var(--cv-text)]">2 appointments</strong> need your response before
                  farmers cancel.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => navigate('/dashboard/orders')}>
                    Review requests
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/calendar')}>
                    Calendar
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="!rounded-2xl" title="Revenue by Service">
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

          <Card className="!rounded-2xl" title="Ops alerts">
            <ul className="space-y-3">
              {ALERTS.map((a) => (
                <li key={a.text} className="flex gap-2 text-sm text-[var(--cv-muted)]">
                  {a.type === 'warn' ? (
                    <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cv-warning)]" />
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
            <h3 className="font-semibold text-[var(--cv-text)]">Service Offerings</h3>
            <p className="text-xs text-[var(--cv-muted)]">Live availability across your catalog</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/consultancy')}>
            Manage offerings
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          {OFFERINGS.map((offer) => {
            const Icon = categoryIcon[offer.category as keyof typeof categoryIcon] ?? ClipboardDocumentCheckIcon
            return (
              <button
                key={offer.name}
                type="button"
                className="rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] p-4 text-left transition hover:border-[var(--cv-primary)]/30 hover:bg-[var(--cv-surface)]"
                onClick={() => navigate('/dashboard/consultancy')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[var(--cv-text)]">{offer.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--cv-muted)]">{offer.category}</p>
                  </div>
                  <Icon className="h-4 w-4 shrink-0 text-[var(--cv-muted)]" />
                </div>
                <span
                  className={cn(
                    'mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                    statusMeta[offer.status].className,
                  )}
                >
                  {statusMeta[offer.status].label}
                </span>
                <p className="mt-2 text-xs text-[var(--cv-muted)]">{offer.next}</p>
              </button>
            )
          })}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => navigate('/dashboard/calendar')}>
          Availability Calendar
        </Button>
        <Button variant="secondary" onClick={() => navigate('/dashboard/create')}>
          + New Offering
        </Button>
        <Button variant="ghost" onClick={() => navigate('/dashboard/reviews')}>
          Reviews
        </Button>
      </div>
    </div>
  )
}
