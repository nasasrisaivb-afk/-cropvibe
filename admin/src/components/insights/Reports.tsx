'use client'

import { useQuery } from '@tanstack/react-query'
import { CalendarCheck, Gauge, IndianRupee, MousePointerClick, PackageCheck, ShoppingCart, Star, Store, Truck } from 'lucide-react'
import { getMarketplaceReport, getOperationsReport } from '@/lib/api/insights.api'
import { STATE_NAMES } from '@/lib/resources/helpers'
import { StatCard, StatGrid } from '@/components/ui/stat-card'
import { Skeleton } from '@/components/ui/loading'
import { BarList, ChartCard, ColumnChart, TrendChart } from '@/components/charts/ChartKit'
import { CellValue } from '@/components/resource/cells'
import { formatInrCompact, formatNumber } from '@/lib/utils'

export function MarketplaceReport() {
  const { data, isLoading } = useQuery({ queryKey: ['marketplace-report'], queryFn: getMarketplaceReport })
  const conversion = data ? ((data.funnel[3]!.value / data.funnel[0]!.value) * 100).toFixed(2) : ''

  return (
    <div className="space-y-5">
      <StatGrid>
        <StatCard label="Category GMV · 30 days" value={data ? formatInrCompact(data.catGmv.reduce((s, c) => s + c.value, 0)) : ''} trend={9.4} icon={IndianRupee} highlight loading={isLoading} />
        <StatCard label="View → order conversion" value={data ? `${conversion}%` : ''} trend={0.4} icon={MousePointerClick} loading={isLoading} />
        <StatCard label="Orders this week" value={data ? formatNumber(data.weekly[data.weekly.length - 1]!.orders) : ''} icon={ShoppingCart} loading={isLoading} />
        <StatCard label="Delivered ÷ placed" value={data ? `${((data.funnel[4]!.value / data.funnel[3]!.value) * 100).toFixed(1)}%` : ''} icon={PackageCheck} loading={isLoading} />
      </StatGrid>

      <div className="grid gap-5 xl:grid-cols-12">
        <ChartCard className="xl:col-span-7" title="Weekly orders" description="Marketplace orders per week — current week highlighted" series={[{ key: 'orders', label: 'Orders' }]} data={data?.weekly} xKey="week" format={formatNumber}>
          {data ? <ColumnChart data={data.weekly} xKey="week" series={[{ key: 'orders', label: 'Orders' }]} format={formatNumber} highlightLast /> : <Skeleton className="mx-3 h-60" />}
        </ChartCard>
        <ChartCard className="xl:col-span-5" title="Conversion funnel" description="Last 30 days, all channels" series={[{ key: 'value', label: 'Users' }]} data={data?.funnel.map((f) => ({ step: f.label, value: f.value }))} xKey="step" format={formatNumber}>
          {data ? <BarList items={data.funnel} format={formatNumber} /> : <Skeleton className="mx-3 h-60" />}
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <ChartCard className="xl:col-span-6" title="GMV by category" series={[{ key: 'value', label: 'GMV' }]} data={data?.catGmv.map((c) => ({ category: c.label, value: c.value }))} xKey="category" format={formatInrCompact}>
          {data ? <BarList items={data.catGmv.slice(0, 8)} format={formatInrCompact} /> : <Skeleton className="mx-3 h-60" />}
        </ChartCard>
        <ChartCard className="xl:col-span-6" title="GMV by state" description="Top 8 states by order value" series={[{ key: 'value', label: 'GMV' }]} data={data?.byState.map((c) => ({ state: STATE_NAMES[c.label] ?? c.label, value: c.value }))} xKey="state" format={formatInrCompact}>
          {data ? <BarList items={data.byState.map((s) => ({ ...s, label: STATE_NAMES[s.label] ?? s.label }))} format={formatInrCompact} /> : <Skeleton className="mx-3 h-60" />}
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <RankTable
          title="Top sellers"
          icon={Store}
          rows={(data?.topSellers ?? []).map((s) => ({ key: s.id, name: s.storeName, sub: s.name, value: formatInrCompact(s.gmv30d), extra: <CellValue kind="rating" value={s.rating} /> }))}
          valueLabel="GMV (30d)"
        />
        <RankTable
          title="Best-selling products"
          icon={Star}
          rows={(data?.topProducts ?? []).map((p) => ({ key: p.id, name: p.name, sub: p.sellerName, value: `${p.orders30d} orders`, extra: <CellValue kind="money" value={p.price} /> }))}
          valueLabel="Orders (30d)"
        />
      </div>
    </div>
  )
}

