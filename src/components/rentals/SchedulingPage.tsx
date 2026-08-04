import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency, cn } from '../../utils/format'
import { Badge, type BadgeStatus } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'
import { LargeTitle } from '../common/LargeTitle'
import { SegmentedControl } from '../common/SegmentedControl'
import { Select } from '../common/Select'
import { Sheet } from '../common/Sheet'
import { useScrollCollapse } from '../../hooks/useScrollCollapse'

type ViewMode = 'calendar' | 'list'
type DayStatus = 'available' | 'booked' | 'blocked' | 'maintenance'
type RentalStatus = 'pending' | 'confirmed' | 'rented' | 'return' | 'completed' | 'damage' | 'closed'

const VIEW_KEY = 'cropvibe.scheduling.view'

interface Booking {
  id: string
  renter: string
  renterRating: number
  equipment: string
  period: string
  days: number
  rate: number
  deposit: number
  status: RentalStatus
  location: string
  when: string
  priority?: 'today' | 'upcoming'
  damageCost?: number
}

const BOOKINGS: Booking[] = [
  {
    id: 'BK-5432',
    renter: 'ABC Farm',
    renterRating: 4.6,
    equipment: 'Tractor #1',
    period: '2026-07-28 to 2026-07-31',
    days: 4,
    rate: 2500,
    deposit: 15000,
    status: 'pending',
    location: '45 km from your area',
    when: 'Today · 2:00 PM pickup',
    priority: 'today',
  },
  {
    id: 'BK-5430',
    renter: 'Farm Ltd',
    renterRating: 4.8,
    equipment: 'Harvester #1',
    period: '2026-07-25 to 2026-07-28',
    days: 3,
    rate: 4500,
    deposit: 20000,
    status: 'rented',
    location: 'Pune',
    when: 'Return due today',
    priority: 'today',
  },
  {
    id: 'BK-5428',
    renter: 'XYZ Inc',
    renterRating: 4.4,
    equipment: 'Rotavator #1',
    period: '2026-07-20 to 2026-07-22',
    days: 2,
    rate: 1800,
    deposit: 8000,
    status: 'return',
    location: 'Nashik',
    when: 'Inspection pending',
    priority: 'upcoming',
  },
  {
    id: 'BK-5425',
    renter: 'Green Valley',
    renterRating: 4.9,
    equipment: 'Sprayer #2',
    period: '2026-08-02 to 2026-08-04',
    days: 3,
    rate: 1200,
    deposit: 5000,
    status: 'confirmed',
    location: 'Satara',
    when: 'Aug 2 · 9:00 AM',
    priority: 'upcoming',
  },
]

const STATUS_STYLE: Record<DayStatus, string> = {
  available: 'cv-cal-available border',
  booked: 'cv-cal-booked border',
  blocked: 'cv-cal-blocked border',
  maintenance: 'cv-cal-maintenance border',
}

function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: { day: number | null; status?: DayStatus; note?: string }[] = []
  for (let i = 0; i < startPad; i++) cells.push({ day: null })
  for (let d = 1; d <= daysInMonth; d++) {
    let status: DayStatus = 'available'
    let note: string | undefined
    if ([3, 4, 5, 12, 18, 19].includes(d)) {
      status = 'booked'
      note = d === 3 ? 'Tractor #1 · ABC Farm' : undefined
    } else if ([8, 9].includes(d)) {
      status = 'maintenance'
      note = 'Service window'
    } else if ([22, 23].includes(d)) {
      status = 'blocked'
      note = 'Owner blocked'
    }
    cells.push({ day: d, status, note })
  }
  return cells
}

function badgeFor(s: RentalStatus): BadgeStatus {
  if (s === 'pending' || s === 'return' || s === 'damage') return 'pending'
  if (s === 'confirmed') return 'accepted'
  if (s === 'rented') return 'active'
  return 'completed'
}

function readStoredView(): ViewMode {
  try {
    const v = localStorage.getItem(VIEW_KEY)
    if (v === 'calendar' || v === 'list') return v
  } catch {
    /* ignore */
  }
  return 'list'
}

