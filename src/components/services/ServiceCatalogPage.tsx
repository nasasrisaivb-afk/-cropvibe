import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'
import { PageHeader } from '../common/PageHeader'
import { Select } from '../common/Select'
import { formatCurrency } from '../../utils/format'

export type ServiceCategory = 'consultancy' | 'testing' | 'repair' | 'aerial' | 'irrigation'

type ServiceStatus = 'open' | 'booked' | 'paused'

interface ServiceItem {
  id: string
  name: string
  meta: string
  rate: number
  unit: string
  status: ServiceStatus
  location: string
}

const DATA: Record<ServiceCategory, ServiceItem[]> = {
  consultancy: [
    { id: 'S-101', name: 'Farm consultancy · crop planning', meta: '1:1 advisory', rate: 2500, unit: 'session', status: 'open', location: 'Pune' },
    { id: 'S-102', name: 'Soil health advisory', meta: 'Lab analysis + plan', rate: 4200, unit: 'session', status: 'booked', location: 'Nashik' },
  ],
  testing: [
    { id: 'T-201', name: 'Soil testing pack', meta: 'NPK + moisture', rate: 1800, unit: 'sample', status: 'open', location: 'Ahmednagar' },
    { id: 'T-202', name: 'Water quality check', meta: 'pH + EC + TDS', rate: 1200, unit: 'sample', status: 'paused', location: 'Satara' },
  ],
  repair: [
    { id: 'R-301', name: 'Irrigation pump repair', meta: 'On-site diagnostics', rate: 3000, unit: 'visit', status: 'open', location: 'Kolhapur' },
    { id: 'R-302', name: 'Sprayer maintenance', meta: 'Annual service', rate: 4500, unit: 'visit', status: 'booked', location: 'Pune' },
  ],
  aerial: [
    { id: 'A-401', name: 'Drone spraying slot', meta: '5 acre minimum', rate: 6500, unit: 'acre', status: 'open', location: 'Baramati' },
    { id: 'A-402', name: 'Crop imaging survey', meta: 'NDVI mapping', rate: 2800, unit: 'plot', status: 'booked', location: 'Solapur' },
  ],
  irrigation: [
    { id: 'I-501', name: 'Drip layout setup', meta: 'Design + install', rate: 9000, unit: 'plot', status: 'open', location: 'Bangalore' },
    { id: 'I-502', name: 'Pump installation', meta: 'Submersible systems', rate: 15000, unit: 'unit', status: 'open', location: 'Mysuru' },
  ],
}

const TITLES: Record<ServiceCategory, { title: string; description: string }> = {
  consultancy: { title: 'Consultancy', description: 'Advisory services for crop planning and farm operations.' },
  testing: { title: 'Testing', description: 'Soil, water, and crop testing packages.' },
  repair: { title: 'Repair', description: 'On-site maintenance and repair services for farm equipment.' },
  aerial: { title: 'Aerial', description: 'Drone-based spraying and scouting services.' },
  irrigation: { title: 'Irrigation', description: 'Installation and setup services for irrigation systems.' },
}

function statusBadge(status: ServiceStatus) {
  if (status === 'open') return 'active'
  if (status === 'booked') return 'accepted'
  return 'pending'
}

interface Props {
  category: ServiceCategory
}

export function ServiceCatalogPage({ category }: Props) {
  const navigate = useNavigate()
  const copy = TITLES[category]
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')

  const items = useMemo(() => {
    return DATA[category].filter((item) => {
      const matchQ = !q || item.name.toLowerCase().includes(q.toLowerCase()) || item.id.toLowerCase().includes(q.toLowerCase())
      const matchS = status === 'all' || item.status === status
      return matchQ && matchS
    })
  }, [category, q, status])

  return (
    <div className="space-y-6">
      <PageHeader
        title={copy.title}
        subtitle={copy.description}
        actions={<Button onClick={() => navigate('/dashboard/create')}>+ Add service slot</Button>}
      />

      <div className="flex flex-col gap-3 rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4 sm:flex-row sm:items-end">
        <FormInput label="Search" placeholder="Service name or ID" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'open', label: 'Open' },
            { value: 'booked', label: 'Booked' },
            { value: 'paused', label: 'Paused' },
          ]}
        />
      </div>

      {items.length === 0 ? (
        <Card className="!rounded-[12px] py-12 text-center">
          <p className="text-lg font-semibold">No services match</p>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">Try a different filter or add a new offer.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/orders')}>Appointments</Button>
                <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/calendar')}>Calendar</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
