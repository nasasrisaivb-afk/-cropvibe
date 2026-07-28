import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { MetricCard } from '../common/MetricCard'
import { useAppStore } from '../../store/appStore'
import { formatCurrency } from '../../utils/format'

const PURCHASES = [
  { date: '2026-07-25', supplier: 'Green Valley', product: 'Tomatoes', qty: '100 kg', price: 8450, status: 'delivered' as const },
  { date: '2026-07-24', supplier: 'Fresh Farm', product: 'Potatoes', qty: '200 kg', price: 14200, status: 'shipped' as const },
  { date: '2026-07-23', supplier: 'Organic Roots', product: 'Lettuce', qty: '50 kg', price: 6200, status: 'delivered' as const },
  { date: '2026-07-22', supplier: 'Valley Greens', product: 'Carrots', qty: '75 kg', price: 9100, status: 'delivered' as const },
  { date: '2026-07-21', supplier: 'Farm Direct', product: 'Broccoli', qty: '40 kg', price: 5800, status: 'delivered' as const },
]

const SUPPLIERS = [
  { name: 'Green Valley', location: 'Nashik', rating: 4.8, specialties: 'Tomatoes, Peppers' },
  { name: 'Fresh Farm', location: 'Pune', rating: 4.6, specialties: 'Potatoes, Onions' },
  { name: 'Organic Roots', location: 'Hyderabad', rating: 4.9, specialties: 'Organic greens' },
  { name: 'Valley Greens', location: 'Nashik', rating: 4.5, specialties: 'Carrots, Beets' },
  { name: 'Farm Direct', location: 'Bangalore', rating: 4.7, specialties: 'Broccoli' },
  { name: 'Harvest Co', location: 'Indore', rating: 4.4, specialties: 'Grains' },
]

const PRICE = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  tomatoes: 150 + Math.round(Math.sin(i / 4) * 8) + i * 0.5,
  potatoes: 70 + Math.round(Math.cos(i / 5) * 3),
  carrots: 45 + Math.round(Math.sin(i / 6) * 2),
}))

export function BuyerDashboard() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const name = user?.profile.name?.split(' ')[0] ?? 'Priya'
  const [product, setProduct] = useState<'tomatoes' | 'potatoes' | 'carrots'>('tomatoes')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hello, {name}! 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Last login: 3 hours ago | Mumbai, India</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard title="Total Purchases" value={formatCurrency(1254800)} subtitle="48 orders" icon="🛒" roleColor="buyer" />
        <MetricCard title="This Month Spend" value={formatCurrency(285320)} delta="₹ 85,450" deltaPositive icon="💳" roleColor="buyer" />
        <MetricCard title="Pending Orders" value="5" delta="⏱ Awaiting" icon="⏱" roleColor="buyer" />
        <MetricCard title="Active Suppliers" value="12" subtitle="Trusted vendors" icon="🤝" roleColor="buyer" />
        <MetricCard title="Quote Requests" value="3" subtitle="Awaiting quotes" icon="📨" roleColor="buyer" />
        <MetricCard title="Saved Searches" value="7" subtitle="Active" icon="🔖" roleColor="buyer" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button roleColor="buyer" onClick={() => navigate('/dashboard/create')}>🔍 Find Suppliers</Button>
        <Button variant="secondary" roleColor="buyer">Send Quote Request</Button>
        <Button variant="secondary" roleColor="buyer" onClick={() => navigate('/dashboard/orders')}>View Orders</Button>
        <Button variant="secondary" roleColor="buyer" onClick={() => navigate('/dashboard/listings')}>Saved Suppliers</Button>
      </div>

      <Card title="Recent Purchases">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Supplier</th>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {PURCHASES.map((p) => (
                <tr key={`${p.date}-${p.product}`} className="border-b border-slate-100">
                  <td className="px-3 py-3">{p.date}</td>
                  <td className="px-3 py-3">{p.supplier}</td>
                  <td className="px-3 py-3">{p.product}</td>
                  <td className="px-3 py-3">{p.qty}</td>
                  <td className="px-3 py-3">{formatCurrency(p.price)}</td>
                  <td className="px-3 py-3"><Badge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 md:hidden">
          {PURCHASES.map((p) => (
            <div key={`${p.date}-${p.product}`} className="rounded-lg border p-3">
              <div className="flex justify-between"><span className="font-semibold">{p.supplier}</span><Badge status={p.status} /></div>
              <p className="mt-1 text-sm text-slate-500">{p.product} · {p.qty}</p>
              <p className="text-sm">{formatCurrency(p.price)} · {p.date}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Your Suppliers">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUPPLIERS.map((s) => (
            <div key={s.name} className="rounded-lg border border-slate-200 p-4">
              <p className="font-semibold">{s.name}</p>
              <p className="text-xs text-slate-500">{s.location} · {s.rating}⭐</p>
              <p className="mt-2 text-sm text-slate-600">{s.specialties}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" roleColor="buyer">Message</Button>
                <Button size="sm" roleColor="buyer">Quote</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Price Trends (Last 30 Days)">
        <div className="mb-4 flex gap-2">
          {(['tomatoes', 'potatoes', 'carrots'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProduct(p)}
              className={`rounded-full px-3 py-1 text-xs capitalize ${product === p ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={PRICE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={product} stroke="#1F3A70" strokeWidth={2} dot={false} name={`${product} ₹/kg`} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Recent Activity">
        <ul className="space-y-2 text-sm text-slate-600">
          <li>11:45 AM — Order PO-8922 delivered (Green Valley)</li>
          <li>10:30 AM — Quote received from Fresh Farm (3 items, ₹18,900)</li>
          <li>Yesterday — New supplier added: Organic Roots</li>
        </ul>
      </Card>
    </div>
  )
}