export function SchedulingPage() {
  const navigate = useNavigate()
  const collapsed = useScrollCollapse()
  const now = new Date()
  const [view, setView] = useState<ViewMode>(readStoredView)
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const [statusFilter, setStatusFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [bookings, setBookings] = useState(BOOKINGS)
  const [selected, setSelected] = useState<string | null>(BOOKINGS[0]?.id ?? null)
  const [damage, setDamage] = useState({ level: 'none', desc: '', cost: '' })
  const [sheetOpen, setSheetOpen] = useState(false)

  const cells = useMemo(() => buildMonth(cursor.y, cursor.m), [cursor])
  const monthTitle = new Date(cursor.y, cursor.m, 1).toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view)
    } catch {
      /* ignore */
    }
  }, [view])

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        b.id.toLowerCase().includes(q) ||
        b.renter.toLowerCase().includes(q) ||
        b.equipment.toLowerCase().includes(q)
      return matchesStatus && matchesQuery
    })
  }, [bookings, statusFilter, query])

  const booking = bookings.find((b) => b.id === selected) ?? filtered[0]
  const todayCount = bookings.filter((b) => b.priority === 'today').length
  const upcomingCount = bookings.filter((b) => b.priority === 'upcoming').length
  const pendingCount = bookings.filter((b) => b.status === 'pending').length

  const update = (id: string, status: RentalStatus, extra?: Partial<Booking>) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status, ...extra } : b)))
  }

  return (
    <div className="space-y-8">
      <LargeTitle
        collapsed={collapsed}
        title="Scheduling"
        subtitle="One place for bookings — calendar and list share the same filters."
        actions={
          <>
            <SegmentedControl
              ariaLabel="Schedule view"
              value={view}
              onChange={setView}
              options={[
                { value: 'list', label: 'List' },
                { value: 'calendar', label: 'Calendar' },
              ]}
            />
            <Button onClick={() => setSheetOpen(true)}>+ Create booking</Button>
          </>
        }
      />

      <Sheet open={sheetOpen} title="Create booking" onClose={() => setSheetOpen(false)}>
        <p className="mb-4 text-sm text-[var(--cv-muted)]">
          Quick start a booking, or open the full equipment flow for inventory-linked rentals.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            fullWidth
            onClick={() => {
              setSheetOpen(false)
              navigate('/dashboard/create')
            }}
          >
            Open equipment flow
          </Button>
          <Button fullWidth variant="secondary" onClick={() => setSheetOpen(false)}>
            Cancel
          </Button>
        </div>
      </Sheet>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="!rounded-[12px]">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">Today</p>
          <p className="mt-1 text-2xl font-bold">{todayCount}</p>
          <p className="text-xs text-[var(--cv-muted)]">Pickups & returns due</p>
        </Card>
        <Card className="!rounded-[12px]">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">Upcoming</p>
          <p className="mt-1 text-2xl font-bold">{upcomingCount}</p>
          <p className="text-xs text-[var(--cv-muted)]">Next 7 days</p>
        </Card>
        <Card className="!rounded-[12px] ring-1 ring-[var(--cv-warning)]/20">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">Needs action</p>
          <p className="mt-1 text-2xl font-bold text-[var(--cv-warning)]">{pendingCount}</p>
          <p className="text-xs text-[var(--cv-muted)]">Pending confirmations</p>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <FormInput
          label="Search"
          placeholder="Renter, asset, or booking ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'rented', label: 'Rented' },
            { value: 'return', label: 'Return' },
            { value: 'completed', label: 'Completed' },
          ]}
        />
        <Button variant="secondary" onClick={() => navigate('/dashboard/overdue')}>
          Overdue rentals
        </Button>
      </div>

      {view === 'calendar' ? (
        <Card className="!rounded-[12px]">
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCursor((c) => {
                  const d = new Date(c.y, c.m - 1, 1)
                  return { y: d.getFullYear(), m: d.getMonth() }
                })
              }
            >
              ← Prev
            </Button>
            <h2 className="text-lg font-semibold">{monthTitle}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCursor((c) => {
                  const d = new Date(c.y, c.m + 1, 1)
                  return { y: d.getFullYear(), m: d.getMonth() }
                })
              }
            >
              Next →
            </Button>
          </div>
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, idx) =>
              cell.day == null ? (
                <div key={`e-${idx}`} className="min-h-16 rounded-[10px] bg-transparent" />
              ) : (
                <button
                  key={cell.day}
                  type="button"
                  title={cell.note}
                  className={cn(
                    'min-h-16 rounded-[10px] border p-2 text-left transition hover:brightness-95',
                    STATUS_STYLE[cell.status ?? 'available'],
                  )}
                  onClick={() => setView('list')}
                >
                  <span className="text-sm font-semibold">{cell.day}</span>
                  {cell.note ? (
                    <span className="mt-1 block truncate text-[10px] opacity-80">{cell.note}</span>
                  ) : null}
                </button>
              ),
            )}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {(
              [
                ['available', 'Available'],
                ['booked', 'Booked'],
                ['maintenance', 'Maintenance'],
                ['blocked', 'Blocked'],
              ] as const
            ).map(([key, label]) => (
              <div
                key={key}
                className={cn('rounded-[10px] border px-3 py-2 text-sm font-medium', STATUS_STYLE[key])}
              >
                {label}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <Card title={`Bookings (${filtered.length})`} className="!rounded-[12px]">
            <ul className="space-y-2">
              {filtered.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(b.id)}
                    className={cn(
                      'w-full rounded-[10px] border px-3 py-2.5 text-left text-sm transition',
                      selected === b.id
                        ? 'border-[var(--cv-primary)] bg-[var(--cv-primary-soft)]'
                        : 'border-[var(--cv-border)] hover:border-[var(--cv-primary)]/30',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{b.id}</span>
                      <Badge status={badgeFor(b.status)}>{b.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-[var(--cv-muted)]">
                      {b.equipment} · {b.renter}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-[var(--cv-text)]">{b.when}</p>
                  </button>
                </li>
              ))}
              {filtered.length === 0 ? (
                <li className="py-8 text-center text-sm text-[var(--cv-muted)]">No bookings match filters.</li>
              ) : null}
            </ul>
          </Card>

          {booking ? (
            <Card className="!rounded-[12px]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{booking.id}</h2>
                  <p className="text-sm text-[var(--cv-muted)]">
                    {booking.period} ({booking.days} days)
                  </p>
                </div>
                <Badge status={badgeFor(booking.status)}>{booking.status}</Badge>
              </div>

              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <p>
                  <strong>Renter:</strong> {booking.renter} ({booking.renterRating}★)
                </p>
                <p>
                  <strong>Equipment:</strong> {booking.equipment}
                </p>
                <p>
                  <strong>Location:</strong> {booking.location}
                </p>
                <p>
                  <strong>Rate:</strong> {formatCurrency(booking.rate)}/day × {booking.days} ={' '}
                  {formatCurrency(booking.rate * booking.days)}
                </p>
                <p>
                  <strong>Security deposit:</strong> {formatCurrency(booking.deposit)}
                </p>
                <p>
                  <strong>Schedule:</strong> {booking.when}
                </p>
              </div>

              {booking.status === 'return' ? (
                <div className="mt-4 space-y-3 rounded-[12px] border border-[var(--cv-border)] p-4">
                  <p className="font-medium">Verify equipment condition</p>
                  {['Engine starts smoothly', 'No visible damage', 'Tires intact', 'Lights working', 'Fuel/fluids normal'].map(
                    (c) => (
                      <label key={c} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked /> {c}
                      </label>
                    ),
                  )}
                  <Select
                    label="Any damage?"
                    value={damage.level}
                    onChange={(e) => setDamage((p) => ({ ...p, level: e.target.value }))}
                    options={[
                      { value: 'none', label: 'No damage' },
                      { value: 'minor', label: 'Minor damage' },
                      { value: 'major', label: 'Major damage' },
                    ]}
                  />
                  {damage.level !== 'none' ? (
                    <>
                      <FormInput
                        label="Damage description"
                        as="textarea"
                        value={damage.desc}
                        onChange={(e) => setDamage((p) => ({ ...p, desc: e.target.value }))}
                      />
                      <FormInput
                        label="Estimated repair cost"
                        type="number"
                        value={damage.cost}
                        onChange={(e) => setDamage((p) => ({ ...p, cost: e.target.value }))}
                      />
                    </>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-2">
                {booking.status === 'pending' ? (
                  <>
                    <Button onClick={() => update(booking.id, 'confirmed')}>Confirm booking</Button>
                    <Button variant="danger" onClick={() => update(booking.id, 'closed')}>
                      Decline
                    </Button>
                    <Button variant="secondary">Send reminder</Button>
                  </>
                ) : null}
                {booking.status === 'confirmed' ? (
                  <Button onClick={() => update(booking.id, 'rented')}>Mark as rented</Button>
                ) : null}
                {booking.status === 'rented' ? (
                  <>
                    <Button onClick={() => update(booking.id, 'return')}>Initiate return</Button>
                    <Button variant="secondary">Send reminder</Button>
                  </>
                ) : null}
                {booking.status === 'return' ? (
                  <Button
                    onClick={() => {
                      if (damage.level === 'none') update(booking.id, 'completed')
                      else update(booking.id, 'damage', { damageCost: Number(damage.cost) || 3500 })
                    }}
                  >
                    Confirm return
                  </Button>
                ) : null}
                {booking.status === 'completed' || booking.status === 'damage' ? (
                  <Button onClick={() => update(booking.id, 'closed')}>Request renter rating</Button>
                ) : null}
                {booking.status === 'closed' ? (
                  <p className="text-sm text-[var(--cv-muted)]">Booking closed. Payments settled.</p>
                ) : null}
              </div>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  )
}
