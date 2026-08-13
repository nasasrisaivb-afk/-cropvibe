import { useNavigate } from 'react-router-dom'
import {
  ArrowTrendingUpIcon,
  ClockIcon,
  CubeIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  StarIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { DashboardStatCard } from '../common/DashboardStatCard'
import { LargeTitle } from '../common/LargeTitle'
import { useAppStore } from '../../store/appStore'
import { formatCurrency } from '../../utils/format'

const ORDERS = [
  { id: 'PO-8923', buyer: 'Green Mart', product: 'Tomatoes', qty: '50 kg', total: 8450, status: 'packed' as const },
  { id: 'PO-8922', buyer: 'FreshStore', product: 'Potatoes', qty: '100 kg', total: 12300, status: 'pending' as const },
  { id: 'PO-8921', buyer: 'Retail Hub', product: 'Carrots', qty: '75 kg', total: 9200, status: 'shipped' as const },
  { id: 'PO-8920', buyer: 'Local Market', product: 'Lettuce', qty: '30 kg', total: 4500, status: 'delivered' as const },
  { id: 'PO-8919', buyer: 'Organic Foods', product: 'Tomatoes', qty: '60 kg', total: 10200, status: 'completed' as const },
]

const PRODUCTS = [
  { name: 'Tomatoes', revenue: 85000, pct: 100 },
  { name: 'Potatoes', revenue: 52300, pct: 61 },
  { name: 'Carrots', revenue: 38900, pct: 46 },
  { name: 'Lettuce', revenue: 18600, pct: 22 },
]

const ACTIVITY = [
  { time: '11:32 AM', text: 'Order PO-8922 received from FreshStore' },
  { time: '10:15 AM', text: 'Product “Organic Tomatoes” approved' },
  { time: 'Yesterday', text: '12 new reviews posted' },
]

function StatCard(props: Parameters<typeof DashboardStatCard>[0] & { emphasize?: boolean }) {
  const { emphasize, ...rest } = props
  return <DashboardStatCard featured={emphasize} {...rest} />
}

export function SellerDashboard() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const kycPending = user?.kycStatus === 'pending'
  const name = user?.profile.name?.split(' ')[0] ?? 'Raj'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="space-y-5 lg:space-y-6">
      {kycPending && (
        <div className="flex items-start gap-3 rounded-[16px] border border-[var(--cv-warning)]/30 bg-[var(--color-warning-soft)] px-4 py-3 text-sm text-[var(--cv-warning)]">
          <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} />
          <div>
            <strong>KYC Pending — Review status.</strong> Create listings stays locked until approval.
          </div>
        </div>
      )}

      <LargeTitle
        eyebrow="Seller"
        title={`${greeting}, ${name}`}
        subtitle="Last login: 2 hours ago · Hyderabad, India"
        actions={
          <>
            <Button disabled={kycPending} onClick={() => navigate('/dashboard/create')}>
              + Create Listing
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard/orders')}>
              View Orders
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <StatCard title="Total Revenue" value={formatCurrency(234500)} hint="12% vs last month" positive icon={CurrencyRupeeIcon} emphasize />
        <StatCard title="This Month" value={formatCurrency(45320)} hint="₹ 8,450" positive icon={ArrowTrendingUpIcon} />
        <StatCard title="Total Orders" value="127" hint="14 vs last week" positive icon={CubeIcon} />
        <StatCard title="Active Listings" value="28" hint="2 published today" positive icon={Squares2X2Icon} />
        <StatCard title="New Orders" value="3" hint="Awaiting your action" icon={ClockIcon} emphasize />
        <StatCard title="Avg Rating" value="4.7 / 5.0" hint="156 reviews" icon={StarIcon} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="!p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--cv-border)] px-5 py-4">
            <div>
              <h3 className="font-semibold text-[var(--cv-text)]">Recent Orders</h3>
              <p className="text-xs text-[var(--cv-muted)]">Latest fulfillment activity</p>
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
                  <th className="px-5 py-3 font-medium">Buyer</th>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Qty</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {ORDERS.map((o) => (
                  <tr key={o.id} className="border-b border-[var(--cv-border)] last:border-0 hover:bg-[var(--cv-elevated)]">
                    <td className="px-5 py-3.5 font-semibold text-[var(--cv-text)]">{o.id}</td>
                    <td className="px-5 py-3.5 text-[var(--cv-muted)]">{o.buyer}</td>
                    <td className="px-5 py-3.5 text-[var(--cv-muted)]">{o.product}</td>
                    <td className="px-5 py-3.5 text-[var(--cv-muted)]">{o.qty}</td>
                    <td className="px-5 py-3.5 font-medium text-[var(--cv-text)]">{formatCurrency(o.total)}</td>
                    <td className="px-5 py-3.5"><Badge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-2 p-4 md:hidden">
            {ORDERS.map((o) => (
              <div key={o.id} className="rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[var(--cv-text)]">{o.id}</span>
                  <Badge status={o.status} />
                </div>
                <p className="mt-1 text-sm text-[var(--cv-muted)]">{o.buyer} · {o.product}</p>
                <p className="text-sm font-medium text-[var(--cv-text)]">{o.qty} · {formatCurrency(o.total)}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-[var(--cv-sidebar-promo-border)] bg-[var(--cv-sidebar-promo-bg)]">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-warning-soft)] text-[var(--cv-warning)]">
                <ExclamationTriangleIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[var(--cv-text)]">Low stock alert</h3>
                <p className="mt-1 text-sm text-[var(--cv-muted)]">
                  Tomatoes: <strong className="text-[var(--cv-text)]">5 kg</strong> left (reorder at 20 kg)
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm">Reorder</Button>
                  <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/listings')}>
                    Inventory
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Best selling products">
            <div className="space-y-4">
              {PRODUCTS.map((p) => (
                <div key={p.name}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium text-[var(--cv-muted)]">{p.name}</span>
                    <span className="font-semibold text-[var(--cv-primary)]">{formatCurrency(p.revenue)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--cv-elevated)]">
                    <div className="h-full rounded-full bg-[var(--cv-primary)]" style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Activity">
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

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => navigate('/dashboard/listings')}>
          Manage Inventory
        </Button>
        <Button variant="ghost" onClick={() => navigate('/dashboard/analytics')}>
          Open Analytics
        </Button>
      </div>
    </div>
  )
}
