import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDownIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'
import { formatCurrency, cn } from '../../utils/format'
import { Badge, type BadgeStatus } from '../common/Badge'
import { Button } from '../common/Button'
import { FormInput } from '../common/FormInput'
import { Select } from '../common/Select'
import { Sheet } from '../common/Sheet'

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

const EVENT_CHIP: Record<DayStatus, string> = {
  available: '',
  booked: 'bg-[var(--color-info-soft)] text-[var(--cv-info)]',
  blocked: 'bg-[var(--cv-elevated)] text-[var(--cv-muted)]',
  maintenance: 'bg-[var(--color-warning-soft)] text-[var(--cv-warning)]',
}

const STATUS_CARD: Record<RentalStatus, string> = {
  pending: 'bg-[var(--color-warning-soft)] border-[color-mix(in_srgb,var(--cv-warning)_28%,transparent)]',
  confirmed: 'bg-[var(--color-success-soft)] border-[color-mix(in_srgb,var(--cv-success)_28%,transparent)]',
  rented: 'bg-[var(--cv-primary-soft)] border-[color-mix(in_srgb,var(--cv-nav-active-fg)_40%,transparent)]',
  return: 'bg-[var(--color-info-soft)] border-[var(--color-info-border)]',
  completed: 'bg-[var(--cv-elevated)] border-[var(--cv-border)]',
  damage: 'bg-[color-mix(in_srgb,var(--cv-danger)_12%,transparent)] border-[color-mix(in_srgb,var(--cv-danger)_28%,transparent)]',
  closed: 'bg-[var(--cv-elevated)] border-[var(--cv-border)]',
}

const STATUS_DOT: Record<RentalStatus, string> = {
  pending: 'bg-[var(--cv-warning)]',
  confirmed: 'bg-[var(--cv-success)]',
  rented: 'bg-[var(--cv-nav-active-fg)]',
  return: 'bg-[var(--cv-info)]',
  completed: 'bg-[var(--cv-muted)]',
  damage: 'bg-[var(--cv-danger)]',
  closed: 'bg-[var(--cv-muted)]',
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

function bookingDateParts(period: string) {
  const start = period.split(' to ')[0]?.trim() ?? ''
  const d = new Date(start)
  if (Number.isNaN(d.getTime())) {
    return { weekday: '—', day: '—' }
  }
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    day: String(d.getDate()),
  }
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

const FILTER_OPTS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'rented', label: 'Rented' },
  { value: 'return', label: 'Return' },
  { value: 'completed', label: 'Completed' },
] as const

