'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAnalytics } from '@/lib/api/analytics.api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/loading'
import { formatInr, downloadCsv } from '@/lib/utils'

const AnalyticsCharts = dynamic(() => import('@/components/analytics/Charts'), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
})

export default function AnalyticsPage() {
  const [range, setRange] = useState<'7' | '30' | '90'>('30')
  const from = new Date(Date.now() - Number(range) * 86400000).toISOString()
  const to = new Date().toISOString()

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', range],
    queryFn: () => getAnalytics(from, to),
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex gap-2">
          {(['7', '30', '90'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-full px-3 py-1 text-xs ${
                range === r ? 'bg-brand-lime text-text-inverse' : 'bg-bg-surfaceAlt text-text-secondary'
              }`}
            >
              Last {r} days
            </button>
          ))}
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              data &&
              downloadCsv(
                'analytics-regional.csv',
                data.regional.map((r) => ({ ...r }))
              )
            }
          >
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'New Users', value: data?.newUsers, change: data?.newUsersChange },
          { label: 'Active Users', value: data?.activeUsers, change: data?.activeUsersChange },
          { label: 'GMV', value: data ? formatInr(data.gmv) : undefined, change: data?.gmvChange },
          { label: 'Churn Rate', value: data ? `${data.churnRate}%` : undefined },
        ].map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-5">
              <p className="text-sm text-text-secondary">{c.label}</p>
              {isLoading ? <Skeleton className="mt-2 h-8 w-20" /> : <p className="text-2xl font-bold">{c.value ?? '—'}</p>}
              {c.change != null ? <p className="text-xs text-status-success">↑ {c.change}% MTD</p> : null}
            </CardContent>
          </Card>
        ))}
      </div>

      {data ? <AnalyticsCharts data={data} /> : <Skeleton className="h-72 w-full" />}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><h2 className="font-semibold">Regional Performance</h2></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-text-secondary">
                <tr className="border-b border-border-light">
                  <th className="px-2 py-2 text-left">State</th>
                  <th className="px-2 py-2 text-left">Users</th>
                  <th className="px-2 py-2 text-left">GMV</th>
                  <th className="px-2 py-2 text-left">Churn %</th>
                </tr>
              </thead>
              <tbody>
                {(data?.regional ?? []).map((r) => (
                  <tr key={r.state} className="border-b border-border-light">
                    <td className="px-2 py-2">{r.state}</td>
                    <td className="px-2 py-2">{r.users}</td>
                    <td className="px-2 py-2 font-mono">{formatInr(r.gmv)}</td>
                    <td className="px-2 py-2">{r.churn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Top Listings</h2></CardHeader>
          <CardContent className="space-y-2">
            {(data?.topListings ?? []).map((l, i) => (
              <div key={l.id} className="flex justify-between rounded-lg border border-border-light p-2 text-sm">
                <span>{i + 1}. {l.title}</span>
                <span className="text-text-muted">{l.views} views</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
