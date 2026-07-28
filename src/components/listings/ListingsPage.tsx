import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LISTINGS_LABEL, PRIMARY_CTA } from '../../config/navigation'
import { useAppStore } from '../../store/appStore'
import type { Role } from '../../types/roles'
import { formatCurrency } from '../../utils/format'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'

const SELLER_PRODUCTS = [
  { name: 'Organic Tomatoes', stock: '45 kg', price: 45, status: 'active' as const, orders: 28 },
  { name: 'Fresh Potatoes', stock: '120 kg', price: 28, status: 'active' as const, orders: 19 },
  { name: 'Carrots', stock: '5 kg', price: 35, status: 'pending' as const, orders: 8 },
  { name: 'Lettuce', stock: '30 kg', price: 60, status: 'active' as const, orders: 12 },
]

const BUYER_SUPPLIERS = [
  { name: 'Green Valley', location: 'Nashik', rating: 4.8, product: 'Tomatoes', moq: '50 kg', price: 42, delivery: '1–2 days' },
  { name: 'Fresh Farm', location: 'Pune', rating: 4.6, product: 'Potatoes', moq: '100 kg', price: 26, delivery: 'Same day' },
  { name: 'Organic Roots', location: 'Hyderabad', rating: 4.9, product: 'Lettuce', moq: '20 kg', price: 55, delivery: '2 days' },
  { name: 'Sunrise Agro', location: 'Ahmedabad', rating: 4.5, product: 'Grains', moq: '200 kg', price: 32, delivery: '3 days' },
  { name: 'Deccan Organics', location: 'Solapur', rating: 4.7, product: 'Onions', moq: '80 kg', price: 22, delivery: '1 day' },
  { name: 'Konkan Fresh', location: 'Ratnagiri', rating: 4.4, product: 'Mangoes', moq: '40 kg', price: 90, delivery: '2–3 days' },
]

const RENTAL_EQUIPMENT = [
  { name: 'Tractor #1', status: 'Available', next: 'Ready now', rate: 2500 },
  { name: 'Tractor #2', status: 'Booked', next: 'Return today', rate: 2500 },
  { name: 'Harvester #1', status: 'Booked', next: 'Return in 3 days', rate: 4500 },
  { name: 'Rotavator #1', status: 'Available', next: 'Ready', rate: 1800 },
  { name: 'Sprayer #1', status: 'Available', next: 'Ready', rate: 800 },
  { name: 'Sprayer #2', status: 'Maintenance', next: 'Due tomorrow', rate: 800 },
]

const SERVICES = [
  { name: 'Farm Consultancy', bookings: 34, revenue: 123600, rating: 4.9 },
  { name: 'Soil Testing', bookings: 18, revenue: 78300, rating: 4.8 },
  { name: 'Equipment Repair', bookings: 12, revenue: 45200, rating: 4.7 },
  { name: 'Drone Spraying', bookings: 9, revenue: 32450, rating: 4.6 },
]

const COURSES = [
  { name: 'Organic Farming 101', students: 35, completion: 78, rating: 4.8 },
  { name: 'IPM Techniques', students: 24, completion: 65, rating: 4.5 },
  { name: 'Soil Health Mastery', students: 18, completion: 82, rating: 4.9 },
  { name: 'Crop Planning 101', students: 28, completion: 71, rating: 4.4 },
]

function PageHeader({ role }: { role: Role }) {
  const navigate = useNavigate()
  const cta = PRIMARY_CTA[role]
  const kycPending = useAppStore((s) => s.user?.kycStatus === 'pending')
  const locked = kycPending && role !== 'buyer'

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{LISTINGS_LABEL[role]}</h1>
        <p className="mt-1 text-sm text-[var(--cv-muted)]">
          Manage and discover offerings for your {role} workspace.
        </p>
      </div>
      <Button
        disabled={locked}
        onClick={() => navigate(cta.path)}
        title={locked ? 'KYC approval required' : undefined}
      >
        {cta.label}
      </Button>
    </div>
  )
}

