'use client'

import { useQuery } from '@tanstack/react-query'
import { Activity, Gauge, ServerCrash, Smile } from 'lucide-react'
import { getPlatformPerformance } from '@/lib/api/insights.api'
import { StatCard, StatGrid } from '@/components/ui/stat-card'
import { Skeleton } from '@/components/ui/loading'
import { Badge } from '@/components/ui/badge'
import { BarList, ChartCard, TrendChart } from '@/components/charts/ChartKit'
import { relativeTime } from '@/lib/utils'

export function PlatformPerformance() {
  const { data, isLoading } = useQuery({ queryKey: ['performance'], queryFn: getPlatformPerformance, refetchInterval: 30000 })
  const latencySeries = [
    { key: 'p95', label: 'p95' },
    { key: 'p50', label: 'p50', role: 'compare' as const },
  ]
  const degraded = data?.services.filter((s) => s.status !== 'operational').length ?? 0

  return (
    <div className="space-y-5">
      <StatGrid>
        <StatCard label="Uptime · 30 days" value={data ? `${data.uptime30d}%` : ''} hint="SLO 99.9%" hintTone="success" icon={Activity} highlight loading={isLoading} />
        <StatCard label="API p95 now" value={data ? `${data.latency[data.latency.length - 1]!.p95}ms` : ''} hint="Budget 800ms" icon={Gauge} loading={isLoading} />
        <StatCard label="Services degraded" value={degraded} hintTone={degraded ? 'warning' : 'success'} hint={degraded ? 'See incidents' : 'All operational'} icon={ServerCrash} loading={isLoading} />
        <StatCard label="Apdex" value={data?.apdex ?? ''} hint="User-perceived speed" icon={Smile} loading={isLoading} />
      </StatGrid>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="API latency" description="Milliseconds, last 24 hours" series={latencySeries} data={data?.latency} xKey="hour" format={(v) => `${v}ms`}>
          {data ? <TrendChart data={data.latency} xKey="hour" series={latencySeries} format={(v) => `${v}ms`} /> : <Skeleton className="mx-3 h-60" />}
        </ChartCard>
        <ChartCard title="Error rate" description="5xx as % of requests, last 24 hours" series={[{ key: 'rate', label: 'Error %' }]} data={data?.errors} xKey="hour" format={(v) => `${v}%`}>
          {data ? <TrendChart data={data.errors} xKey="hour" series={[{ key: 'rate', label: 'Error %' }]} format={(v) => `${v}%`} /> : <Skeleton className="mx-3 h-60" />}
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <section className="overflow-hidden rounded-xl border border-border-default bg-bg-surface shadow-card xl:col-span-7">
          <div className="border-b border-border-light px-6 py-4">
            <h2 className="text-base font-semibold text-text-primary">Services</h2>
            <p className="text-sm text-text-secondary">Status, 30-day uptime and p95 latency</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default">
                <th className="cv-th">Service</th>
                <th className="cv-th">Status</th>
                <th className="cv-th text-right">Uptime</th>
                <th className="cv-th text-right">p95</th>
              </tr>
            </thead>
            <tbody>
              {(data?.services ?? []).map((s) => (
                <tr key={s.name} className="border-b border-border-light last:border-0">
                  <td className="cv-td font-medium text-text-primary">{s.name}</td>
                  <td className="cv-td">
                    <Badge variant={s.status === 'operational' ? 'success' : 'warning'} showIcon>
                      {s.status === 'operational' ? 'Operational' : 'Degraded'}
                    </Badge>
                  </td>
                  <td className="cv-td tabular text-right">{s.uptime}%</td>
                  <td className="cv-td tabular text-right text-text-secondary">{s.p95}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-xl border border-border-default bg-bg-surface shadow-card xl:col-span-5">
          <div className="border-b border-border-light px-6 py-4">
            <h2 className="text-base font-semibold text-text-primary">Incidents</h2>
          </div>
          <ul className="divide-y divide-border-light">
            {(data?.incidents ?? []).map((i) => (
              <li key={i.id} className="px-6 py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-text-primary">{i.title}</p>
                  <Badge variant={i.status === 'Resolved' ? 'success' : i.severity === 'SEV-2' ? 'error' : 'warning'}>{i.severity}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-text-muted">
                  {i.id} · started {relativeTime(i.started)} · {i.status}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <ChartCard title="Mobile app health" description="Farmers mostly use low-end Android phones on 3G/4G" series={[{ key: 'value', label: '%' }]} data={data?.app.map((a) => ({ metric: a.label, value: a.value }))} xKey="metric" format={(v) => `${v}%`}>
        {data ? <BarList items={data.app} format={(v) => `${v}%`} max={100} /> : <Skeleton className="mx-3 h-40" />}
      </ChartCard>
    </div>
  )
}