export function SchedulingPage() {
  const navigate = useNavigate()
  const now = new Date()
  const [view, setView] = useState<ViewMode>(readStoredView)
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const [statusFilter, setStatusFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [bookings, setBookings] = useState(BOOKINGS)
  const [selected, setSelected] = useState<string | null>(BOOKINGS[0]?.id ?? null)
  const [damage, setDamage] = useState({ level: 'none', desc: '', cost: '' })
  const [sheetOpen, setSheetOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const cells = useMemo(() => buildMonth(cursor.y, cursor.m), [cursor])
  const miniCells = cells
  const monthTitle = new Date(cursor.y, cursor.m, 1).toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
  })
  const miniMonth = new Date(cursor.y, cursor.m, 1).toLocaleString('en-US', {
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--cv-text)] sm:text-[2rem]">
            Scheduling
          </h1>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">
            One place for bookings — calendar and list share the same filters.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-full bg-[var(--cv-elevated)] p-1">
            {(
              [
                { value: 'list' as const, label: 'List' },
                { value: 'calendar' as const, label: 'Calendar' },
              ]
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setView(opt.value)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition',
                  view === opt.value
                    ? 'bg-[var(--cv-surface)] text-[var(--cv-text)] shadow-sm'
                    : 'text-[var(--cv-muted)] hover:text-[var(--cv-text)]',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Button className="!rounded-full !bg-[var(--cv-nav-active-fg)] !text-[var(--cv-nav-active-bg)] hover:!brightness-95" onClick={() => setSheetOpen(true)}>
            + Create booking
          </Button>
        </div>
      </div>

      <Sheet
        open={sheetOpen}
        title="Create booking"
        onClose={() => setSheetOpen(false)}
        className="max-w-3xl !bg-[var(--cv-surface)] sm:!rounded-[24px]"
      >
        <div className="pb-2">
          <p className="mb-5 text-sm text-[var(--cv-muted)]">
            Quick start a booking, or open the full equipment flow for inventory-linked rentals.
          </p>

          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <div className="mb-3 flex items-center gap-2">
                {[
                  { n: 1, label: 'Details', active: true },
                  { n: 2, label: 'Equipment', active: false },
                  { n: 3, label: 'Confirm', active: false },
                ].map((s) => (
                  <div key={s.n} className="flex items-center gap-2">
                    <span
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                        s.active
                          ? 'bg-[var(--cv-nav-active-fg)] text-[var(--cv-nav-active-bg)]'
                          : 'bg-[var(--cv-elevated)] text-[var(--cv-muted)]',
                      )}
                    >
                      {s.n}
                    </span>
                    <span
                      className={cn(
                        'hidden text-xs font-medium sm:inline',
                        s.active ? 'text-[var(--cv-text)]' : 'text-[var(--cv-muted)]',
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-elevated)]/40 p-4">
                <p className="text-sm font-semibold text-[var(--cv-text)]">How do you want to start?</p>
                <p className="mt-1 text-xs text-[var(--cv-muted)]">
                  Use the equipment flow to pick inventory, rates, and renter details in one place.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    className="rounded-2xl border-2 border-[var(--cv-nav-active-fg)] bg-[var(--cv-primary-soft)] p-4 text-left transition hover:brightness-95"
                    onClick={() => {
                      setSheetOpen(false)
                      navigate('/dashboard/create')
                    }}
                  >
                    <p className="text-sm font-semibold text-[var(--cv-text)]">Open equipment flow</p>
                    <p className="mt-1 text-xs text-[var(--cv-muted)]">Full guided create</p>
                  </button>
                  <button
                    type="button"
                    className="rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4 text-left transition hover:bg-[var(--cv-elevated)]"
                    onClick={() => setSheetOpen(false)}
                  >
                    <p className="text-sm font-semibold text-[var(--cv-text)]">Cancel</p>
                    <p className="mt-1 text-xs text-[var(--cv-muted)]">Close without creating</p>
                  </button>
                </div>
              </div>
            </div>

            <aside className="rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-elevated)]/50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--cv-muted)]">
                Summary
              </p>
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="text-[var(--cv-muted)]">Workflow</dt>
                  <dd className="mt-0.5 font-medium text-[var(--cv-text)]">Equipment-linked booking</dd>
                </div>
                <div>
                  <dt className="text-[var(--cv-muted)]">Includes</dt>
                  <dd className="mt-0.5 text-[var(--cv-text)]">Asset · renter · rates · dates</dd>
                </div>
                <div className="border-t border-[var(--cv-border)] pt-3">
                  <dt className="text-[var(--cv-muted)]">Next</dt>
                  <dd className="mt-0.5 font-medium text-[var(--cv-text)]">Continue in create flow</dd>
                </div>
              </dl>
              <Button
                className="mt-5 w-full !rounded-xl !bg-[var(--cv-nav-active-fg)] !text-[var(--cv-nav-active-bg)]"
                onClick={() => {
                  setSheetOpen(false)
                  navigate('/dashboard/create')
                }}
              >
                Next
              </Button>
            </aside>
          </div>
        </div>
      </Sheet>

      {/* Calendary-style shell */}
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Left rail */}
        <aside className="space-y-5 rounded-[28px] border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-5">
          {/* Mini calendar */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--cv-text)]">{miniMonth}</p>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Previous month"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)]"
                  onClick={() =>
                    setCursor((c) => {
                      const d = new Date(c.y, c.m - 1, 1)
                      return { y: d.getFullYear(), m: d.getMonth() }
                    })
                  }
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)]"
                  onClick={() =>
                    setCursor((c) => {
                      const d = new Date(c.y, c.m + 1, 1)
                      return { y: d.getFullYear(), m: d.getMonth() }
                    })
                  }
                >
                  ›
                </button>
              </div>
            </div>
            <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-medium text-[var(--cv-muted)]">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={`${d}-${i}`} className="py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {miniCells.map((cell, idx) => {
                const isToday =
                  cell.day != null &&
                  cell.day === now.getDate() &&
                  cursor.m === now.getMonth() &&
                  cursor.y === now.getFullYear()
                return (
                  <div
                    key={`m-${idx}`}
                    className={cn(
                      'flex aspect-square items-center justify-center rounded-full text-[11px]',
                      cell.day == null && 'invisible',
                      isToday
                        ? 'bg-[var(--cv-nav-active-fg)] font-bold text-[var(--cv-nav-active-bg)]'
                        : 'text-[var(--cv-text)]',
                    )}
                  >
                    {cell.day}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Filters */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--cv-muted)]">
              Filters
            </p>
            <ul className="space-y-1.5">
              {FILTER_OPTS.map((opt) => (
                <li key={opt.value}>
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm hover:bg-[var(--cv-elevated)]">
                    <input
                      type="radio"
                      name="status-filter"
                      className="accent-[var(--cv-nav-active-fg)]"
                      checked={statusFilter === opt.value}
                      onChange={() => setStatusFilter(opt.value)}
                    />
                    <span className="text-[var(--cv-text)]">{opt.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories / legend */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--cv-muted)]">
              Categories
            </p>
            <ul className="space-y-2">
              {(
                [
                  ['booked', 'Booked', 'bg-[var(--cv-info)]'],
                  ['maintenance', 'Maintenance', 'bg-[var(--cv-warning)]'],
                  ['blocked', 'Blocked', 'bg-[var(--cv-muted)]'],
                  ['available', 'Available', 'bg-[var(--cv-nav-active-fg)]'],
                ] as const
              ).map(([key, label, dot]) => (
                <li key={key} className="flex items-center gap-2.5 px-2 text-sm text-[var(--cv-text)]">
                  <span className={cn('h-2.5 w-2.5 rounded-full', dot)} />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          <div className="space-y-2 border-t border-[var(--cv-border)] pt-4">
            <div className="rounded-2xl bg-[var(--cv-primary-soft)] px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--cv-muted)]">Today</p>
              <p className="text-xl font-bold text-[var(--cv-text)]">{todayCount}</p>
              <p className="text-[11px] text-[var(--cv-muted)]">Pickups & returns due</p>
            </div>
            <div className="rounded-2xl bg-[var(--cv-elevated)] px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--cv-muted)]">Upcoming</p>
              <p className="text-xl font-bold text-[var(--cv-text)]">{upcomingCount}</p>
              <p className="text-[11px] text-[var(--cv-muted)]">Next 7 days</p>
            </div>
            <div className="rounded-2xl bg-[var(--color-warning-soft)] px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--cv-muted)]">Needs action</p>
              <p className="text-xl font-bold text-[var(--cv-warning)]">{pendingCount}</p>
              <p className="text-[11px] text-[var(--cv-muted)]">Pending confirmations</p>
            </div>
          </div>

          <Button
            variant="secondary"
            fullWidth
            className="!rounded-full"
            onClick={() => navigate('/dashboard/overdue')}
          >
            Overdue rentals
          </Button>
        </aside>

        {/* Main panel */}
        <section className="min-w-0 rounded-[28px] border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
          {/* Search */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cv-muted)]" />
              <input
                type="search"
                aria-label="Search"
                placeholder="Renter, asset, or booking ID"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="focus-ring w-full rounded-full border border-[var(--cv-border)] bg-[var(--cv-elevated)]/60 py-2.5 pl-10 pr-4 text-sm text-[var(--cv-text)] placeholder:text-[var(--cv-muted)]"
              />
            </div>
          </div>

          {view === 'calendar' ? (
            <div>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous month"
                    className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-[var(--cv-border)] text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)]"
                    onClick={() =>
                      setCursor((c) => {
                        const d = new Date(c.y, c.m - 1, 1)
                        return { y: d.getFullYear(), m: d.getMonth() }
                      })
                    }
                  >
                    ←
                  </button>
                  <h2 className="min-w-[10rem] text-center text-lg font-semibold tracking-tight text-[var(--cv-text)] sm:text-xl">
                    {monthTitle}
                  </h2>
                  <button
                    type="button"
                    aria-label="Next month"
                    className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-[var(--cv-border)] text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)]"
                    onClick={() =>
                      setCursor((c) => {
                        const d = new Date(c.y, c.m + 1, 1)
                        return { y: d.getFullYear(), m: d.getMonth() }
                      })
                    }
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  className="rounded-full bg-[var(--cv-nav-active-fg)] px-4 py-1.5 text-sm font-semibold text-[var(--cv-nav-active-bg)]"
                  onClick={() => setCursor({ y: now.getFullYear(), m: now.getMonth() })}
                >
                  Today
                </button>
              </div>

              <div className="mb-2 grid grid-cols-7 gap-2 text-center text-[11px] font-medium text-[var(--cv-muted)]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {cells.map((cell, idx) => {
                  const status = cell.status ?? 'available'
                  const isToday =
                    cell.day != null &&
                    cell.day === now.getDate() &&
                    cursor.m === now.getMonth() &&
                    cursor.y === now.getFullYear()

                  if (cell.day == null) {
                    return <div key={`e-${idx}`} className="min-h-[5rem] rounded-2xl sm:min-h-[5.75rem]" />
                  }

                  return (
                    <button
                      key={cell.day}
                      type="button"
                      title={cell.note}
                      className="focus-ring flex min-h-[5rem] flex-col gap-1 rounded-2xl border border-transparent bg-[var(--cv-elevated)]/40 p-2 text-left transition hover:border-[var(--cv-border)] hover:bg-[var(--cv-elevated)] sm:min-h-[5.75rem] sm:p-2.5"
                      onClick={() => setView('list')}
                    >
                      <span
                        className={cn(
                          'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                          isToday ? 'bg-[var(--cv-nav-active-fg)] text-[var(--cv-nav-active-bg)]' : 'text-[var(--cv-text)]',
                        )}
                      >
                        {cell.day}
                      </span>
                      {cell.note ? (
                        <span
                          className={cn(
                            'mt-auto truncate rounded-xl px-1.5 py-1 text-[10px] font-medium leading-tight',
                            EVENT_CHIP[status] || 'bg-[var(--cv-elevated)] text-[var(--cv-muted)]',
                          )}
                        >
                          {cell.note}
                        </span>
                      ) : status !== 'available' ? (
                        <span
                          className={cn(
                            'mt-auto h-1.5 w-full rounded-full',
                            status === 'booked' && 'bg-[var(--cv-info)]',
                            status === 'maintenance' && 'bg-[var(--cv-warning)]',
                            status === 'blocked' && 'bg-[var(--cv-muted)]',
                          )}
                          aria-hidden
                        />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-sm font-semibold text-[var(--cv-text)]">
                  Bookings <span className="text-[var(--cv-muted)]">({filtered.length})</span>
                </h2>
              </div>

              <ul className="space-y-3">
                {filtered.map((b) => {
                  const date = bookingDateParts(b.period)
                  const isSelected = (selected ?? filtered[0]?.id) === b.id
                  const isPendingLike =
                    b.status === 'pending' || b.status === 'return' || b.status === 'damage'
                  const open = menuOpen === b.id
                  const initials = b.renter
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((w) => w[0]?.toUpperCase() ?? '')
                    .join('')

                  return (
                    <li key={b.id} className="relative">
                      <div
                        tabIndex={0}
                        onClick={() => {
                          setSelected(b.id)
                          setMenuOpen(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelected(b.id)
                            setMenuOpen(null)
                          }
                        }}
                        className={cn(
                          'group flex w-full cursor-pointer items-stretch gap-3 rounded-[22px] border px-3 py-3.5 transition sm:gap-5 sm:px-5',
                          STATUS_CARD[b.status],
                          isSelected &&
                            'ring-2 ring-[var(--cv-nav-active-fg)] ring-offset-2 ring-offset-[var(--cv-surface)]',
                        )}
                      >
                        <div className="flex w-12 shrink-0 flex-col items-center justify-center sm:w-14">
                          <span
                            className={cn(
                              'text-[11px] font-semibold uppercase tracking-wide',
                              b.priority === 'today' ? 'text-[var(--cv-warning)]' : 'text-[var(--cv-muted)]',
                            )}
                          >
                            {date.weekday}
                          </span>
                          <span className="text-2xl font-bold leading-none text-[var(--cv-text)] sm:text-[28px]">
                            {date.day}
                          </span>
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 sm:max-w-[220px] sm:flex-none">
                          <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--cv-text)]">
                            <ClockIcon className="h-4 w-4 shrink-0 text-[var(--cv-muted)]" />
                            <span className="truncate">{b.when}</span>
                            {isPendingLike ? (
                              <span className="ml-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-warning-soft)] text-[10px] font-bold text-[var(--cv-warning)]">
                                !
                              </span>
                            ) : null}
                          </p>
                          <p className="flex items-center gap-1.5 text-xs text-[var(--cv-muted)]">
                            <MapPinIcon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{b.location}</span>
                          </p>
                        </div>

                        <div className="hidden min-w-0 flex-1 flex-col justify-center gap-2 sm:flex">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn('h-2 w-2 rounded-full', STATUS_DOT[b.status])} />
                            <p className="truncate text-sm font-semibold text-[var(--cv-text)]">{b.id}</p>
                            <Badge status={badgeFor(b.status)}>{b.status}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--cv-surface)] text-[10px] font-bold text-[var(--cv-text)] ring-2 ring-[var(--cv-surface)]"
                              title={b.renter}
                            >
                              {initials}
                            </span>
                            <p className="truncate text-xs text-[var(--cv-muted)]">
                              {b.equipment} · {b.renter}
                            </p>
                          </div>
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 sm:hidden">
                          <p className="truncate text-sm font-semibold text-[var(--cv-text)]">{b.id}</p>
                          <p className="truncate text-xs text-[var(--cv-muted)]">{b.equipment}</p>
                          <Badge status={badgeFor(b.status)}>{b.status}</Badge>
                        </div>

                        <div className="relative flex shrink-0 items-center">
                          <button
                            type="button"
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition',
                              open
                                ? 'bg-[var(--cv-text)] text-[var(--cv-bg)]'
                                : 'bg-[var(--cv-surface)]/80 text-[var(--cv-text)] hover:bg-[var(--cv-surface)]',
                            )}
                            aria-expanded={open}
                            aria-haspopup="menu"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelected(b.id)
                              setMenuOpen(open ? null : b.id)
                            }}
                          >
                            Edit
                            <ChevronDownIcon className={cn('h-4 w-4 transition', open && 'rotate-180')} />
                          </button>

                          {open ? (
                            <div
                              role="menu"
                              className="absolute right-0 top-[calc(100%+6px)] z-20 min-w-[200px] overflow-hidden rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-surface)] py-1 shadow-[var(--shadow-lg)]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {b.status === 'pending' ? (
                                <>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="block w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--cv-elevated)]"
                                    onClick={() => {
                                      update(b.id, 'confirmed')
                                      setMenuOpen(null)
                                    }}
                                  >
                                    Confirm booking
                                  </button>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="block w-full px-4 py-2.5 text-left text-sm text-[var(--cv-danger)] hover:bg-[var(--cv-elevated)]"
                                    onClick={() => {
                                      update(b.id, 'closed')
                                      setMenuOpen(null)
                                    }}
                                  >
                                    Decline
                                  </button>
                                </>
                              ) : null}
                              {b.status === 'confirmed' ? (
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="block w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--cv-elevated)]"
                                  onClick={() => {
                                    update(b.id, 'rented')
                                    setMenuOpen(null)
                                  }}
                                >
                                  Mark as rented
                                </button>
                              ) : null}
                              {b.status === 'rented' ? (
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="block w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--cv-elevated)]"
                                  onClick={() => {
                                    update(b.id, 'return')
                                    setMenuOpen(null)
                                  }}
                                >
                                  Initiate return
                                </button>
                              ) : null}
                              {b.status === 'return' ||
                              b.status === 'completed' ||
                              b.status === 'damage' ||
                              b.status === 'closed' ? (
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="block w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--cv-elevated)]"
                                  onClick={() => {
                                    setSelected(b.id)
                                    setMenuOpen(null)
                                  }}
                                >
                                  View details
                                </button>
                              ) : null}
                              {b.status === 'pending' || b.status === 'rented' ? (
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="block w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--cv-elevated)]"
                                  onClick={() => setMenuOpen(null)}
                                >
                                  Send reminder
                                </button>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  )
                })}
                {filtered.length === 0 ? (
                  <li className="rounded-[22px] border border-dashed border-[var(--cv-border)] py-12 text-center text-sm text-[var(--cv-muted)]">
                    No bookings match filters.
                  </li>
                ) : null}
              </ul>

              {booking ? (
                <div className="mt-2 rounded-[22px] border border-[var(--cv-border)] bg-[var(--cv-elevated)]/30 p-5">
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
                    <div className="mt-4 space-y-3 rounded-[16px] border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4">
                      <p className="font-medium">Verify equipment condition</p>
                      {[
                        'Engine starts smoothly',
                        'No visible damage',
                        'Tires intact',
                        'Lights working',
                        'Fuel/fluids normal',
                      ].map((c) => (
                        <label key={c} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked /> {c}
                        </label>
                      ))}
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
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