export function ListingsPage() {
  const role = useAppStore((s) => s.user?.activeRole ?? 'seller')
  const navigate = useNavigate()
  const [buyerQuery, setBuyerQuery] = useState('')
  const [saved, setSaved] = useState<string[]>(['Organic Roots'])

  const suppliers = useMemo(
    () =>
      BUYER_SUPPLIERS.filter(
        (s) =>
          !buyerQuery ||
          s.name.toLowerCase().includes(buyerQuery.toLowerCase()) ||
          s.product.toLowerCase().includes(buyerQuery.toLowerCase()) ||
          s.location.toLowerCase().includes(buyerQuery.toLowerCase()),
      ),
    [buyerQuery],
  )

  if (role === 'seller') {
    return (
      <div>
        <PageHeader role={role} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SELLER_PRODUCTS.map((p) => (
            <Card key={p.name} className="!rounded-[12px]">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{p.name}</h3>
                <Badge status={p.status === 'active' ? 'active' : 'pending'} />
              </div>
              <p className="mt-2 text-sm text-[var(--cv-muted)]">Stock: {p.stock}</p>
              <p className="text-sm font-medium text-[var(--cv-primary)]">{formatCurrency(p.price)}/kg</p>
              <p className="text-xs text-[var(--cv-muted)]">{p.orders} orders</p>
              {p.stock === '5 kg' ? (
                <p className="mt-2 rounded-[10px] bg-[var(--cv-accent-soft)] px-2 py-1 text-xs text-[var(--cv-accent-muted)]">
                  Low stock — reorder level 20 kg
                </p>
              ) : null}
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/create')}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/orders')}>
                  Orders
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (role === 'buyer') {
    return (
      <div>
        <PageHeader role={role} />
        <div className="mb-4">
          <FormInput
            label="Find suppliers"
            placeholder="Search by product, supplier, or location"
            value={buyerQuery}
            onChange={(e) => setBuyerQuery(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {suppliers.map((s) => {
            const isSaved = saved.includes(s.name)
            return (
              <Card key={s.name} className="!rounded-[12px]">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{s.name}</h3>
                  <span className="text-sm font-medium text-[var(--cv-accent-muted)]">{s.rating}★</span>
                </div>
                <p className="text-xs text-[var(--cv-muted)]">{s.location} · ETA {s.delivery}</p>
                <p className="mt-2 text-sm">
                  {s.product} · MOQ {s.moq}
                </p>
                <p className="mt-1 font-semibold text-[var(--cv-primary)]">{formatCurrency(s.price)}/kg</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setSaved((prev) =>
                        isSaved ? prev.filter((n) => n !== s.name) : [...prev, s.name],
                      )
                    }
                  >
                    {isSaved ? 'Saved' : 'Save'}
                  </Button>
                  <Button size="sm" onClick={() => navigate('/dashboard/create')}>
                    Request quote
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
        {suppliers.length === 0 ? (
          <Card className="!rounded-[12px] mt-4 py-10 text-center">
            <p className="font-semibold">No suppliers found</p>
            <p className="mt-1 text-sm text-[var(--cv-muted)]">Try a different product or location.</p>
          </Card>
        ) : null}
      </div>
    )
  }

  if (role === 'rental') {
    return (
      <div>
        <PageHeader role={role} />
        <div className="mb-4 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/machinery')}>
            Machinery
          </Button>
          <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/labours')}>
            Labours
          </Button>
          <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/warehouses')}>
            Warehouses
          </Button>
          <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/calendar')}>
            Calendar
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {RENTAL_EQUIPMENT.map((e) => (
            <Card key={e.name} className="!rounded-[12px]">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{e.name}</h3>
                <Badge
                  status={
                    e.status === 'Available' ? 'active' : e.status === 'Booked' ? 'accepted' : 'pending'
                  }
                >
                  {e.status}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-[var(--cv-muted)]">{e.next}</p>
              <p className="text-sm font-medium text-[var(--cv-primary)]">{formatCurrency(e.rate)}/day</p>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (role === 'service') {
    return (
      <div>
        <PageHeader role={role} />
        <div className="space-y-3">
          {SERVICES.map((s) => (
            <Card key={s.name} className="!rounded-[12px]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-sm text-[var(--cv-muted)]">
                    {s.bookings} bookings · {s.rating}★
                  </p>
                </div>
                <p className="font-medium text-[var(--cv-primary)]">{formatCurrency(s.revenue)}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/calendar')}>
                  Calendar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/create')}>
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader role={role} />
      <Card className="!rounded-[12px] !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--cv-border)] text-[var(--cv-muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">Course</th>
                <th className="px-5 py-3 font-medium">Students</th>
                <th className="px-5 py-3 font-medium">Completion</th>
                <th className="px-5 py-3 font-medium">Rating</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {COURSES.map((c) => (
                <tr key={c.name} className="border-b border-[var(--cv-border)] last:border-0">
                  <td className="px-5 py-3.5 font-medium">{c.name}</td>
                  <td className="px-5 py-3.5">{c.students}</td>
                  <td className="px-5 py-3.5">{c.completion}%</td>
                  <td className="px-5 py-3.5">{c.rating}★</td>
                  <td className="px-5 py-3.5">
                    <Button size="sm" variant="secondary">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
