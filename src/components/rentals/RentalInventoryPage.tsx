import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import {
  ExportButton,
  FilterSelect,
  PrimaryActionButton,
  StatusPill,
  type StatusTone,
} from '../common/DataOverview'
import { DRIVER_CARDS, DriversCardGrid, type DriverCardItem } from './DriversCardGrid'
import { cn, formatCurrency } from '../../utils/format'

export type RentalCategory = 'machinery' | 'labours' | 'drivers' | 'land' | 'warehouses'

type ItemStatus = 'available' | 'booked' | 'maintenance' | 'inactive'

interface RentalItem {
  id: string
  name: string
  meta: string
  rate: number
  unit: string
  status: ItemStatus
  location: string
  next?: string
  owner?: string
  year?: string
  utilization?: number
  revenueMtd?: number
  bookingsCount?: number
  outstanding?: number
  collected?: number
}

interface BookingRow {
  id: string
  date: string
  renter: string
  type: string
  operator: string
  status: 'confirmed' | 'in_use' | 'completed' | 'cancelled' | 'pending'
  charges: number
}

interface PaymentRow {
  id: string
  date: string
  bookingId: string
  status: 'paid' | 'pending' | 'failed'
  method: string
  paidBy: string
  amount: number
  adjustment: number
}

function driverCardToRentalItem(d: DriverCardItem): RentalItem {
  return {
    id: d.id,
    name: d.name,
    meta: `${d.role} · ${d.meta}`,
    rate: d.rate,
    unit: d.unit,
    status: d.status,
    location: d.location,
    next: d.next,
    owner: d.owner,
    year: d.year,
    utilization: d.utilization,
    revenueMtd: d.revenueMtd,
    bookingsCount: d.bookingsCount,
    outstanding: d.outstanding,
    collected: d.collected,
  }
}

