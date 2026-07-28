import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowTrendingUpIcon,
  BookmarkIcon,
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import {
  CartesianGrid,
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
import { useAppStore } from '../../store/appStore'
import { formatCurrency, cn } from '../../utils/format'

const PURCHASES = [
  { id: 'PO-7821', date: '25 Jul', supplier: 'Green Valley', product: 'Tomatoes', qty: '100 kg', price: 8450, status: 'delivered' as const },
  { id: 'PO-7818', date: '24 Jul', supplier: 'Fresh Farm', product: 'Potatoes', qty: '200 kg', price: 14200, status: 'shipped' as const },
  { id: 'PO-7814', date: '23 Jul', supplier: 'Organic Roots', product: 'Lettuce', qty: '50 kg', price: 6200, status: 'delivered' as const },
  { id: 'PO-7809', date: '22 Jul', supplier: 'Valley Greens', product: 'Carrots', qty: '75 kg', price: 9100, status: 'delivered' as const },
  { id: 'PO-7802', date: '21 Jul', supplier: 'Farm Direct', product: 'Broccoli', qty: '40 kg', price: 5800, status: 'pending' as const },
]

const SUPPLIERS = [
  { name: 'Green Valley', location: 'Nashik', rating: 4.8, specialties: 'Tomatoes, Peppers' },
  { name: 'Fresh Farm', location: 'Pune', rating: 4.6, specialties: 'Potatoes, Onions' },
  { name: 'Organic Roots', location: 'Hyderabad', rating: 4.9, specialties: 'Organic greens' },
  { name: 'Valley Greens', location: 'Nashik', rating: 4.5, specialties: 'Carrots, Beets' },
]

const PRICE = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  tomatoes: 150 + Math.round(Math.sin(i / 4) * 8) + i * 0.5,
  potatoes: 70 + Math.round(Math.cos(i / 5) * 3),
  carrots: 45 + Math.round(Math.sin(i / 6) * 2),
}))

const ACTIVITY = [
  { time: '11:45 AM', text: 'Order PO-8922 delivered from Green Valley' },
  { time: '10:30 AM', text: 'Quote received from Fresh Farm — ₹18,900' },
  { time: 'Yesterday', text: 'New supplier added: Organic Roots' },
]

function StatCard({
  title,
  value,
  hint,
  positive,
  icon: Icon,
  emphasize,
}: {
  title: string
  value: string
  hint?: string
  positive?: boolean
  icon: typeof CurrencyRupeeIcon
  emphasize?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4 transition hover:border-[var(--cv-primary)]/25',
        emphasize && 'ring-1 ring-[var(--cv-primary)]/20',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--cv-text)]">{value}</p>
          {hint ? (
            <p
              className={cn(
                'mt-1.5 text-xs font-medium',
                positive === true && 'text-[var(--cv-primary)]',
                positive === false && 'text-[var(--cv-danger)]',
                positive === undefined && 'text-[var(--cv-muted)]',
              )}
            >
              {positive === true ? '↑ ' : positive === false ? '↓ ' : ''}
              {hint}
            </p>
          ) : null}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--cv-primary-soft)] text-[var(--cv-primary)]">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  )
}

