import { useMemo, useState } from 'react'
import {
  CheckCircleIcon,
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  PauseCircleIcon,
} from '@heroicons/react/24/outline'
import { cn, formatCurrency } from '../../utils/format'

export type DriverStatus = 'available' | 'booked' | 'maintenance' | 'inactive'

export interface DriverJobLine {
  label: string
  qty: number
  price: number
}

export interface DriverCardItem {
  id: string
  name: string
  role: string
  meta: string
  rate: number
  unit: string
  status: DriverStatus
  location: string
  next?: string
  owner?: string
  year?: string
  utilization?: number
  revenueMtd?: number
  bookingsCount?: number
  outstanding?: number
  collected?: number
  lastActive: string
  statusNote: string
  jobs: DriverJobLine[]
  accent: string
}

export const DRIVER_CARDS: DriverCardItem[] = [
  {
    id: 'D-301',
    name: 'Ramesh Yadav',
    role: 'Truck & Tractor Driver',
    meta: '10 yrs exp · Telugu, Hindi, English',
    rate: 1200,
    unit: 'shift',
    status: 'available',
    location: 'Karimnagar',
    next: 'Available today',
    owner: 'Ramesh Yadav',
    utilization: 82,
    revenueMtd: 18400,
    bookingsCount: 18,
    outstanding: 1200,
    collected: 17200,
    lastActive: 'Wednesday, 12 July 2024 · 09:15',
    statusNote: 'Ready for hire',
    accent: 'bg-[#5B8DEF]',
    jobs: [
      { label: 'Farm-to-mandi produce haul', qty: 1, price: 1500 },
      { label: 'Tractor-trailer field run', qty: 1, price: 1200 },
      { label: 'On-field equipment shuttle', qty: 2, price: 900 },
    ],
  },
  {
    id: 'D-302',
    name: 'Suresh More',
    role: 'Harvester driver',
    meta: 'Licensed · nights OK',
    rate: 1200,
    unit: 'shift',
    status: 'booked',
    location: 'Ahmednagar',
    next: 'On job till Wed',
    owner: 'Suresh M',
    utilization: 90,
    revenueMtd: 16800,
    bookingsCount: 14,
    outstanding: 3600,
    collected: 13200,
    lastActive: 'Tuesday, 12 July 2024 · 13:03',
    statusNote: 'On trip now',
    accent: 'bg-[#E8A838]',
    jobs: [
      { label: 'Wheat harvest run', qty: 1, price: 1200 },
      { label: 'Grain cart shuttle', qty: 2, price: 1500 },
      { label: 'Field edge trim', qty: 1, price: 800 },
      { label: 'Night shift cover', qty: 1, price: 1400 },
      { label: 'Depot return', qty: 1, price: 600 },
    ],
  },
  {
    id: 'D-303',
    name: 'Vikram Singh',
    role: 'Transport · HMV',
    meta: 'Pickup truck / tempo',
    rate: 1500,
    unit: 'day',
    status: 'available',
    location: 'Pune',
    next: 'Ready',
    owner: 'Vikram S',
    utilization: 60,
    revenueMtd: 10500,
    bookingsCount: 7,
    outstanding: 1500,
    collected: 9000,
    lastActive: 'Monday, 11 July 2024 · 20:30',
    statusNote: 'Ready for hire',
    accent: 'bg-[#3D9B7A]',
    jobs: [
      { label: 'Produce haul to mandi', qty: 1, price: 1500 },
      { label: 'Input delivery', qty: 1, price: 1200 },
    ],
  },
  {
    id: 'D-304',
    name: 'Anita Deshmukh',
    role: 'Sprayer operator',
    meta: 'Boom & knapsack certified',
    rate: 950,
    unit: 'shift',
    status: 'booked',
    location: 'Nashik',
    next: 'Spray block till 4 PM',
    owner: 'Anita D',
    utilization: 82,
    revenueMtd: 14200,
    bookingsCount: 12,
    outstanding: 1900,
    collected: 12300,
    lastActive: 'Tuesday, 12 July 2024 · 10:22',
    statusNote: 'Spray in progress',
    accent: 'bg-[#C45C8A]',
    jobs: [
      { label: 'Orchard spray pass', qty: 2, price: 950 },
      { label: 'Tank refill assist', qty: 1, price: 400 },
      { label: 'PPE kit check', qty: 1, price: 0 },
    ],
  },
  {
    id: 'D-305',
    name: 'Imran Pathan',
    role: 'Multi-implement',
    meta: 'Tractor + trailer + tipper',
    rate: 1100,
    unit: 'shift',
    status: 'maintenance',
    location: 'Satara',
    next: 'License renewal',
    owner: 'Imran P',
    utilization: 35,
    revenueMtd: 5500,
    bookingsCount: 5,
    outstanding: 1100,
    collected: 4400,
    lastActive: 'Sunday, 10 July 2024 · 09:15',
    statusNote: 'Docs pending',
    accent: 'bg-[#6B7280]',
    jobs: [
      { label: 'Trailer haul', qty: 1, price: 1100 },
      { label: 'Manure carting', qty: 1, price: 900 },
    ],
  },
  {
    id: 'D-306',
    name: 'Lakshmi Rao',
    role: 'Cold-chain driver',
    meta: 'Reefer · 2–8°C runs',
    rate: 1800,
    unit: 'day',
    status: 'inactive',
    location: 'Pune MIDC',
    next: 'Paused',
    owner: 'Lakshmi R',
    utilization: 0,
    revenueMtd: 0,
    bookingsCount: 0,
    outstanding: 0,
    collected: 0,
    lastActive: 'Friday, 08 July 2024 · 16:40',
    statusNote: 'Seasonal pause',
    accent: 'bg-[#4F6BED]',
    jobs: [
      { label: 'Cold store transfer', qty: 1, price: 1800 },
      { label: 'Packhouse pickup', qty: 1, price: 1600 },
      { label: 'Retail drop', qty: 2, price: 900 },
    ],
  },
]

const TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'available', label: 'Available' },
  { id: 'booked', label: 'On Trip' },
  { id: 'completed', label: 'Offline' },
]

function statusBadge(status: DriverStatus) {
  if (status === 'available') {
    return {
      label: 'Available',
      note: 'Ready for hire',
      Icon: CheckCircleIcon,
      className: 'bg-[color-mix(in_srgb,var(--cv-success)_16%,var(--cv-surface))] text-[var(--cv-success)]',
    }
  }
  if (status === 'booked') {
    return {
      label: 'On Trip',
      note: 'Assigned now',
      Icon: ClockIcon,
      className: 'bg-[color-mix(in_srgb,var(--cv-warning)_18%,var(--cv-surface))] text-[var(--cv-warning)]',
    }
  }
  if (status === 'maintenance') {
    return {
      label: 'Offline',
      note: 'Unavailable',
      Icon: PauseCircleIcon,
      className: 'bg-[var(--cv-elevated)] text-[var(--cv-muted)]',
    }
  }
  return {
    label: 'Offline',
    note: 'Not hiring',
    Icon: NoSymbolIcon,
    className: 'bg-[color-mix(in_srgb,var(--cv-info)_14%,var(--cv-surface))] text-[var(--cv-info)]',
  }
}

function matchesTab(status: DriverStatus, tab: string) {
  if (tab === 'all') return true
  if (tab === 'completed') return status === 'inactive' || status === 'maintenance'
  return status === tab
}

function initials(name: string) {
  return name
    .split(/\s+|·/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

function todayLabel() {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
}

interface Props {
  items: DriverCardItem[]
  onView: (id: string) => void
  onBook: (id: string) => void
  onAdd: () => void
}

export function DriversCardGrid({ items, onView, onBook, onAdd }: Props) {
  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return items.filter((item) => {
      if (!matchesTab(item.status, tab)) return false
      if (!query) return true
      return (
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.meta.toLowerCase().includes(query)
      )
    })
  }, [items, tab, q])

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-lg:hidden">
          <h1 className="text-[28px] font-bold leading-9 tracking-tight text-[var(--cv-text)] sm:text-[32px] sm:leading-10">
            Drivers
          </h1>
        </div>
        <p className="text-sm font-medium text-[var(--cv-muted)] sm:ml-auto">{todayLabel()}</p>
      </header>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Filter drivers by status"
        >
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={cn(
                  'cv-touch shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition',
                  active
                    ? 'bg-[var(--cv-nav-active-bg)] text-[var(--cv-nav-active-fg)]'
                    : 'bg-[var(--cv-elevated)] text-[var(--cv-muted)] hover:text-[var(--cv-text)]',
                )}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cv-touch flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--cv-border)] bg-[var(--cv-surface)] text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)]"
            aria-label="More filters"
          >
            <FunnelIcon className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <label className="relative min-w-0 flex-1 lg:w-72 lg:flex-none">
            <span className="sr-only">Search drivers</span>
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cv-muted)]" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search a name, trip, or etc"
              className="w-full rounded-full border border-[var(--cv-border)] bg-[var(--cv-surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--cv-text)] placeholder:text-[var(--cv-muted)] shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
            />
          </label>
          <button
            type="button"
            onClick={onAdd}
            className="cv-touch hidden shrink-0 rounded-full bg-[var(--cv-btn-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--cv-btn-text)] sm:inline-flex"
          >
            + Add Driver
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-surface)] px-6 py-16 text-center">
          <p className="text-base font-semibold text-[var(--cv-text)]">No drivers match</p>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">Try another tab or clear your search.</p>
          <button
            type="button"
            onClick={onAdd}
            className="cv-touch mt-4 inline-flex rounded-full bg-[var(--cv-btn-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--cv-btn-text)]"
          >
            + Add Driver
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((driver) => (
            <DriverCard
              key={driver.id}
              driver={driver}
              onView={() => onView(driver.id)}
              onBook={() => onBook(driver.id)}
            />
          ))}
        </div>
      )}

      <div className="sm:hidden">
        <button
          type="button"
          onClick={onAdd}
          className="cv-touch w-full rounded-full bg-[var(--cv-btn-bg)] px-4 py-3 text-sm font-semibold text-[var(--cv-btn-text)]"
        >
          + Add Driver
        </button>
      </div>
    </div>
  )
}