const DATA: Record<RentalCategory, RentalItem[]> = {
  machinery: [
    {
      id: 'M-101',
      name: 'Mahindra 575 DI Tractor',
      meta: '45 HP · 2019',
      rate: 2500,
      unit: 'day',
      status: 'available',
      location: 'Pune',
      next: 'Ready now',
      owner: 'Harish Kumar',
      year: '2019',
      utilization: 72,
      revenueMtd: 34500,
      bookingsCount: 14,
      outstanding: 5000,
      collected: 29500,
    },
    {
      id: 'M-102',
      name: 'Sonalika DI 750 III',
      meta: '50 HP · 2021',
      rate: 2800,
      unit: 'day',
      status: 'booked',
      location: 'Pune',
      next: 'Return today 5 PM',
      owner: 'Harish Kumar',
      year: '2021',
      utilization: 88,
      revenueMtd: 42000,
      bookingsCount: 18,
      outstanding: 8400,
      collected: 33600,
    },
    {
      id: 'M-103',
      name: 'John Deere Harvester W70',
      meta: 'Grain · 2020',
      rate: 8500,
      unit: 'day',
      status: 'booked',
      location: 'Nashik',
      next: 'Return in 3 days',
      owner: 'Priya Reddy',
      year: '2020',
      utilization: 65,
      revenueMtd: 68000,
      bookingsCount: 9,
      outstanding: 17000,
      collected: 51000,
    },
    {
      id: 'M-104',
      name: 'Rotavator 7 ft',
      meta: 'Implement',
      rate: 1800,
      unit: 'day',
      status: 'available',
      location: 'Pune',
      next: 'Ready',
      owner: 'Harish Kumar',
      year: '2018',
      utilization: 54,
      revenueMtd: 12600,
      bookingsCount: 7,
      outstanding: 1800,
      collected: 10800,
    },
    {
      id: 'M-105',
      name: 'Boom Sprayer 400L',
      meta: 'Tractor-mounted',
      rate: 900,
      unit: 'day',
      status: 'maintenance',
      location: 'Pune',
      next: 'Service due tomorrow',
      owner: 'Suresh Patil',
      year: '2022',
      utilization: 40,
      revenueMtd: 5400,
      bookingsCount: 6,
      outstanding: 900,
      collected: 4500,
    },
    {
      id: 'M-106',
      name: 'Power Tiller VST',
      meta: '12 HP',
      rate: 1200,
      unit: 'day',
      status: 'available',
      location: 'Satara',
      next: 'Ready',
      owner: 'Ananya Desai',
      year: '2020',
      utilization: 61,
      revenueMtd: 9600,
      bookingsCount: 8,
      outstanding: 2400,
      collected: 7200,
    },
  ],
  labours: [
    { id: 'L-201', name: 'Harvest crew · 8 workers', meta: 'Paddy / wheat', rate: 4500, unit: 'day', status: 'available', location: 'Kolhapur', next: 'Bookable this week', owner: 'Crew lead · Ravi', utilization: 70, revenueMtd: 27000, bookingsCount: 6, outstanding: 4500, collected: 22500 },
    { id: 'L-202', name: 'Transplanting team · 12', meta: 'Rice nursery', rate: 6200, unit: 'day', status: 'booked', location: 'Sangli', next: 'Busy till Fri', owner: 'Crew lead · Meena', utilization: 85, revenueMtd: 37200, bookingsCount: 6, outstanding: 6200, collected: 31000 },
    { id: 'L-203', name: 'Weeding squad · 6', meta: 'Vegetable plots', rate: 2800, unit: 'day', status: 'available', location: 'Pune', next: 'Ready', owner: 'Crew lead · Ajay', utilization: 55, revenueMtd: 14000, bookingsCount: 5, outstanding: 0, collected: 14000 },
    { id: 'L-204', name: 'Packing helpers · 4', meta: 'Cold-chain packing', rate: 2200, unit: 'day', status: 'inactive', location: 'Nashik', next: 'Paused', owner: 'Crew lead · Neha', utilization: 0, revenueMtd: 0, bookingsCount: 0, outstanding: 0, collected: 0 },
  ],
  drivers: DRIVER_CARDS.map(driverCardToRentalItem),
  land: [
    { id: 'LD-401', name: '2.5 acre irrigated plot', meta: 'Black soil · drip ready', rate: 18000, unit: 'season', status: 'available', location: 'Baramati', next: 'Kharif open', owner: 'Land trust', utilization: 45, revenueMtd: 18000, bookingsCount: 1, outstanding: 0, collected: 18000 },
    { id: 'LD-402', name: '1 acre polyhouse block', meta: 'Shade net · borewell', rate: 35000, unit: 'season', status: 'booked', location: 'Nashik', next: 'Leased till Oct', owner: 'AgroWorks', utilization: 100, revenueMtd: 35000, bookingsCount: 1, outstanding: 10000, collected: 25000 },
    { id: 'LD-403', name: '4 acre dryland parcel', meta: 'Sorghum / pulses', rate: 12000, unit: 'season', status: 'available', location: 'Solapur', next: 'Ready', owner: 'Farmer co-op', utilization: 30, revenueMtd: 12000, bookingsCount: 1, outstanding: 0, collected: 12000 },
  ],
  warehouses: [
    { id: 'W-501', name: 'Cold store bay A', meta: '50 MT · 2–8°C', rate: 8, unit: 'kg/month', status: 'available', location: 'Pune MIDC', next: '32 MT free', owner: 'ColdChain MH', utilization: 64, revenueMtd: 22000, bookingsCount: 4, outstanding: 4000, collected: 18000 },
    { id: 'W-502', name: 'Grain silo unit 3', meta: '100 MT dry', rate: 3, unit: 'kg/month', status: 'booked', location: 'Latur', next: 'Full till Aug', owner: 'GrainCare', utilization: 100, revenueMtd: 30000, bookingsCount: 2, outstanding: 9000, collected: 21000 },
    { id: 'W-503', name: 'Ambient godown', meta: '2000 sq ft · pest-controlled', rate: 25, unit: 'sqft/month', status: 'available', location: 'Nashik', next: '1200 sq ft free', owner: 'StoreLink', utilization: 40, revenueMtd: 15000, bookingsCount: 3, outstanding: 2500, collected: 12500 },
    { id: 'W-504', name: 'Packhouse dock', meta: 'Sorting + staging', rate: 4500, unit: 'day', status: 'maintenance', location: 'Pune', next: 'Floor repair', owner: 'PackPro', utilization: 20, revenueMtd: 9000, bookingsCount: 2, outstanding: 4500, collected: 4500 },
  ],
}

