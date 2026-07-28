import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, type BadgeStatus } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'
import { Select } from '../common/Select'
import { formatCurrency } from '../../utils/format'

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
}

const DATA: Record<RentalCategory, RentalItem[]> = {
  machinery: [
    { id: 'M-101', name: 'Mahindra 575 DI Tractor', meta: '45 HP · 2019', rate: 2500, unit: 'day', status: 'available', location: 'Pune', next: 'Ready now' },
    { id: 'M-102', name: 'Sonalika DI 750 III', meta: '50 HP · 2021', rate: 2800, unit: 'day', status: 'booked', location: 'Pune', next: 'Return today 5 PM' },
    { id: 'M-103', name: 'John Deere Harvester W70', meta: 'Grain · 2020', rate: 8500, unit: 'day', status: 'booked', location: 'Nashik', next: 'Return in 3 days' },
    { id: 'M-104', name: 'Rotavator 7 ft', meta: 'Implement', rate: 1800, unit: 'day', status: 'available', location: 'Pune', next: 'Ready' },
    { id: 'M-105', name: 'Boom Sprayer 400L', meta: 'Tractor-mounted', rate: 900, unit: 'day', status: 'maintenance', location: 'Pune', next: 'Service due tomorrow' },
    { id: 'M-106', name: 'Power Tiller VST', meta: '12 HP', rate: 1200, unit: 'day', status: 'available', location: 'Satara', next: 'Ready' },
  ],
  labours: [
    { id: 'L-201', name: 'Harvest crew · 8 workers', meta: 'Paddy / wheat', rate: 4500, unit: 'day', status: 'available', location: 'Kolhapur', next: 'Bookable this week' },
    { id: 'L-202', name: 'Transplanting team · 12', meta: 'Rice nursery', rate: 6200, unit: 'day', status: 'booked', location: 'Sangli', next: 'Busy till Fri' },
    { id: 'L-203', name: 'Weeding squad · 6', meta: 'Vegetable plots', rate: 2800, unit: 'day', status: 'available', location: 'Pune', next: 'Ready' },
    { id: 'L-204', name: 'Packing helpers · 4', meta: 'Cold-chain packing', rate: 2200, unit: 'day', status: 'inactive', location: 'Nashik', next: 'Paused' },
  ],
  drivers: [
    { id: 'D-301', name: 'Tractor operator · Ramesh', meta: '8 yrs exp · Hindi/Marathi', rate: 800, unit: 'shift', status: 'available', location: 'Pune', next: 'Available today' },
    { id: 'D-302', name: 'Harvester driver · Suresh', meta: 'Licensed · nights OK', rate: 1200, unit: 'shift', status: 'booked', location: 'Ahmednagar', next: 'On job till Wed' },
    { id: 'D-303', name: 'Transport driver · HMV', meta: 'Pickup truck / tempo', rate: 1500, unit: 'day', status: 'available', location: 'Pune', next: 'Ready' },
  ],
  land: [
    { id: 'LD-401', name: '2.5 acre irrigated plot', meta: 'Black soil · drip ready', rate: 18000, unit: 'season', status: 'available', location: 'Baramati', next: 'Kharif open' },
    { id: 'LD-402', name: '1 acre polyhouse block', meta: 'Shade net · borewell', rate: 35000, unit: 'season', status: 'booked', location: 'Nashik', next: 'Leased till Oct' },
    { id: 'LD-403', name: '4 acre dryland parcel', meta: 'Sorghum / pulses', rate: 12000, unit: 'season', status: 'available', location: 'Solapur', next: 'Ready' },
  ],
  warehouses: [
    { id: 'W-501', name: 'Cold store bay A', meta: '50 MT · 2–8°C', rate: 8, unit: 'kg/month', status: 'available', location: 'Pune MIDC', next: '32 MT free' },
    { id: 'W-502', name: 'Grain silo unit 3', meta: '100 MT dry', rate: 3, unit: 'kg/month', status: 'booked', location: 'Latur', next: 'Full till Aug' },
    { id: 'W-503', name: 'Ambient godown', meta: '2000 sq ft · pest-controlled', rate: 25, unit: 'sqft/month', status: 'available', location: 'Nashik', next: '1200 sq ft free' },
    { id: 'W-504', name: 'Packhouse dock', meta: 'Sorting + staging', rate: 4500, unit: 'day', status: 'maintenance', location: 'Pune', next: 'Floor repair' },
  ],
}

const TITLES: Record<RentalCategory, { title: string; description: string; cta: string }> = {
  machinery: {
    title: 'Machinery',
    description: 'Tractors, harvesters, and implements with live availability.',
    cta: '+ Add Machinery',
  },
  labours: {
    title: 'Labours',
    description: 'Field crews and seasonal labour packages for hire.',
    cta: '+ Add Labour Listing',
  },
  drivers: {
    title: 'Drivers',
    description: 'Operators and transport drivers for equipment and haulage.',
    cta: '+ Add Driver Service',
  },
  land: {
    title: 'Land',
    description: 'Agricultural parcels listed for seasonal or annual lease.',
    cta: '+ Add Land Listing',
  },
  warehouses: {
    title: 'Warehouses',
    description: 'Cold storage, silos, and godown capacity you can rent out.',
    cta: '+ Add Warehouse',
  },
}

