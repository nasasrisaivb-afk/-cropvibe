'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Banknote, CheckCircle2, Clock3, Receipt } from 'lucide-react'
import { getTransactionMonitor } from '@/lib/api/insights.api'
import { StatCard, StatGrid } from '@/components/ui/stat-card'
import { Skeleton } from '@/components/ui/loading'
import { Badge } from '@/components/ui/badge'
import { BarList, ChartCard, TrendChart } from '@/components/charts/ChartKit'
import { CellValue } from '@/components/resource/cells'
import { formatInr, formatInrCompact, formatNumber } from '@/lib/utils'

export function TransactionMonitor() {
  const { data, isLoading } = useQuery({ queryKey: ['txn-monitor'], queryFn: getTransactionMonitor, refetchInterval: 30000 })
  const volumeSeries = [
    { key: 'volume', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday', role: 'compare' as const },
  ]
  const overall = data ? data.gateways.reduce((s, g) => s + g.successRate, 0) / data.gateways.length : 0

  return (
    <div className="space-y-5">
      <StatGrid>
        <StatCard label="Transactions · last 12h" value={data ? formatNumber(data.todayVolume) : ''} trend={6.2} icon={Receipt} highlight loading={isLoading} />
        <StatCard
          label="Payment success rate"
          value={data ? `${overall.toFixed(1)}%` : ''}
          hint="Target 97%"
          hintTone={overall < 97 ? 'warning' : 'success'}
          icon={CheckCircle2}
          loading={isLoading}
        />
        <StatCard label="Average ticket" value={data ? formatInr(data.avgTicket) : ''} icon={Banknote} loading={isLoading} />
        <StatCard
          label="Money waiting on approval"
          value={data ? `${data.refundsPending + data.payoutsPending}` : ''}
          hint={data ? `${data.refundsPending} refunds · ${data.payoutsPending} payouts` : undefined}
          icon={Clock3}
          href="/dashboard/pending-actions"
          loading={isLoading}
        />
      </StatGrid>

      <div className="grid gap-5 xl:grid-cols-12">
        <ChartCard
          className="xl:col-span-8"
          title="Transaction volume"
          description="Payments per hour — last 24 hours against the same hours yesterday"
          series={volumeSeries}
          data={data?.hours}
          xKey="hour"
          format={(v) => formatNumber(v)}
        >
          {data ? <TrendChart data={data.hours} xKey="hour" series={volumeSeries} format={(v) => formatNumber(v)} /> : <Skeleton className="mx-3 h-60" />}
        </ChartCard>
        <ChartCard
          className="xl:col-span-4"
          title="Success rate by method"
          description="Captured ÷ attempted, last 45 days"
          series={[{ key: 'value', label: 'Success %' }]}
          data={data?.byMethod.map((m) => ({ method: m.label, value: m.value }))}
          xKey="method"
          format={(v) => `${v}%`}
        >
          {data ? <BarList items={data.byMethod} format={(v) => `${v}%`} max={100} /> : <Skeleton className="mx-3 h-60" />}
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <section className="rounded-xl border border-border-default bg-bg-surface shadow-card xl:col-span-5">
          <div className="border-b border-border-light px-6 py-4">
            <h2 className="text-base font-semibold text-text-primary">Gateway health</h2>
            <p className="text-sm text-text-secondary">Routing shifts away from a degraded gateway automatically</p>
          </div>
          <ul className="divide-y divide-border-light">
            {(data?.gateways ?? []).map((g) => (
              <li key={g.gateway} className="flex items-center gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary">{g.gateway}</p>
                  <p className="text-xs text-text-muted">
                    {formatInrCompact(g.volume)} processed · p95 {g.latencyMs}ms
                  </p>
                </div>
                <span className="tabular text-sm font-semibold text-text-primary">{g.successRate}%</span>
                <Badge variant={g.status === 'operational' ? 'success' : 'warning'} showIcon>
                  {g.status === 'operational' ? 'Operational' : 'Degraded'}
                </Badge>
              </li>
            ))}
            {isLoading ? (
              <li className="p-6">
                <Skeleton className="h-24 w-full" />
              </li>
            ) : null}
          </ul>
        </section>

        <section className="overflow-hidden rounded-xl border border-border-default bg-bg-surface shadow-card xl:col-span-7">
          <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Recent failures</h2>
              <p className="text-sm text-text-secondary">Most failures are retried by the buyer within 10 minutes</p>
            </div>
            <Link href="/finance/payments?tab=failed" className="inline-flex items-center gap-1 text-sm font-medium text-brand-lime hover:underline">
              All failed <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="cv-th">Payment</th>
                  <th className="cv-th">Payer</th>
                  <th className="cv-th">Reason</th>
                  <th className="cv-th text-right">Amount</th>
                  <th className="cv-th">When</th>
                </tr>
              </thead>
              <tbody>
                {(data?.failures ?? []).map((p) => (
                  <tr key={p.id} className="border-b border-border-light last:border-0 hover:bg-bg-surfaceHover">
                    <td className="cv-td">
                      <Link href={`/finance/payments?id=${p.id}`} className="font-mono text-[13px] text-text-secondary hover:text-brand-lime">
                        {p.id}
                      </Link>
                      <p className="text-xs text-text-muted">
                        {p.method} · {p.gateway}
                      </p>
                    </td>
                    <td className="cv-td text-text-primary">{p.payerName}</td>
                    <td className="cv-td text-status-error">{p.failureReason}</td>
                    <td className="cv-td text-right">
                      <CellValue kind="money" value={p.amount} />
                    </td>
                    <td className="cv-td">
                      <CellValue kind="relative" value={p.createdAt} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
