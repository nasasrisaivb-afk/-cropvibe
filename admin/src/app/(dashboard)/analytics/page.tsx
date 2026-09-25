'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, IndianRupee, UserMinus, UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'
import { getAnalytics } from '@/lib/api/analytics.api'
import { STATE_NAMES } from '@/lib/resources/helpers'
import { StatCard, StatGrid } from '@/components/ui/stat-card'
import { Segmented } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/loading'
import { BarList, ChartCard, ColumnChart, TrendChart } from '@/components/charts/ChartKit'
import { downloadCsv, formatInrCompact, formatNumber } from '@/lib/utils'

export default function AnalyticsPage() {
  const [range, setRange] = useState('30')
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', range],
    queryFn: () => getAnalytics(new Date(Date.now() - Number(range) * 86400000).toISOString(), new Date().toISOString()),
  })

  const acquisition = data?.userAcquisition.map((d) => ({ date: d.date.slice(5), users: d.count })) ?? []
  const gmv = data?.gmvTrend.map((d) => ({ date: d.date.slice(5), gmv: d.amount })) ?? []

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          ariaLabel="Date range"
          value={range}
          onChange={setRange}
          options={[
            { value: '7', label: 'Last 7 days' },
            { value: '30', label: 'Last 30 days' },
            { value: '90', label: 'Last 90 days' },
          ]}
        />
        <Button
          variant="secondary"
          disabled={!data}
          onClick={() => {
            if (!data) return
            downloadCsv('analytics-regional.csv', data.regional.map((r) => ({ ...r })))
            toast.success('Exported regional analytics')
          }}
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <StatGrid>
        <StatCard label="New users" value={data ? formatNumber(data.newUsers) : ''} trend={data?.newUsersChange} icon={UserPlus} highlight loading={isLoading} />
        <StatCard label="Active users" value={data ? formatNumber(data.activeUsers) : ''} trend={data?.activeUsersChange} icon={Users} loading={isLoading} />
        <StatCard label="GMV" value={data ? formatInrCompact(data.gmv) : ''} trend={data?.gmvChange} icon={IndianRupee} loading={isLoading} />
        <StatCard label="Subscription churn" value={data ? `${data.churnRate}%` : ''} hint="Cancelled ÷ all subscriptions" icon={UserMinus} loading={isLoading} />
      </StatGrid>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="User acquisition" description="New sign-ups per day" series={[{ key: 'users', label: 'New users' }]} data={acquisition} xKey="date" format={formatNumber}>
          {data ? <TrendChart data={acquisition} xKey="date" series={[{ key: 'users', label: 'New users' }]} format={formatNumber} /> : <Skeleton className="mx-3 h-60" />}
        </ChartCard>
        <ChartCard title="GMV trend" description="Completed payment value per day" series={[{ key: 'gmv', label: 'GMV' }]} data={gmv} xKey="date" format={formatInrCompact}>
          {data ? <ColumnChart data={gmv} xKey="date" series={[{ key: 'gmv', label: 'GMV' }]} format={formatInrCompact} /> : <Skeleton className="mx-3 h-60" />}
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <section className="overflow-hidden rounded-xl border border-border-default bg-bg-surface shadow-card xl:col-span-7">
          <div className="border-b border-border-light px-6 py-4">
            <h2 className="text-base font-semibold text-text-primary">Regional performance</h2>
            <p className="text-sm text-text-secondary">Users, GMV and churn by state</p>
          </div>
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="cv-th text-left">State</th>
                  <th className="cv-th text-right">Users</th>
                  <th className="cv-th text-right">GMV</th>
                  <th className="cv-th text-right">Churn</th>
                </tr>
              </thead>
              <tbody>
                {(data?.regional ?? []).map((r) => (
                  <tr key={r.state} className="border-b border-border-light last:border-0 hover:bg-bg-surfaceHover">
                    <td className="cv-td text-text-primary">{STATE_NAMES[r.state] ?? r.state}</td>
                    <td className="cv-td tabular text-right">{formatNumber(r.users)}</td>
                    <td className="cv-td tabular text-right">{formatInrCompact(r.gmv)}</td>
                    <td className="cv-td tabular text-right text-text-secondary">{r.churn}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <ChartCard
          className="xl:col-span-5"
          title="Most viewed listings"
          series={[{ key: 'views', label: 'Views' }]}
          data={data?.topListings.map((l) => ({ listing: l.title, views: l.views }))}
          xKey="listing"
          format={formatNumber}
        >
          {data ? <BarList items={data.topListings.map((l) => ({ label: l.title, value: l.views }))} format={formatNumber} /> : <Skeleton className="mx-3 h-60" />}
        </ChartCard>
      </div>
    </div>
  )
}