const BOOKINGS: Record<string, BookingRow[]> = {
  'M-101': [
    { id: 'BK-8821', date: '12 Jul 2024', renter: 'Priya R', type: 'Daily hire', operator: 'Ramesh', status: 'confirmed', charges: 7500 },
    { id: 'BK-8790', date: '05 Jul 2024', renter: 'AgroWorks', type: 'Multi-day', operator: 'Suresh', status: 'completed', charges: 12500 },
    { id: 'BK-8712', date: '28 Jun 2024', renter: 'Mohit S', type: 'Daily hire', operator: 'Ramesh', status: 'completed', charges: 5000 },
    { id: 'BK-8655', date: '20 Jun 2024', renter: 'FieldCo', type: 'Seasonal', operator: 'Self', status: 'cancelled', charges: 0 },
    { id: 'BK-8601', date: '12 Jun 2024', renter: 'Divya M', type: 'Daily hire', operator: 'Ramesh', status: 'pending', charges: 2500 },
  ],
}

const PAYMENTS: Record<string, PaymentRow[]> = {
  'M-101': [
    { id: 'PAY-441', date: '12 Jul 2024', bookingId: 'BK-8821', status: 'pending', method: 'UPI', paidBy: 'Priya R', amount: 7500, adjustment: 0 },
    { id: 'PAY-428', date: '06 Jul 2024', bookingId: 'BK-8790', status: 'paid', method: 'Bank', paidBy: 'AgroWorks', amount: 12000, adjustment: 500 },
    { id: 'PAY-401', date: '29 Jun 2024', bookingId: 'BK-8712', status: 'paid', method: 'Wallet', paidBy: 'Mohit S', amount: 5000, adjustment: 0 },
    { id: 'PAY-388', date: '21 Jun 2024', bookingId: 'BK-8655', status: 'failed', method: 'UPI', paidBy: 'FieldCo', amount: 2500, adjustment: 0 },
  ],
}

const TITLES: Record<RentalCategory, { title: string; description: string; cta: string; noun: string }> = {
  machinery: {
    title: 'Machinery',
    description: 'Tractors, harvesters, and implements with live availability.',
    cta: '+ Add Machinery',
    noun: 'machine',
  },
  labours: {
    title: 'Labours',
    description: 'Field crews and seasonal labour packages for hire.',
    cta: '+ Add Labour Listing',
    noun: 'crew',
  },
  drivers: {
    title: 'Drivers',
    description: 'Operators and transport drivers for equipment and haulage.',
    cta: '+ Add Driver Service',
    noun: 'driver',
  },
  land: {
    title: 'Land',
    description: 'Agricultural parcels listed for seasonal or annual lease.',
    cta: '+ Add Land Listing',
    noun: 'parcel',
  },
  warehouses: {
    title: 'Warehouses',
    description: 'Cold storage, silos, and godown capacity you can rent out.',
    cta: '+ Add Warehouse',
    noun: 'space',
  },
}

const STATUS_LABEL: Record<ItemStatus, string> = {
  available: 'Available',
  booked: 'Booked',
  maintenance: 'Maintenance',
  inactive: 'Inactive',
}

const STATUS_TONE: Record<ItemStatus, StatusTone> = {
  available: 'success',
  booked: 'info',
  maintenance: 'warning',
  inactive: 'neutral',
}

const BOOKING_TONE: Record<BookingRow['status'], StatusTone> = {
  confirmed: 'info',
  in_use: 'primary',
  completed: 'success',
  cancelled: 'danger',
  pending: 'warning',
}

const PAY_TONE: Record<PaymentRow['status'], StatusTone> = {
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
}

const PAGE_SIZE = 6

interface Props {
  category: RentalCategory
}