function RankTable({
  title,
  icon: Icon,
  rows,
  valueLabel,
}: {
  title: string
  icon: typeof Store
  rows: { key: string; name: string; sub: string; value: string; extra: React.ReactNode }[]
  valueLabel: string
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border-default bg-bg-surface shadow-card">
      <div className="flex items-center gap-2 border-b border-border-light px-6 py-4">
        <Icon className="h-4 w-4 text-text-muted" aria-hidden />
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-default">
            <th className="cv-th w-10">#</th>
            <th className="cv-th">Name</th>
            <th className="cv-th text-right">{valueLabel}</th>
            <th className="cv-th text-right">
              <span className="sr-only">Detail</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.key} className="border-b border-border-light last:border-0">
              <td className="cv-td tabular text-text-muted">{i + 1}</td>
              <td className="cv-td">
                <p className="font-medium text-text-primary">{r.name}</p>
                <p className="text-xs text-text-muted">{r.sub}</p>
              </td>
              <td className="cv-td tabular text-right font-semibold text-text-primary">{r.value}</td>
              <td className="cv-td text-right">{r.extra}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export function OperationsReport() {
  const { data, isLoading } = useQuery({ queryKey: ['ops-report'], queryFn: getOperationsReport })
  const slaSeries = [
    { key: 'onTime', label: 'On-time %' },
    { key: 'target', label: 'Target', role: 'compare' as const },
  ]
  return (
    <div className="space-y-5">
      <StatGrid>
        <StatCard label="On-time delivery" value={data ? `${data.kpis.onTime}%` : ''} hint="Target 95%" hintTone={data && data.kpis.onTime < 95 ? 'warning' : 'success'} icon={Truck} highlight loading={isLoading} />
        <StatCard label="Booking completion" value={data ? `${data.kpis.bookingCompletion}%` : ''} icon={CalendarCheck} loading={isLoading} />
        <StatCard label="Machinery utilisation" value={data ? `${data.kpis.avgUtilisation}%` : ''} trend={4.2} icon={Gauge} loading={isLoading} />
        <StatCard label="Active shipments" value={data?.kpis.activeShipments ?? ''} icon={PackageCheck} loading={isLoading} />
      </StatGrid>
      <div className="grid gap-5 xl:grid-cols-12">
        <ChartCard className="xl:col-span-8" title="Delivery SLA" description="Weekly on-time rate against the 95% target" series={slaSeries} data={data?.weekly} xKey="week" format={(v) => `${v}%`}>
          {data ? <TrendChart data={data.weekly} xKey="week" series={slaSeries} format={(v) => `${v}%`} /> : <Skeleton className="mx-3 h-60" />}
        </ChartCard>
        <ChartCard className="xl:col-span-4" title="On-time by carrier" series={[{ key: 'value', label: 'On-time %' }]} data={data?.carriers.map((c) => ({ carrier: c.label, value: c.value }))} xKey="carrier" format={(v) => `${v}%`}>
          {data ? <BarList items={data.carriers} format={(v) => `${v}%`} max={100} /> : <Skeleton className="mx-3 h-60" />}
        </ChartCard>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Bookings by service" description="Last 25 days" series={[{ key: 'value', label: 'Bookings' }]} data={data?.byType.map((t) => ({ service: t.label, value: t.value }))} xKey="service" format={formatNumber}>
          {data ? <BarList items={data.byType} format={formatNumber} /> : <Skeleton className="mx-3 h-60" />}
        </ChartCard>
        <ChartCard title="Utilisation by machine type" description="Share of available hours that were booked" series={[{ key: 'value', label: 'Utilisation %' }]} data={data?.utilisation.map((u) => ({ machine: u.label, value: u.value }))} xKey="machine" format={(v) => `${v}%`}>
          {data ? <BarList items={data.utilisation} format={(v) => `${v}%`} max={100} /> : <Skeleton className="mx-3 h-60" />}
        </ChartCard>
      </div>
    </div>
  )
}