function statusBadge(status: ItemStatus): BadgeStatus {
  if (status === 'available') return 'active'
  if (status === 'booked') return 'accepted'
  if (status === 'maintenance') return 'pending'
  return 'inactive'
}

interface Props {
  category: RentalCategory
}

export function RentalInventoryPage({ category }: Props) {
  const navigate = useNavigate()
  const copy = TITLES[category]
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const items = useMemo(() => {
    return DATA[category].filter((item) => {
      const matchQ =
        !q ||
        item.name.toLowerCase().includes(q.toLowerCase()) ||
        item.id.toLowerCase().includes(q.toLowerCase()) ||
        item.location.toLowerCase().includes(q.toLowerCase())
      const matchS = status === 'all' || item.status === status
      return matchQ && matchS
    })
  }, [category, q, status])

  const counts = useMemo(() => {
    const all = DATA[category]
    return {
      total: all.length,
      available: all.filter((i) => i.status === 'available').length,
      booked: all.filter((i) => i.status === 'booked').length,
    }
  }, [category])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{copy.title}</h1>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">{copy.description}</p>
        </div>
        <Button onClick={() => navigate('/dashboard/create')}>{copy.cta}</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="!rounded-[12px]">
          <p className="text-xs uppercase tracking-wide text-[var(--cv-muted)]">Total listings</p>
          <p className="mt-1 text-2xl font-bold">{counts.total}</p>
        </Card>
        <Card className="!rounded-[12px]">
          <p className="text-xs uppercase tracking-wide text-[var(--cv-muted)]">Available</p>
          <p className="mt-1 text-2xl font-bold text-[var(--cv-primary)]">{counts.available}</p>
        </Card>
        <Card className="!rounded-[12px]">
          <p className="text-xs uppercase tracking-wide text-[var(--cv-muted)]">Currently booked</p>
          <p className="mt-1 text-2xl font-bold text-[var(--cv-info)]">{counts.booked}</p>
        </Card>
      </div>

      <div className="flex flex-col gap-3 rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4 sm:flex-row sm:items-end">
        <FormInput
          label="Search"
          placeholder="Name, ID, or location"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'available', label: 'Available' },
            { value: 'booked', label: 'Booked' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
        <div className="flex gap-2 pb-1">
          <Button size="sm" variant={view === 'grid' ? 'primary' : 'secondary'} onClick={() => setView('grid')}>
            Grid
          </Button>
          <Button size="sm" variant={view === 'list' ? 'primary' : 'secondary'} onClick={() => setView('list')}>
            List
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="!rounded-[12px] py-12 text-center">
          <p className="text-lg font-semibold">No listings match</p>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">Try clearing filters or add a new listing.</p>
          <Button className="mt-4" onClick={() => navigate('/dashboard/create')}>
            {copy.cta}
          </Button>
        </Card>
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="!rounded-[12px]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-[var(--cv-muted)]">{item.id}</p>
                  <h3 className="mt-1 font-semibold text-[var(--cv-text)]">{item.name}</h3>
                  <p className="mt-1 text-sm text-[var(--cv-muted)]">{item.meta}</p>
                </div>
                <Badge status={statusBadge(item.status)} />
              </div>
              <p className="mt-3 text-sm text-[var(--cv-muted)]">{item.location}</p>
              <p className="mt-1 text-lg font-bold text-[var(--cv-primary)]">
                {formatCurrency(item.rate)}
                <span className="text-sm font-medium text-[var(--cv-muted)]"> / {item.unit}</span>
              </p>
              {item.next ? <p className="mt-1 text-xs text-[var(--cv-muted)]">{item.next}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/calendar')}>
                  Availability
                </Button>
                <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/create')}>
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="!rounded-[12px] !p-0 overflow-hidden">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--cv-border)] text-xs uppercase tracking-wide text-[var(--cv-muted)]">
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Rate</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Next</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--cv-border)] last:border-0 hover:bg-[var(--cv-elevated)]">
                    <td className="px-5 py-3.5 font-semibold">{item.id}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-[var(--cv-muted)]">{item.meta}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--cv-muted)]">{item.location}</td>
                    <td className="px-5 py-3.5 font-medium">
                      {formatCurrency(item.rate)}/{item.unit}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={statusBadge(item.status)} />
                    </td>
                    <td className="px-5 py-3.5 text-[var(--cv-muted)]">{item.next ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/calendar')}>
                        Calendar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-2 p-4 md:hidden">
            {items.map((item) => (
              <div key={item.id} className="rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-elevated)] p-3">
                <div className="flex justify-between gap-2">
                  <span className="font-semibold">{item.name}</span>
                  <Badge status={statusBadge(item.status)} />
                </div>
                <p className="mt-1 text-sm text-[var(--cv-muted)]">
                  {item.id} · {formatCurrency(item.rate)}/{item.unit}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
