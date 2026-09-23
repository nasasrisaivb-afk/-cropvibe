import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BellAlertIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CloudIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { HOME_CONTENT, type IntelCard } from '../../config/homeContent'
import { getAllNavPaths } from '../../config/navigation'
import { useAppStore } from '../../store/appStore'
import type { PageId, Role } from '../../types/roles'
import { cn } from '../../utils/format'
import { Button } from '../common/Button'
import { DashboardStatCard } from '../common/DashboardStatCard'
import { SegmentedControl } from '../common/SegmentedControl'

const KPI_ICONS = [CheckCircleIcon, CurrencyRupeeIcon, BellAlertIcon, StarIcon]

const INTEL_ICON = {
  mandi: CurrencyRupeeIcon,
  weather: CloudIcon,
  scheme: SparklesIcon,
} as const

function maxChart(points: { value: number }[]) {
  return Math.max(...points.map((p) => p.value), 1)
}

export function HomeDashboard({ role }: { role: Role }) {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const setCurrentPage = useAppStore((s) => s.setCurrentPage)
  const data = HOME_CONTENT[role]
  const kycPending = user?.kycStatus === 'pending' || user?.kycStatus === 'none'
  const setupDone = user?.kycStatus === 'approved'
  const [range, setRange] = useState<'7' | '30' | '90'>('7')
  const paths = getAllNavPaths()
  const peak = maxChart(data.chartPoints)

  const go = (page: string) => {
    const id = page as PageId
    setCurrentPage(id)
    navigate(paths[id] ?? '/dashboard')
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      {!setupDone ? (
        <section className="flex flex-col gap-3 rounded-2xl border border-[var(--cv-warning)]/30 bg-[var(--color-warning-soft)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--cv-warning)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--cv-text)]">
                {kycPending ? 'Verification still needed' : 'Finish setup'}
              </p>
              <p className="mt-0.5 text-sm text-[var(--cv-muted)]">
                Explore freely. Publishing, accepting orders, and withdrawals stay gated until verification.
              </p>
              <p className="mt-2 text-xs font-medium text-[var(--cv-text)]">Setup 2 of 4 · about 8 minutes left</p>
            </div>
          </div>
          <Button size="sm" onClick={() => go('profile')}>
            Continue setup
          </Button>
        </section>
      ) : null}

      <section className="cv-dashboard-panel p-5">
        <div className="mb-4">
          <h2 className="text-[15px] font-semibold text-[var(--cv-text)]">Action Center</h2>
          <p className="text-xs text-[var(--cv-muted)]">What needs you now — one tap each</p>
        </div>
        <ul className="space-y-2">
          {data.actions.slice(0, 5).map((action) => (
            <li key={action.id}>
              <button
                type="button"
                className="focus-ring flex w-full items-center gap-3 rounded-xl border border-[var(--cv-border)] bg-white px-3 py-3 text-left text-[var(--cv-text)] transition hover:border-[var(--cv-primary)]/25 hover:bg-[var(--cv-primary-soft)]"
                onClick={() => go(action.page)}
              >
                <span
                  className={cn(
                    'h-2.5 w-2.5 shrink-0 rounded-full',
                    action.urgency === 'high' && 'bg-[var(--cv-danger)]',
                    action.urgency === 'medium' && 'bg-[var(--cv-warning)]',
                    action.urgency === 'low' && 'bg-[var(--cv-info)]',
                  )}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{action.title}</span>
                  <span className="block truncate text-xs opacity-70">{action.detail}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold">{action.cta}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {data.kpis.map((kpi, index) => {
          const Icon = KPI_ICONS[index] ?? ChartBarIcon
          return (
            <DashboardStatCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              hint={kpi.hint}
              positive={kpi.positive}
              icon={Icon}
              featured={index === 1}
            />
          )
        })}
      </div>

      {data.intel.length > 0 ? (
        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--cv-text)]">Farm Intelligence</h2>
              <p className="text-xs text-[var(--cv-muted)]">
                CropVibe is not a government service. Source and last-updated on every card.
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {data.intel.map((card) => (
              <IntelStripCard key={card.title} card={card} onOpen={() => go(card.page)} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="cv-dashboard-panel p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--cv-text)]">{data.chartTitle}</h2>
              <p className="text-xs text-[var(--cv-muted)]">{data.chartHint}</p>
            </div>
            <SegmentedControl
              ariaLabel="Chart range"
              value={range}
              onChange={setRange}
              options={[
                { value: '7', label: '7d' },
                { value: '30', label: '30d' },
                { value: '90', label: '90d' },
              ]}
            />
          </div>
          <div className="flex h-40 items-end gap-2" role="img" aria-label={`${data.chartTitle} chart`}>
            {data.chartPoints.map((point) => (
              <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-xl bg-[linear-gradient(180deg,#8b8ef0_0%,#5b5ce2_100%)]"
                  style={{ height: `${Math.max(12, (point.value / peak) * 100)}%` }}
                />
                <span className="text-[11px] text-[var(--cv-muted)]">{point.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--cv-muted)]">
              <caption className="sr-only">{data.chartTitle} data table</caption>
              <thead>
                <tr>
                  <th className="py-1 font-medium">Day</th>
                  {data.chartPoints.map((point) => (
                    <th key={point.label} className="px-1 py-1 font-medium">
                      {point.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="text-[var(--cv-text)]">
                  <td className="py-1">Value</td>
                  {data.chartPoints.map((point) => (
                    <td key={point.label} className="px-1 py-1 tabular-nums">
                      {point.value.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="cv-dashboard-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[var(--cv-text)]">Recent activity</h2>
            <button
              type="button"
              className="text-xs font-semibold text-[var(--cv-primary)]"
              onClick={() => go(role === 'buyer' ? 'orders' : role === 'rental' ? 'bookings' : 'orders')}
            >
              View all
            </button>
          </div>
          <ol className="space-y-0">
            {data.activity.map((item, index) => (
              <li key={item.text} className="flex gap-3 text-sm">
                <span className="flex w-5 shrink-0 flex-col items-center">
                  <span
                    className={cn(
                      'mt-0.5 h-3.5 w-3.5 rounded-full border-2',
                      index === 0
                        ? 'border-[var(--cv-primary)] bg-[var(--cv-primary)]'
                        : 'border-[var(--cv-primary)] bg-white',
                    )}
                  />
                  {index < data.activity.length - 1 ? (
                    <span className="min-h-6 w-px flex-1 bg-[var(--cv-primary)]/20" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1 pb-4">
                  <span className="block text-[var(--cv-text)]">{item.text}</span>
                  <span className="mt-0.5 block tabular-nums text-xs text-[var(--cv-muted)]">{item.time}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}

function IntelStripCard({ card, onOpen }: { card: IntelCard; onOpen: () => void }) {
  const Icon = INTEL_ICON[card.kind]
  const Trend = card.body.includes('↑') ? ArrowTrendingUpIcon : card.body.includes('↓') ? ArrowTrendingDownIcon : CalendarDaysIcon
  return (
    <button
      type="button"
      onClick={onOpen}
      className="focus-ring cv-dashboard-panel flex h-full flex-col p-4 text-left transition hover:bg-[var(--cv-elevated)]"
    >
      <span className="flex items-center gap-2 text-xs font-medium text-[var(--cv-muted)]">
        <Icon className="h-4 w-4" />
        {card.title}
      </span>
      <span className="mt-2 flex items-start gap-1 text-sm font-semibold text-[var(--cv-text)]">
        <Trend className="mt-0.5 h-4 w-4 shrink-0" />
        {card.body}
      </span>
      <span className="mt-auto pt-3 text-[11px] text-[var(--cv-muted)]">{card.meta}</span>
    </button>
  )
}
