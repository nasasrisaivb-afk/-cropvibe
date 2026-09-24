'use client'

import { useQuery } from '@tanstack/react-query'
import { CircleDollarSign, IndianRupee, Percent, Repeat } from 'lucide-react'
import { getRevenueInsights } from '@/lib/api/insights.api'
import { StatCard, StatGrid } from '@/components/ui/stat-card'
import { Skeleton } from '@/components/ui/loading'
import { BarList, ChartCard, ColumnChart, TrendChart } from '@/components/charts/ChartKit'
import { formatInrCompact } from '@/lib/utils'

export function RevenueInsights() {
  const { data, isLoading } = useQuery({ queryKey: ['revenue-insights'], queryFn: getRevenueInsights })
  const monthlySeries = [
    { key: 'revenue', label: 'This year' },
    { key: 'lastYear', label: 'Last year', role: 'compare' as const },
  ]

  return (
    <div className="space-y-5">
      <StatGrid>
        <StatCard label="Revenue · last 12 months" value={data ? formatInrCompact(data.total12m) : ''} trend={41.2} icon={IndianRupee} highlight loading={isLoading} />
        <StatCard label="Effective take rate" value={data ? `${data.takeRateOverall}%` : ''} hint="Commission + fees ÷ GMV" icon={Percent} loading={isLoading} />
        <StatCard label="Subscription MRR" value={data ? formatInrCompact(data.mrrSubscriptions) : ''} trend={6.4} icon={Repeat} loading={isLoading} />
        <StatCard label="Revenue per user / month" value={data ? `₹${data.arpu}` : ''} icon={CircleDollarSign} loading={isLoading} />
      </StatGrid>

      <div className="grid gap-5 xl:grid-cols-12">
        <ChartCard
          className="xl:col-span-8"
          title="Revenue performance"
          description="Monthly net revenue, this year against last year"
          series={monthlySeries}
          data={data?.monthly}
          xKey="month"
          format={formatInrCompact}
        >
          {data ? <TrendChart data={data.monthly} xKey="month" series={monthlySeries} format={formatInrCompact} /> : <Skeleton className="mx-3 h-60" />}
        </ChartCard>
        <ChartCard
          className="xl:col-span-4"
          title="Revenue by stream"
          description="Last 90 days, annualised"
          series={[{ key: 'value', label: 'Revenue' }]}
          data={data?.byStream.map((s) => ({ stream: s.label, value: s.value }))}
          xKey="stream"
          format={formatInrCompact}
        >
          {data ? <BarList items={data.byStream} format={formatInrCompact} /> : <Skeleton className="mx-3 h-60" />}
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <ChartCard
          className="xl:col-span-7"
          title="Growth · yearly"
          description="Net revenue by financial year — the current year is highlighted"
          series={[{ key: 'revenue', label: 'Revenue' }]}
          data={data?.yearly}
          xKey="year"
          format={formatInrCompact}
        >
          {data ? (
            <ColumnChart data={data.yearly} xKey="year" series={[{ key: 'revenue', label: 'Revenue' }]} format={formatInrCompact} highlightLast />
          ) : (
            <Skeleton className="mx-3 h-60" />
          )}
        </ChartCard>
        <ChartCard
          className="xl:col-span-5"
          title="Commission by category"
          description="Current take rate per top-level category"
          series={[{ key: 'value', label: 'Commission %' }]}
          data={data?.takeRateByCategory.map((c) => ({ category: c.label, value: c.value }))}
          xKey="category"
          format={(v) => `${v}%`}
        >
          {data ? <BarList items={data.takeRateByCategory} format={(v) => `${v}%`} max={10} /> : <Skeleton className="mx-3 h-60" />}
        </ChartCard>
      </div>
    </div>
  )
}

/** Compact chart shown above the Finance › Revenue ledger. */
export function RevenueLedgerIntro() {
  const { data } = useQuery({ queryKey: ['revenue-insights'], queryFn: getRevenueInsights })
  const series = [
    { key: 'revenue', label: 'This year' },
    { key: 'lastYear', label: 'Last year', role: 'compare' as const },
  ]
  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <ChartCard className="xl:col-span-8" title="Monthly revenue" series={series} data={data?.monthly} xKey="month" format={formatInrCompact} height={220}>
        {data ? <TrendChart data={data.monthly} xKey="month" series={series} format={formatInrCompact} height={220} /> : <Skeleton className="mx-3 h-52" />}
      </ChartCard>
      <ChartCard className="xl:col-span-4" title="By stream" series={[{ key: 'value', label: 'Revenue' }]} data={data?.byStream.map((s) => ({ stream: s.label, value: s.value }))} xKey="stream" format={formatInrCompact} height={220}>
        {data ? <BarList items={data.byStream.slice(0, 5)} format={formatInrCompact} /> : <Skeleton className="mx-3 h-52" />}
      </ChartCard>
    </div>
  )
}
