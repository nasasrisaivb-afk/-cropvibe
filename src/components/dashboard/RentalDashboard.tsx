import { useNavigate } from 'react-router-dom'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { MetricCard } from '../common/MetricCard'
import { useAppStore } from '../../store/appStore'
import { formatCurrency, cn } from '../../utils/format'

const EQUIPMENT = [
  { name: 'Tractor #1', status: 'available' as const, next: 'Available in 2 days' },
  { name: 'Tractor #2', status: 'booked' as const, next: 'Return: Today' },
  { name: 'Harvester #1', status: 'booked' as const, next: 'Return: 3 days' },
  { name: 'Rotavator #1', status: 'available' as const, next: 'Ready now' },
  { name: 'Sprayer #1', status: 'available' as const, next: 'Ready now' },
  { name: 'Sprayer #2', status: 'maintenance' as const, next: 'Service in progress' },
  { name: 'Tractor #3', status: 'available' as const, next: 'Ready now' },
  { name: 'Harvester #2', status: 'booked' as const, next: 'Return: 5 days' },
  { name: 'Pump #1', status: 'available' as const, next: 'Ready now' },
  { name: 'Seeder #1', status: 'booked' as const, next: 'Return: Tomorrow' },
  { name: 'Cultivator #1', status: 'available' as const, next: 'Ready now' },
  { name: 'Trailer #1', status: 'maintenance' as const, next: 'Due next week' },
]

const BOOKINGS = [
  { day: 'Today', equipment: 'Tractor #1', renter: 'Farm Ltd', time: 'Return: 5 PM' },
  { day: 'Tomorrow', equipment: 'Harvester #1', renter: 'ABC Farm', time: 'Return: 8 PM' },
  { day: 'Day 3', equipment: 'Rotavator #1', renter: 'XYZ Inc', time: 'Return: 6 PM' },
  { day: 'Day 4', equipment: 'Sprayer #1', renter: 'MNO Farm', time: 'Pickup: 9 AM' },
]

const REVENUE = [
  { name: 'Tractors', amount: 234500, pct: 100 },
  { name: 'Harvesters', amount: 145300, pct: 62 },
  { name: 'Rotavators', amount: 78200, pct: 33 },
  { name: 'Sprayers', amount: 45600, pct: 19 },
]

const statusStyle = {
  available: { label: '✓ Available', className: 'bg-green-50 text-green-700' },
  booked: { label: '🚫 Booked', className: 'bg-blue-50 text-blue-700' },
  maintenance: { label: '🔧 Maintenance', className: 'bg-slate-100 text-slate-600' },
}

export function RentalDashboard() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const kycPending = user?.kycStatus === 'pending'
  const name = user?.profile.name?.split(' ')[0] ?? 'Rakesh'

  return (
    <div className="space-y-6">
      {kycPending && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>KYC Pending.</strong> Adding equipment is locked until approval.
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold">Hello, {name}! 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Last login: 1 hour ago | Pune, India</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard title="Total Revenue" value={formatCurrency(582300)} delta="18% YoY" deltaPositive icon="💰" roleColor="rental" />
        <MetricCard title="This Month" value={formatCurrency(123450)} delta="₹ 34,200" deltaPositive icon="📊" roleColor="rental" />
        <MetricCard title="Equipment Booked" value="8 of 12" subtitle="67% utilization" icon="🚜" roleColor="rental" />
        <MetricCard title="Active Bookings" value="8" subtitle="Next pickup: 2h" icon="📅" roleColor="rental" />
        <MetricCard title="Pending Returns" value="2" delta="Due by today" icon="⏱" roleColor="rental" />
        <MetricCard title="Avg Rating" value="4.8/5.0 ⭐" subtitle="89 reviews" icon="⭐" roleColor="rental" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button roleColor="rental" disabled={kycPending} onClick={() => navigate('/dashboard/create')}>+ Add Equipment</Button>
        <Button variant="secondary" roleColor="rental" onClick={() => navigate('/dashboard/listings')}>Availability Calendar</Button>
        <Button variant="secondary" roleColor="rental" onClick={() => navigate('/dashboard/orders')}>View Bookings</Button>
        <Button variant="secondary" roleColor="rental" onClick={() => navigate('/dashboard/orders')}>Manage Returns</Button>
      </div>

      <Card title="Equipment Status">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {EQUIPMENT.map((eq) => (
            <div key={eq.name} className="rounded-lg border border-slate-200 p-4">
              <p className="font-semibold">{eq.name}</p>
              <span className={cn('mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium', statusStyle[eq.status].className)}>
                {statusStyle[eq.status].label}
              </span>
              <p className="mt-2 text-xs text-slate-500">{eq.next}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Upcoming Bookings">
          <ul className="space-y-3">
            {BOOKINGS.map((b) => (
              <li key={`${b.day}-${b.equipment}`} className="rounded-lg border border-slate-200 p-3">
                <p className="font-semibold text-amber-900">{b.day}</p>
                <p className="text-sm">{b.equipment} · {b.renter}</p>
                <p className="text-xs text-slate-500">{b.time}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Revenue by Equipment">
          <div className="space-y-4">
            {REVENUE.map((r) => (
              <div key={r.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{r.name}</span>
                  <span className="font-semibold text-amber-900">{formatCurrency(r.amount)}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-amber-900" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Maintenance Reminders">
        <ul className="space-y-2 text-sm">
          <li className="text-amber-700">⚠️ Tractor #3: Next service due in 5 days</li>
          <li className="text-green-700">✓ Sprayer #2: Maintenance completed yesterday</li>
        </ul>
      </Card>
    </div>
  )
}