function DriverCard({
  driver,
  onView,
  onBook,
}: {
  driver: DriverCardItem
  onView: () => void
  onBook: () => void
}) {
  const badge = statusBadge(driver.status)
  const BadgeIcon = badge.Icon
  const visibleJobs = driver.jobs.slice(0, 3)
  const moreCount = Math.max(0, driver.jobs.length - visibleJobs.length)
  const total = driver.jobs.reduce((s, j) => s + j.price * j.qty, 0)

  return (
    <article className="cv-dashboard-panel flex flex-col p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white',
              driver.accent,
            )}
            aria-hidden
          >
            {initials(driver.name)}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-[var(--cv-text)]">{driver.name}</h2>
            <p className="mt-0.5 truncate text-sm text-[var(--cv-muted)]">
              #{driver.id.replace(/^D-/, '')} / {driver.role}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
              badge.className,
            )}
          >
            <BadgeIcon className="h-3.5 w-3.5" strokeWidth={2} />
            {badge.label}
          </span>
          <p className="mt-1 text-[11px] font-medium text-[var(--cv-muted)]">{driver.statusNote}</p>
        </div>
      </div>

      <p className="mt-4 text-xs font-medium text-[var(--cv-muted)]">{driver.lastActive}</p>

      <div className="mt-3 min-h-[7.5rem] flex-1">
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 border-b border-[var(--cv-border)] pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--cv-muted)]">
          <span>Trip / skill</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Rate</span>
        </div>
        <ul className="mt-1.5 space-y-1.5">
          {visibleJobs.map((job) => (
            <li
              key={job.label}
              className="grid grid-cols-[1fr_auto_auto] gap-x-3 text-sm text-[var(--cv-text)]"
            >
              <span className="truncate">{job.label}</span>
              <span className="w-8 text-right text-[var(--cv-muted)]">{job.qty}</span>
              <span className="w-16 text-right font-medium">{formatCurrency(job.price)}</span>
            </li>
          ))}
        </ul>
        {moreCount > 0 ? (
          <p className="mt-2 text-sm font-medium text-[var(--cv-primary)]">+{moreCount} more</p>
        ) : (
          <p className="mt-2 text-sm text-transparent select-none" aria-hidden>
            &nbsp;
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[var(--cv-border)] pt-3">
        <span className="text-sm font-medium text-[var(--cv-muted)]">Total</span>
        <span className="text-base font-bold text-[var(--cv-text)]">{formatCurrency(total)}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onView}
          className="cv-touch rounded-xl bg-[var(--cv-elevated)] px-3 py-2.5 text-sm font-semibold text-[var(--cv-text)] transition hover:opacity-90"
        >
          See Details
        </button>
        <button
          type="button"
          onClick={onBook}
          disabled={driver.status === 'inactive' || driver.status === 'maintenance'}
          className="cv-touch rounded-xl bg-[var(--cv-btn-bg)] px-3 py-2.5 text-sm font-semibold text-[var(--cv-btn-text)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {driver.status === 'booked' ? 'Track Trip' : 'Book Driver'}
        </button>
      </div>
    </article>
  )
}
