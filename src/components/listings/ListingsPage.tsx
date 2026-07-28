import { useNavigate } from 'react-router-dom'
import { LISTINGS_LABEL, PRIMARY_CTA } from '../../config/navigation'
import { useAppStore } from '../../store/appStore'
import type { Role } from '../../types/roles'
import { formatCurrency } from '../../utils/format'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'

const SELLER_PRODUCTS = [
  { name: 'Organic Tomatoes', stock: '45kg', price: 45, status: 'active' as const, orders: 28 },
  { name: 'Fresh Potatoes', stock: '120kg', price: 28, status: 'active' as const, orders: 19 },
  { name: 'Carrots', stock: '5kg', price: 35, status: 'pending' as const, orders: 8 },
  { name: 'Lettuce', stock: '30kg', price: 60, status: 'active' as const, orders: 12 },
]

const BUYER_SUPPLIERS = [
  { name: 'Green Valley', location: 'Nashik', rating: 4.8, product: 'Tomatoes', moq: '50kg' },
  { name: 'Fresh Farm', location: 'Pune', rating: 4.6, product: 'Potatoes', moq: '100kg' },
  { name: 'Organic Roots', location: 'Hyderabad', rating: 4.9, product: 'Lettuce', moq: '20kg' },
  { name: 'Sunrise Agro', location: 'Ahmedabad', rating: 4.5, product: 'Grains', moq: '200kg' },
]

const RENTAL_EQUIPMENT = [
  { name: 'Tractor #1', status: 'Available', next: '2 days', rate: 2500 },
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
      <h1 className="text-2xl font-bold">{LISTINGS_LABEL[role]}</h1>
      <Button
        roleColor={role}
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

  if (role === 'seller') {
    return (
      <div>
        <PageHeader role={role} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SELLER_PRODUCTS.map((p) => (
            <Card key={p.name}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{p.name}</h3>
                <Badge status={p.status === 'active' ? 'active' : 'pending'} />
              </div>
              <p className="mt-2 text-sm text-slate-600">Stock: {p.stock}</p>
              <p className="text-sm font-medium text-green-800">{formatCurrency(p.price)}/kg</p>
              <p className="text-xs text-slate-500">{p.orders} orders</p>
              {p.stock === '5kg' ? (
                <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800">⚠️ Low stock — reorder level 20kg</p>
              ) : null}
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
          <input
            className="focus-ring w-full rounded-md border border-slate-300 px-4 py-3"
            placeholder="Find suppliers by product"
            type="search"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {BUYER_SUPPLIERS.map((s) => (
            <Card key={s.name}>
              <h3 className="font-semibold">{s.name}</h3>
              <p className="text-xs text-slate-500">{s.location} · {s.rating}⭐</p>
              <p className="mt-2 text-sm">{s.product} · MOQ {s.moq}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" roleColor="buyer">♡ Save</Button>
                <Button size="sm" roleColor="buyer" onClick={() => navigate('/dashboard/create')}>Quote</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (role === 'rental') {
    return (
      <div>
        <PageHeader role={role} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {RENTAL_EQUIPMENT.map((e) => (
            <Card key={e.name}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{e.name}</h3>
                <Badge
                  status={e.status === 'Available' ? 'active' : e.status === 'Booked' ? 'pending' : 'inactive'}
                  children={e.status}
                />
              </div>
              <p className="mt-2 text-sm text-slate-600">{e.next}</p>
              <p className="text-sm font-medium text-amber-900">{formatCurrency(e.rate)}/day</p>
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
            <Card key={s.name}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-sm text-slate-600">{s.bookings} bookings · {s.rating}⭐</p>
                </div>
                <p className="font-medium text-stone-700">{formatCurrency(s.revenue)}</p>
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
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">Course</th>
              <th className="px-3 py-2 font-medium">Students</th>
              <th className="px-3 py-2 font-medium">Completion</th>
              <th className="px-3 py-2 font-medium">Rating</th>
              <th className="px-3 py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {COURSES.map((c) => (
              <tr key={c.name} className="border-b border-slate-100">
                <td className="px-3 py-3 font-medium">{c.name}</td>
                <td className="px-3 py-3">{c.students}</td>
                <td className="px-3 py-3">{c.completion}%</td>
                <td className="px-3 py-3">{c.rating}⭐</td>
                <td className="px-3 py-3">
                  <Button size="sm" variant="secondary" roleColor="educator">View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
