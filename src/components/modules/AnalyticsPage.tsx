import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ROLE_LABELS } from '../../config/navigation'
import { useAppStore } from '../../store/appStore'
import { CHART_THEME } from '../../theme/chartTheme'
import type { Role } from '../../types/roles'
import { formatCurrency } from '../../utils/format'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { PageHeader } from '../common/PageHeader'
import { Select } from '../common/Select'

const TREND = [
  { month: 'Feb', revenue: 32000, orders: 18 },
  { month: 'Mar', revenue: 41000, orders: 24 },
  { month: 'Apr', revenue: 38000, orders: 21 },
  { month: 'May', revenue: 52000, orders: 31 },
  { month: 'Jun', revenue: 61000, orders: 36 },
  { month: 'Jul', revenue: 72000, orders: 42 },
]

const METRICS: Record<
  Role,
  { label: string; value: string; hint: string }[]
> = {
  seller: [
    { label: 'GMV (30d)', value: formatCurrency(45320), hint: '+12% vs last month' },
    { label: 'Orders completed', value: '127', hint: 'Conversion 4.8%' },
    { label: 'Top product', value: 'Tomatoes', hint: formatCurrency(85000) + ' revenue' },
    { label: 'Repeat buyers', value: '34%', hint: 'Up 6 pts' },
  ],
  buyer: [
    { label: 'Spend (30d)', value: formatCurrency(285320), hint: '+â‚¹ 85,450' },
    { label: 'Purchase orders', value: '48', hint: '5 pending delivery' },
    { label: 'Active suppliers', value: '12', hint: '3 new this month' },
    { label: 'Avg savings', value: '8.4%', hint: 'vs open market' },
  ],
  rental: [
    { label: 'Utilization', value: '67%', hint: '8 of 12 assets booked' },
    { label: 'Revenue (30d)', value: formatCurrency(123450), hint: '+18% YoY' },
    { label: 'Cancellation rate', value: '4.2%', hint: 'Within SLA' },
    { label: 'Avg booking days', value: '3.6', hint: 'Seasonal peak' },
  ],
  service: [
    { label: 'Completed jobs', value: '18', hint: '2 pending today' },
    { label: 'Revenue (30d)', value: formatCurrency(78450), hint: '+â‚¹ 15,300' },
    { label: 'Completion rate', value: '96%', hint: 'On-time 91%' },
    { label: 'Repeat clients', value: '53%', hint: '18 of 34' },
  ],
  educator: [
    { label: 'Active students', value: '98', hint: '127 total enrolled' },
    { label: 'Completion rate', value: '78%', hint: '+8 pts' },
    { label: 'Revenue (30d)', value: formatCurrency(45600), hint: '5 live courses' },
    { label: 'Certificates issued', value: '45', hint: '12 this month' },
  ],
}

const BREAKDOWN: Record<Role, { name: string; value: number }[]> = {
  seller: [
    { name: 'Tomatoes', value: 85000 },
    { name: 'Potatoes', value: 52300 },
    { name: 'Carrots', value: 38900 },
    { name: 'Lettuce', value: 18600 },
  ],
  buyer: [
    { name: 'Vegetables', value: 120000 },
    { name: 'Grains', value: 86000 },
    { name: 'Dairy', value: 45000 },
    { name: 'Inputs', value: 34320 },
  ],
  rental: [
    { name: 'Tractors', value: 234500 },
    { name: 'Harvesters', value: 145300 },
    { name: 'Rotavators', value: 78200 },
    { name: 'Sprayers', value: 45600 },
  ],
  service: [
    { name: 'Consultancy', value: 123600 },
    { name: 'Soil testing', value: 78300 },
    { name: 'Repair', value: 45200 },
    { name: 'Inspection', value: 32450 },
  ],
  educator: [
    { name: 'Organic 101', value: 85000 },
    { name: 'Soil Health', value: 58200 },
    { name: 'IPM', value: 42100 },
    { name: 'Irrigation', value: 28300 },
  ],
}

export function AnalyticsPage() {
  const role = useAppStore((s) => s.user?.activeRole ?? 'seller')
  const theme = useAppStore((s) => s.theme)
  const chart = CHART_THEME[theme]
  const [range, setRange] = useState('30d')
  const metrics = METRICS[role]
  const bars = BREAKDOWN[role]
  const max = useMemo(() => Math.max(...bars.map((b) => b.value)), [bars])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${ROLE_LABELS[role]} insights`}
        title="Analytics & reports"
        subtitle={`Track activation, conversion, and revenue for your ${ROLE_LABELS[role].toLowerCase()} workspace.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Select
              label="Date range"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              options={[
                { label: 'Last 7 days', value: '7d' },
                { label: 'Last 30 days', value: '30d' },
                { label: 'This quarter', value: 'q' },
                { label: 'This year', value: 'y' },
              ]}
            />
            <Button variant="secondary">Export CSV</Button>
            <Button variant="secondary">Export PDF</Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="!rounded-[12px]">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">{m.label}</p>
            <p className="mt-2 text-2xl font-bold">{m.value}</p>
            <p className="mt-1 text-xs font-medium text-[var(--cv-primary)]">{m.hint}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="!rounded-[12px]" title="Revenue trend">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chart.accent} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={chart.accent} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chart.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chart.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chart.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: chart.tooltipBg,
                    border: `1px solid ${chart.tooltipBorder}`,
                    borderRadius: 12,
                    color: 'var(--cv-text)',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke={chart.accent} fill="url(#revFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="!rounded-[12px]" title="Volume by period">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TREND}>
                <CartesianGrid stroke={chart.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chart.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chart.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: chart.tooltipBg,
                    border: `1px solid ${chart.tooltipBorder}`,
                    borderRadius: 12,
                    color: 'var(--cv-text)',
                  }}
                />
                <Bar dataKey="orders" fill={chart.secondary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="!rounded-[12px]" title="Category / offering breakdown">
        <div className="space-y-4">
          {bars.map((b) => (
            <div key={b.name}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-medium text-[var(--cv-muted)]">{b.name}</span>
                <span className="font-semibold text-[var(--cv-primary)]">{formatCurrency(b.value)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--cv-elevated)]">
                <div
                  className="h-full rounded-full bg-[var(--cv-primary)]"
                  style={{ width: `${(b.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