function initials(name: string) {
  return name
    .split(/\s+|·/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

function defaultBookings(item: RentalItem): BookingRow[] {
  return [
    {
      id: `BK-${item.id}-1`,
      date: '10 Jul 2024',
      renter: 'Local buyer',
      type: 'Daily hire',
      operator: item.owner ?? 'Assigned',
      status: item.status === 'booked' ? 'in_use' : 'confirmed',
      charges: item.rate * 2,
    },
    {
      id: `BK-${item.id}-2`,
      date: '02 Jul 2024',
      renter: 'Farm co-op',
      type: 'Multi-day',
      operator: 'Self',
      status: 'completed',
      charges: item.rate * 4,
    },
    {
      id: `BK-${item.id}-3`,
      date: '20 Jun 2024',
      renter: 'Seasonal hire',
      type: 'Daily hire',
      operator: item.owner ?? 'Assigned',
      status: 'pending',
      charges: item.rate,
    },
  ]
}

function defaultPayments(item: RentalItem): PaymentRow[] {
  return [
    {
      id: `PAY-${item.id}-1`,
      date: '10 Jul 2024',
      bookingId: `BK-${item.id}-1`,
      status: item.outstanding && item.outstanding > 0 ? 'pending' : 'paid',
      method: 'UPI',
      paidBy: 'Local buyer',
      amount: item.rate * 2,
      adjustment: 0,
    },
    {
      id: `PAY-${item.id}-2`,
      date: '03 Jul 2024',
      bookingId: `BK-${item.id}-2`,
      status: 'paid',
      method: 'Bank',
      paidBy: 'Farm co-op',
      amount: item.rate * 4,
      adjustment: 200,
    },
  ]
}

function MetricCard({
  value,
  label,
  tone,
}: {
  value: string
  label: string
  tone: 'blue' | 'rose' | 'amber' | 'teal'
}) {
  const tones = {
    blue: 'border-[color-mix(in_srgb,var(--cv-info)_28%,var(--cv-border))] bg-[color-mix(in_srgb,var(--cv-info)_12%,var(--cv-surface))] text-[var(--cv-text)]',
    rose: 'border-[color-mix(in_srgb,var(--cv-danger)_28%,var(--cv-border))] bg-[color-mix(in_srgb,var(--cv-danger)_10%,var(--cv-surface))] text-[var(--cv-text)]',
    amber: 'border-[color-mix(in_srgb,var(--cv-warning)_30%,var(--cv-border))] bg-[color-mix(in_srgb,var(--cv-warning)_12%,var(--cv-surface))] text-[var(--cv-text)]',
    teal: 'border-[color-mix(in_srgb,var(--cv-success)_28%,var(--cv-border))] bg-[color-mix(in_srgb,var(--cv-success)_12%,var(--cv-surface))] text-[var(--cv-text)]',
  }
  return (
    <div className={cn('rounded-xl border px-3 py-3 sm:px-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]', tones[tone])}>
      <p className="truncate text-lg font-bold tracking-tight sm:text-xl">{value}</p>
      <p className="mt-1 text-[11px] font-medium text-[var(--cv-muted)] sm:text-xs">{label}</p>
    </div>
  )
}

function SoftSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="relative inline-flex min-w-0 flex-1 sm:flex-none">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-[var(--cv-border)] bg-[var(--cv-surface)] py-2 pl-3 pr-8 text-xs font-medium text-[var(--cv-text)] sm:w-auto sm:py-1.5"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--cv-muted)]">
        ▾
      </span>
    </label>
  )
}