export function BuyerDashboard() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const name = user?.profile.name?.split(' ')[0] ?? 'Priya'
  const [product, setProduct] = useState<'tomatoes' | 'potatoes' | 'carrots'>('tomatoes')
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-surface)] p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <p className="text-sm font-medium text-[var(--cv-primary)]">Buyer workspace</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--cv-text)] sm:text-3xl">
            {greeting}, {name}
          </h2>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">
            Last login: 3 hours ago · {user?.profile.location ?? 'Mumbai, India'}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => navigate('/dashboard/create')}>
            <MagnifyingGlassIcon className="h-4 w-4" />
            Find Suppliers
          </Button>
          <Button variant="secondary" onClick={() => navigate('/dashboard/orders')}>
            View Orders
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total Purchases" value={formatCurrency(1254800)} hint="48 orders" icon={CurrencyRupeeIcon} emphasize />
        <StatCard title="This Month Spend" value={formatCurrency(285320)} hint="₹ 85,450" positive icon={ArrowTrendingUpIcon} />
        <StatCard title="Pending Orders" value="5" hint="Awaiting delivery" icon={ClockIcon} emphasize />
        <StatCard title="Active Suppliers" value="12" hint="Trusted vendors" icon={BuildingStorefrontIcon} />
        <StatCard title="Quote Requests" value="3" hint="Awaiting quotes" icon={DocumentTextIcon} />
        <StatCard title="Saved Searches" value="7" hint="Active alerts" icon={BookmarkIcon} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Card className="!rounded-2xl !p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--cv-border)] px-5 py-4">
            <div>
              <h3 className="font-semibold text-[var(--cv-text)]">Recent Purchases</h3>
              <p className="text-xs text-[var(--cv-muted)]">Latest procurement activity</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/orders')}>
              View all
            </Button>
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--cv-border)] text-xs uppercase tracking-wide text-[var(--cv-muted)]">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Supplier</th>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Qty</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {PURCHASES.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--cv-border)] last:border-0 hover:bg-[var(--cv-elevated)]">
                    <td className="px-5 py-3.5 font-semibold text-[var(--cv-text)]">{p.id}</td>
                    <td className="px-5 py-3.5 text-[var(--cv-muted)]">{p.date}</td>
                    <td className="px-5 py-3.5 text-[var(--cv-muted)]">{p.supplier}</td>
                    <td className="px-5 py-3.5 text-[var(--cv-muted)]">{p.product}</td>
                    <td className="px-5 py-3.5 text-[var(--cv-muted)]">{p.qty}</td>
                    <td className="px-5 py-3.5 font-medium text-[var(--cv-text)]">{formatCurrency(p.price)}</td>
                    <td className="px-5 py-3.5"><Badge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-2 p-4 md:hidden">
            {PURCHASES.map((p) => (
              <div key={p.id} className="rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[var(--cv-text)]">{p.id}</span>
                  <Badge status={p.status} />
                </div>
                <p className="mt-1 text-sm text-[var(--cv-muted)]">{p.supplier} · {p.product}</p>
                <p className="text-sm font-medium text-[var(--cv-text)]">{p.qty} · {formatCurrency(p.price)}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="!rounded-2xl border-[var(--cv-warning)]/30 bg-[rgba(245,185,66,0.08)]">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(245,185,66,0.15)] text-[var(--cv-warning)]">
                <DocumentTextIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[var(--cv-text)]">Quotes waiting</h3>
                <p className="mt-1 text-sm text-[var(--cv-muted)]">
                  <strong className="text-[var(--cv-text)]">3 quote requests</strong> need your review.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => navigate('/dashboard/messages')}>
                    Review quotes
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/create')}>
                    New request
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="!rounded-2xl" title="Activity">
            <ul className="space-y-3">
              {ACTIVITY.map((a) => (
                <li key={a.time + a.text} className="flex gap-3 text-sm">
                  <span className="w-20 shrink-0 text-xs font-medium text-[var(--cv-muted)]">{a.time}</span>
                  <span className="text-[var(--cv-muted)]">{a.text}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card className="!rounded-2xl !p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--cv-border)] px-5 py-4">
          <div>
            <h3 className="font-semibold text-[var(--cv-text)]">Your Suppliers</h3>
            <p className="text-xs text-[var(--cv-muted)]">Trusted vendors for recurring orders</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/listings')}>
            Browse all
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          {SUPPLIERS.map((s) => (
            <div key={s.name} className="rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[var(--cv-text)]">{s.name}</p>
                  <p className="mt-0.5 text-xs text-[var(--cv-muted)]">{s.location}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--cv-primary)]">
                  <StarIcon className="h-3.5 w-3.5" />
                  {s.rating}
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--cv-muted)]">{s.specialties}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/messages')}>
                  <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
                  Message
                </Button>
                <Button size="sm">Quote</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="!rounded-2xl">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-[var(--cv-text)]">Price Trends</h3>
            <p className="text-xs text-[var(--cv-muted)]">Last 30 days · ₹/kg</p>
          </div>
          <div className="flex gap-2">
            {(['tomatoes', 'potatoes', 'carrots'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProduct(p)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition',
                  product === p
                    ? 'bg-[var(--cv-btn-bg)] text-[var(--cv-btn-text)]'
                    : 'bg-[var(--cv-elevated)] text-[var(--cv-muted)] hover:text-[var(--cv-text)]',
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={PRICE}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }} />
              <Line type="monotone" dataKey={product} stroke="#22C55E" strokeWidth={2} dot={false} name={`${product} ₹/kg`} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
