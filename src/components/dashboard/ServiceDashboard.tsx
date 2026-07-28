import { useNavigate } from 'react-router-dom'
import {
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  StarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { useAppStore } from '../../store/appStore'
import { formatCurrency, cn } from '../../utils/format'

const APPOINTMENTS = [
  {
    day: 'Today',
    items: [
      { time: '14:00', service: 'Farm Consultancy', client: 'Farmer ABC', location: 'XYZ Farm', status: 'accepted' as const },
      { time: '16:30', service: 'Soil Testing', client: 'Farmer XYZ', location: 'Village A', status: 'accepted' as const },
    ],
  },
  {
    day: 'Tomorrow',
    items: [
      { time: '10:00', service: 'Equipment Repair', client: 'Workshop DEF', location: 'Workshop', status: 'pending' as const },
      { time: '15:00', service: 'Crop Inspection', client: 'Green Fields', location: 'Plot 12', status: 'accepted' as const },
    ],
  },
]

const PERFORMANCE = [
  { name: 'Farm Consultancy', bookings: 34, revenue: 123600, pct: 100 },
  { name: 'Soil Testing', bookings: 18, revenue: 78300, pct: 63 },
  { name: 'Equipment Repair', bookings: 12, revenue: 45200, pct: 37 },
  { name: 'Crop Inspection', bookings: 8, revenue: 32450, pct: 26 },
]

const REVIEWS = [
  { stars: 5, text: 'Excellent consultation!', author: 'Farmer ABC' },
  { stars: 5, text: 'Professional and on time.', author: 'Workshop XYZ' },
  { stars: 4, text: 'Clear soil report, actionable advice.', author: 'Village Co-op' },
]

const ACTIONS = [
  { time: 'Tomorrow 10 AM', text: 'Equipment Repair — Workshop DEF' },
  { time: 'Invoices', text: '2 clients waiting for invoice' },
  { time: 'This week', text: '3 clients rated you 5 stars' },
]

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
          <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--cv-text)]">{value}</p>
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
  const kycPending = user?.kycStatus === 'pending'
  const name = user?.profile.name?.split(' ')[0] ?? 'Dr. Sharma'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="space-y-6">
      {kycPending ? (
        <div className="flex items-start gap-3 rounded-2xl border border-[var(--cv-warning)]/30 bg-[rgba(245,185,66,0.12)] px-4 py-3 text-sm text-[var(--cv-warning)]">
          <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <strong>KYC Pending — Review status.</strong> Offering services stays locked until approval.
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-surface)] p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <p className="text-sm font-medium text-[var(--cv-primary)]">Service Provider workspace</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--cv-text)] sm:text-3xl">
            {greeting}, {name}
          </h2>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">
            Last login: 30 min ago · {user?.profile.location ?? 'Bangalore, India'}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button disabled={kycPending} onClick={() => navigate('/dashboard/create')}>
            + New Appointment
          </Button>
          <Button variant="secondary" onClick={() => navigate('/dashboard/orders')}>
            View Calendar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total Revenue" value={formatCurrency(345600)} hint="42 services" icon={CurrencyRupeeIcon} emphasize />
        <StatCard title="This Month" value={formatCurrency(78450)} hint="₹ 15,300" positive icon={ArrowTrendingUpIcon} />
        <StatCard title="Appointments" value="18 / 2" hint="Completed / Pending" icon={CalendarDaysIcon} />
        <StatCard title="Client Base" value="34" hint="Active clients" icon={UserGroupIcon} emphasize />
        <StatCard title="Repeat Clients" value="18" hint="53% loyalty" positive icon={ArrowPathIcon} />
        <StatCard title="Avg Rating" value="4.9 / 5.0" hint="42 reviews" icon={StarIcon} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[var(--cv-text)]">Appointment Schedule</h3>
              <p className="text-xs text-[var(--cv-muted)]">Next 7 days</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/orders')}>
              View all
            </Button>
          </div>
          <div className="space-y-4">
            {APPOINTMENTS.map((group) => (
              <div key={group.day}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--cv-muted)]">
                  {group.day}
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {group.items.map((a) => (
                    <div
                      key={`${a.time}-${a.service}`}
                      className="rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4 transition hover:border-[var(--cv-primary)]/25"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">
                            {a.service}
                          </p>
                          <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--cv-text)]">{a.time}</p>
                          <p className="mt-1.5 truncate text-xs font-medium text-[var(--cv-primary)]">{a.client}</p>
                        </div>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--cv-primary-soft)] text-[var(--cv-primary)]">
                          <ClockIcon className="h-5 w-5" />
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--cv-border)] pt-3">
                        <p className="flex min-w-0 items-center gap-1.5 truncate text-xs text-[var(--cv-muted)]">
                          <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                          {a.location}
                        </p>
                        <Badge status={a.status}>{a.status === 'pending' ? 'Pending' : 'Confirmed'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="!rounded-2xl border-[var(--cv-warning)]/30 bg-[rgba(245,185,66,0.08)]">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(245,185,66,0.15)] text-[var(--cv-warning)]">
                <ClockIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[var(--cv-text)]">Invoices pending</h3>
                <p className="mt-1 text-sm text-[var(--cv-muted)]">
                  <strong className="text-[var(--cv-text)]">2 clients</strong> are waiting for invoices.
                </p>
                <div className="mt-3">
                  <Button size="sm" onClick={() => navigate('/dashboard/wallet')}>
                    Open settlements
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="!rounded-2xl" title="Service Performance">
            <div className="space-y-4">
              {PERFORMANCE.map((s) => (
                <div key={s.name}>
                  <div className="mb-1.5 flex flex-wrap justify-between gap-2 text-sm">
                    <span className="font-medium text-[var(--cv-muted)]">{s.name}</span>
                    <span className="font-semibold text-[var(--cv-primary)]">{formatCurrency(s.revenue)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--cv-elevated)]">
                    <div className="h-full rounded-full bg-[var(--cv-primary)]" style={{ width: `${s.pct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--cv-muted)]">{s.bookings} bookings</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="!rounded-2xl" title="Recent Reviews">
          <ul className="space-y-3">
            {REVIEWS.map((r) => (
              <li key={r.author + r.text} className="rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] p-3">
                <p className="text-sm font-medium text-[var(--cv-primary)]">
                  {'★'.repeat(r.stars)}
                  <span className="text-[var(--cv-muted)]">{'★'.repeat(5 - r.stars)}</span>
                  <span className="ml-2 text-xs text-[var(--cv-muted)]">({r.stars}/5)</span>
                </p>
                <p className="mt-1 text-sm text-[var(--cv-muted)]">
                  &quot;{r.text}&quot; — {r.author}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="!rounded-2xl" title="Upcoming Actions">
          <ul className="space-y-3">
            {ACTIONS.map((a) => (
              <li key={a.time + a.text} className="flex gap-3 text-sm">
                <span className="w-28 shrink-0 text-xs font-medium text-[var(--cv-muted)]">{a.time}</span>
                <span className="text-[var(--cv-muted)]">{a.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => navigate('/dashboard/listings')}>
          Manage Services
        </Button>
        <Button variant="ghost" onClick={() => navigate('/dashboard/reviews')}>
          All Reviews
        </Button>
      </div>
    </div>
  )
}