function ItemPreview({
  item,
  categoryLabel,
  onBack,
  onEdit,
  onBook,
}: {
  item: RentalItem
  categoryLabel: string
  onBack: () => void
  onEdit: () => void
  onBook: () => void
}) {
  const [bookingStatus, setBookingStatus] = useState('all')
  const [payStatus, setPayStatus] = useState('all')

  const bookings = (BOOKINGS[item.id] ?? defaultBookings(item)).filter(
    (b) => bookingStatus === 'all' || b.status === bookingStatus,
  )
  const payments = (PAYMENTS[item.id] ?? defaultPayments(item)).filter(
    (p) => payStatus === 'all' || p.status === payStatus,
  )

  const overviewFields: { label: string; value: ReactNode }[] = [
    { label: 'Listing #', value: item.id },
    { label: 'Category', value: categoryLabel },
    { label: 'Status', value: <StatusPill tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</StatusPill> },
    { label: 'Owner', value: item.owner ?? '—' },
    { label: 'Location', value: item.location },
    { label: 'Specs', value: item.meta },
    { label: 'Year', value: item.year ?? '—' },
    { label: 'Rate', value: `${formatCurrency(item.rate)}/${item.unit}` },
    { label: 'Next slot', value: item.next ?? '—' },
    { label: 'Utilization', value: `${item.utilization ?? 0}%` },
  ]

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="cv-detail-sticky lg:static lg:m-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBack}
            className="cv-touch inline-flex items-center rounded-lg px-1 text-sm font-medium text-[var(--cv-muted)] hover:text-[var(--cv-text)]"
          >
            ← Back to {categoryLabel.toLowerCase()} list
          </button>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <ExportButton className="flex-1 sm:flex-none" onClick={() => undefined} />
            <div className="flex-1 sm:flex-none [&_button]:w-full">
              <PrimaryActionButton onClick={onEdit}>Edit listing</PrimaryActionButton>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-surface)] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="border-b border-[var(--cv-border)] px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--cv-primary-soft)] text-sm font-bold text-[var(--cv-primary)] sm:h-14 sm:w-14 sm:text-base">
                {initials(item.name)}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold leading-snug text-[var(--cv-text)] sm:text-lg">{item.name}</h2>
                <p className="mt-0.5 text-sm text-[var(--cv-muted)]">
                  {categoryLabel} · {item.location}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <button
                type="button"
                onClick={onBook}
                className="cv-touch rounded-lg border border-[var(--cv-primary)] px-3 py-2 text-sm font-semibold text-[var(--cv-primary)] hover:bg-[var(--cv-primary-soft)]"
              >
                New booking
              </button>
              <button
                type="button"
                onClick={onEdit}
                className="cv-touch rounded-lg bg-[var(--cv-btn-bg)] px-3 py-2 text-sm font-semibold text-[var(--cv-btn-text)] hover:opacity-90"
              >
                Update listing
              </button>
              <button
                type="button"
                className="cv-touch col-span-2 inline-flex items-center justify-center gap-1 rounded-lg border border-[var(--cv-border)] px-3 py-2 text-sm font-medium text-[var(--cv-text)] sm:col-span-1"
              >
                More
                <EllipsisVerticalIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="px-4 py-4 sm:px-5">
            <h3 className="text-sm font-semibold text-[var(--cv-text)]">Overview</h3>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 sm:gap-x-4">
              {overviewFields.map((f) => (
                <div key={f.label} className="min-w-0">
                  <dt className="text-[11px] font-medium text-[var(--cv-muted)]">{f.label}</dt>
                  <dd className="mt-0.5 break-words text-sm font-semibold text-[var(--cv-text)]">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="border-t border-[var(--cv-border)] px-4 py-4 sm:px-5">
            <h3 className="text-sm font-semibold text-[var(--cv-text)]">Performance snapshot</h3>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 sm:gap-x-4">
              <div>
                <dt className="text-[11px] text-[var(--cv-muted)]">Eligibility</dt>
                <dd className="mt-0.5">
                  <StatusPill tone={item.status === 'inactive' || item.status === 'maintenance' ? 'warning' : 'success'}>
                    {item.status === 'inactive' || item.status === 'maintenance' ? 'Hold' : 'Active'}
                  </StatusPill>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-[var(--cv-muted)]">Bookings MTD</dt>
                <dd className="mt-0.5 text-sm font-semibold">{item.bookingsCount ?? 0}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-[var(--cv-muted)]">Revenue MTD</dt>
                <dd className="mt-0.5 text-sm font-semibold">{formatCurrency(item.revenueMtd ?? 0)}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-[var(--cv-muted)]">Collected</dt>
                <dd className="mt-0.5 text-sm font-semibold">{formatCurrency(item.collected ?? 0)}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-[var(--cv-muted)]">Outstanding</dt>
                <dd className="mt-0.5 text-sm font-semibold">{formatCurrency(item.outstanding ?? 0)}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-[var(--cv-muted)]">Utilization</dt>
                <dd className="mt-0.5 text-sm font-semibold">{item.utilization ?? 0}%</dd>
              </div>
            </dl>
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          <div className="cv-metric-scroll lg:grid lg:grid-cols-4 lg:gap-3 lg:overflow-visible">
            <MetricCard tone="blue" value={formatCurrency(item.revenueMtd ?? 0)} label="Revenue this month" />
            <MetricCard tone="rose" value={formatCurrency(item.outstanding ?? 0)} label="Outstanding dues" />
            <MetricCard tone="amber" value={String(item.bookingsCount ?? 0)} label="Active / recent bookings" />
            <MetricCard tone="teal" value={formatCurrency(item.collected ?? 0)} label="Collected payments" />
          </div>

          <section className="overflow-hidden rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-surface)] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-3 border-b border-[var(--cv-border)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <h3 className="text-base font-semibold text-[var(--cv-text)]">Bookings</h3>
              <div className="flex flex-wrap gap-2">
                <SoftSelect label="By renter" value="all" onChange={() => undefined} options={[{ value: 'all', label: 'By renters' }]} />
                <SoftSelect
                  label="By status"
                  value={bookingStatus}
                  onChange={setBookingStatus}
                  options={[
                    { value: 'all', label: 'By status' },
                    { value: 'confirmed', label: 'Confirmed' },
                    { value: 'in_use', label: 'In use' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ]}
                />
              </div>
            </div>
            <div className="cv-responsive-table-wrap p-3 lg:overflow-x-auto lg:p-0">
              <table className="cv-responsive-table min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--cv-border)] bg-[var(--cv-elevated)]/40">
                    {['Date', 'Booking #', 'Renter', 'Type', 'Operator', 'Status', 'Charges', 'Action'].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--cv-muted)]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-[var(--cv-border)] last:border-0 lg:border-b">
                      <td data-label="Date" className="px-3 py-3 text-[var(--cv-muted)]">{b.date}</td>
                      <td data-label="Booking #" className="px-3 py-3 font-mono text-[13px]">{b.id}</td>
                      <td data-label="Renter" className="px-3 py-3 font-medium">{b.renter}</td>
                      <td data-label="Type" className="px-3 py-3 text-[var(--cv-muted)]">{b.type}</td>
                      <td data-label="Operator" className="px-3 py-3 text-[var(--cv-muted)]">{b.operator}</td>
                      <td data-label="Status" className="px-3 py-3">
                        <StatusPill tone={BOOKING_TONE[b.status]}>{b.status.replace('_', ' ')}</StatusPill>
                      </td>
                      <td data-label="Charges" className="px-3 py-3 font-semibold">{formatCurrency(b.charges)}</td>
                      <td data-label="Action" className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button type="button" className="cv-touch text-sm font-semibold text-[var(--cv-primary)] hover:underline">
                            View
                          </button>
                          <button type="button" className="cv-touch rounded p-1 text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)]" aria-label="More">
                            <EllipsisVerticalIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-surface)] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-3 border-b border-[var(--cv-border)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <h3 className="text-base font-semibold text-[var(--cv-text)]">Payment summary</h3>
              <div className="flex flex-wrap gap-2">
                <SoftSelect label="By booking" value="all" onChange={() => undefined} options={[{ value: 'all', label: 'By booking #' }]} />
                <SoftSelect
                  label="By method"
                  value="all"
                  onChange={() => undefined}
                  options={[
                    { value: 'all', label: 'By method' },
                    { value: 'upi', label: 'UPI' },
                    { value: 'bank', label: 'Bank' },
                  ]}
                />
                <SoftSelect
                  label="By status"
                  value={payStatus}
                  onChange={setPayStatus}
                  options={[
                    { value: 'all', label: 'By status' },
                    { value: 'paid', label: 'Paid' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'failed', label: 'Failed' },
                  ]}
                />
              </div>
            </div>
            <div className="cv-responsive-table-wrap p-3 lg:overflow-x-auto lg:p-0">
              <table className="cv-responsive-table min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--cv-border)] bg-[var(--cv-elevated)]/40">
                    {['Date', 'Booking #', 'Status', 'Method', 'Paid by', 'Amount', 'Adj.', 'Action'].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--cv-muted)]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--cv-border)] last:border-0">
                      <td data-label="Date" className="px-3 py-3 text-[var(--cv-muted)]">{p.date}</td>
                      <td data-label="Booking #" className="px-3 py-3 font-mono text-[13px]">{p.bookingId}</td>
                      <td data-label="Status" className="px-3 py-3">
                        <StatusPill tone={PAY_TONE[p.status]}>{p.status}</StatusPill>
                      </td>
                      <td data-label="Method" className="px-3 py-3 text-[var(--cv-muted)]">{p.method}</td>
                      <td data-label="Paid by" className="px-3 py-3">{p.paidBy}</td>
                      <td data-label="Amount" className="px-3 py-3 font-semibold">{formatCurrency(p.amount)}</td>
                      <td data-label="Adj." className="px-3 py-3 text-[var(--cv-muted)]">{formatCurrency(p.adjustment)}</td>
                      <td data-label="Action" className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            className="cv-touch inline-flex items-center gap-1 rounded-md border border-[var(--cv-border)] bg-[var(--cv-surface)] px-2 py-1.5 text-xs font-medium"
                          >
                            <PencilSquareIcon className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="cv-touch rounded-md p-1.5 text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)] hover:text-[var(--cv-danger)]"
                            aria-label="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export function RentalInventoryPage({ category }: Props) {
  const navigate = useNavigate()
  const copy = TITLES[category]
  const [statusFilter, setStatusFilter] = useState('all')
  const [q, setQ] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [previewId, setPreviewId] = useState<string | null>(null)

  const locations = useMemo(() => {
    const set = new Set(DATA[category].map((i) => i.location))
    return ['all', ...Array.from(set)]
  }, [category])

  const allItems = DATA[category]

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      const matchTab = statusFilter === 'all' || item.status === statusFilter
      const matchLoc = locationFilter === 'all' || item.location === locationFilter
      const query = q.trim().toLowerCase()
      const matchQ =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.meta.toLowerCase().includes(query)
      return matchTab && matchLoc && matchQ
    })
  }, [allItems, statusFilter, locationFilter, q])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  const previewItem = previewId ? allItems.find((i) => i.id === previewId) ?? null : null

  const summary = useMemo(() => {
    const revenue = allItems.reduce((s, i) => s + (i.revenueMtd ?? 0), 0)
    const outstanding = allItems.reduce((s, i) => s + (i.outstanding ?? 0), 0)
    const collected = allItems.reduce((s, i) => s + (i.collected ?? 0), 0)
    const available = allItems.filter((i) => i.status === 'available').length
    return { revenue, outstanding, collected, available, total: allItems.length }
  }, [allItems])

  if (previewItem) {
    return (
      <ItemPreview
        item={previewItem}
        categoryLabel={copy.title}
        onBack={() => setPreviewId(null)}
        onEdit={() => navigate('/dashboard/create')}
        onBook={() => navigate('/dashboard/calendar')}
      />
    )
  }

  if (category === 'drivers') {
    return (
      <DriversCardGrid
        items={DRIVER_CARDS}
        onView={(id) => setPreviewId(id)}
        onBook={() => navigate('/dashboard/calendar')}
        onAdd={() => navigate('/dashboard/create')}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Top search + actions — matches attached header pattern */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative min-w-0 flex-1 max-w-2xl">
          <span className="sr-only">Search</span>
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cv-muted)]" />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(0)
            }}
            placeholder={`Search by ${copy.noun}, ID, location…`}
            className="w-full rounded-xl border border-[var(--cv-border)] bg-[var(--cv-surface)] py-2.5 pl-10 pr-3 text-sm text-[var(--cv-text)] placeholder:text-[var(--cv-muted)] shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          />
        </label>
        <div className="flex items-center gap-2 max-lg:w-full">
          <button
            type="button"
            onClick={() => navigate('/dashboard/create')}
            className="cv-touch flex-1 rounded-xl border border-[var(--cv-border)] bg-[var(--cv-surface)] px-3.5 py-2 text-sm font-semibold text-[var(--cv-text)] shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:flex-none"
          >
            {copy.cta}
          </button>
          <button
            type="button"
            className="cv-touch flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--cv-btn-bg)] text-[var(--cv-btn-text)] shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
            aria-label="Quick insights"
          >
            <SparklesIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="hidden lg:block">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--cv-text)]">{copy.title} overview</h1>
        <p className="mt-1 text-sm text-[var(--cv-muted)]">{copy.description}</p>
      </div>

      <div className="cv-metric-scroll lg:grid lg:grid-cols-4 lg:gap-3 lg:overflow-visible">
        <MetricCard tone="blue" value={String(summary.total)} label={`Total ${copy.title.toLowerCase()}`} />
        <MetricCard tone="teal" value={String(summary.available)} label="Available now" />
        <MetricCard tone="amber" value={formatCurrency(summary.revenue)} label="Revenue MTD" />
        <MetricCard tone="rose" value={formatCurrency(summary.outstanding)} label="Outstanding dues" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-surface)] shadow-[0_1px_2px_rgba(15,23,42,0.04)] max-lg:border-0 max-lg:bg-transparent max-lg:shadow-none">
        <div className="flex flex-col gap-3 border-b border-[var(--cv-border)] px-3 py-3 sm:px-4 sm:flex-row sm:items-center sm:justify-between max-lg:mb-3 max-lg:rounded-2xl max-lg:border max-lg:bg-[var(--cv-surface)]">
          <h2 className="text-base font-semibold text-[var(--cv-text)]">{copy.title} listings</h2>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v)
                setPage(0)
              }}
              options={[
                { value: 'all', label: 'By status' },
                { value: 'available', label: 'Available' },
                { value: 'booked', label: 'Booked' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
            <FilterSelect
              label="Location"
              value={locationFilter}
              onChange={(v) => {
                setLocationFilter(v)
                setPage(0)
              }}
              options={locations.map((loc) => ({
                value: loc,
                label: loc === 'all' ? 'By location' : loc,
              }))}
            />
            <ExportButton onClick={() => undefined} />
          </div>
        </div>

        {pageItems.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <p className="text-base font-semibold text-[var(--cv-text)]">No listings match</p>
            <p className="mt-1 text-sm text-[var(--cv-muted)]">Try clearing filters or add a new listing.</p>
            <div className="mt-4 flex justify-center">
              <PrimaryActionButton onClick={() => navigate('/dashboard/create')}>
                {copy.cta}
              </PrimaryActionButton>
            </div>
          </div>
        ) : (
          <div className="cv-responsive-table-wrap lg:overflow-x-auto">
            <table className="cv-responsive-table min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--cv-border)] bg-[var(--cv-elevated)]/40">
                  {['Listing', 'ID', 'Location', 'Rate', 'Schedule', 'Status', 'Action'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--cv-muted)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--cv-border)] last:border-0 transition hover:bg-[var(--cv-elevated)]/50"
                  >
                    <td data-label="Listing" className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--cv-primary-soft)] text-xs font-bold text-[var(--cv-primary)]">
                          {initials(item.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--cv-text)]">{item.name}</p>
                          <p className="text-xs text-[var(--cv-muted)]">{item.meta}</p>
                        </div>
                      </div>
                    </td>
                    <td data-label="ID" className="px-4 py-3.5 font-mono text-[13px]">{item.id}</td>
                    <td data-label="Location" className="px-4 py-3.5 text-[var(--cv-muted)]">{item.location}</td>
                    <td data-label="Rate" className="px-4 py-3.5 font-semibold">
                      {formatCurrency(item.rate)}
                      <span className="font-medium text-[var(--cv-muted)]">/{item.unit}</span>
                    </td>
                    <td data-label="Schedule" className="px-4 py-3.5 text-[var(--cv-muted)]">{item.next ?? '—'}</td>
                    <td data-label="Status" className="px-4 py-3.5">
                      <StatusPill tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</StatusPill>
                    </td>
                    <td data-label="Action" className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="cv-touch text-sm font-semibold text-[var(--cv-primary)] hover:underline"
                          onClick={() => setPreviewId(item.id)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="cv-touch rounded p-1 text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)]"
                          aria-label="More actions"
                        >
                          <EllipsisVerticalIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-[var(--cv-border)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 max-lg:mt-3 max-lg:rounded-2xl max-lg:border max-lg:bg-[var(--cv-surface)]">
          <p className="text-sm text-[var(--cv-muted)]">
            {filtered.length} result{filtered.length === 1 ? '' : 's'}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              disabled={safePage <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="cv-touch rounded-lg border border-[var(--cv-border)] px-3.5 py-2 text-sm font-medium disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              className="cv-touch rounded-lg border border-[var(--cv-border)] px-3.5 py-2 text-sm font-medium disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
