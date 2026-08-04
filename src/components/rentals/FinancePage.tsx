import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '../../utils/format'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { PageHeader } from '../common/PageHeader'

const REVENUE_BREAKDOWN = [
  { name: 'Machinery', amount: 84200, pct: 42 },
  { name: 'Equipment', amount: 51800, pct: 26 },
  { name: 'Land', amount: 36400, pct: 18 },
  { name: 'Warehouses', amount: 28100, pct: 14 },
]

const TREND = [
  { label: 'Mar', value: 48 },
  { label: 'Apr', value: 62 },
  { label: 'May', value: 55 },
  { label: 'Jun', value: 71 },
  { label: 'Jul', value: 84 },
]

const RECENT = [
  { id: 'TXN-9021', label: 'BK-5430 · Harvester rental', amount: 13500, date: '28 Jul', status: 'completed' as const },
  { id: 'TXN-9018', label: 'BK-5428 · Rotavator rental', amount: 3600, date: '26 Jul', status: 'pending' as const },
  { id: 'TXN-9012', label: 'Platform fee · Jul', amount: -2145, date: '25 Jul', status: 'completed' as const },
]

export function FinancePage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue & earnings"
        subtitle="Period overview for rental income, pending payouts, and open finance issues."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigate('/dashboard/payouts')}>
              Payouts
            </Button>
            <Button onClick={() => navigate('/dashboard/disputes')}>Raise finance issue</Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="!rounded-[12px] ring-1 ring-[var(--cv-primary)]/15">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">Revenue (this month)</p>
          <p className="mt-2 text-3xl font-bold text-[var(--cv-primary)]">{formatCurrency(200500)}</p>
          <p className="mt-1 text-xs text-[var(--cv-muted)]">+12% vs last month · YTD {formatCurrency(1182400)}</p>
        </Card>
        <button
          type="button"
          className="rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4 text-left transition hover:border-[var(--cv-primary)]/30"
          onClick={() => navigate('/dashboard/payouts')}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">Pending payouts</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(28600)}</p>
          <p className="mt-1 text-xs text-[var(--cv-muted)]">2 requests · tap to review</p>
        </button>
        <button
          type="button"
          className="rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4 text-left transition hover:border-[var(--cv-warning)]/40"
          onClick={() => navigate('/dashboard/disputes')}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">Open disputes</p>
          <p className="mt-2 text-3xl font-bold text-[var(--cv-warning)]">3</p>
          <p className="mt-1 text-xs text-[var(--cv-muted)]">1 needs your reply</p>
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="!rounded-[12px]" title="Earnings trend">
          <div className="flex h-40 items-end gap-3">
            {TREND.map((t) => (
              <div key={t.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-[var(--cv-primary)]/80"
                  style={{ height: `${t.value}%` }}
                  title={`${t.label}: index ${t.value}`}
                />
                <span className="text-xs text-[var(--cv-muted)]">{t.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="!rounded-[12px]" title="Breakdown by category">
          <div className="space-y-4">
            {REVENUE_BREAKDOWN.map((r) => (
              <div key={r.name}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium text-[var(--cv-muted)]">{r.name}</span>
                  <span className="font-semibold text-[var(--cv-primary)]">{formatCurrency(r.amount)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--cv-elevated)]">
                  <div className="h-full rounded-full bg-[var(--cv-primary)]" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="!rounded-[12px] !p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--cv-border)] px-5 py-4">
          <div>
            <h3 className="font-semibold">Recent transactions</h3>
            <p className="text-xs text-[var(--cv-muted)]">Earnings and fees for this period</p>
          </div>
          <Button size="sm" variant="secondary">
            Export report
          </Button>
        </div>
        <div className="divide-y divide-[var(--cv-border)]">
          {RECENT.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{t.label}</p>
                <p className="text-xs text-[var(--cv-muted)]">
                  {t.id} · {t.date}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge status={t.status === 'pending' ? 'pending' : 'completed'}>
                  {t.status === 'pending' ? 'Pending' : 'Completed'}
                </Badge>
                <span
                  className={`font-semibold ${t.amount < 0 ? 'text-[var(--cv-danger)]' : 'text-[var(--cv-primary)]'}`}
                >
                  {t.amount < 0 ? '-' : '+'}
                  {formatCurrency(Math.abs(t.amount))}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
