'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, ShieldCheck, Scale, Bell } from 'lucide-react'
import { getOverviewKpis, getRecentActivity } from '@/lib/api/overview.api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { Skeleton } from '@/components/ui/loading'
import { Avatar } from '@/components/ui/avatar'
import { formatInr, relativeTime } from '@/lib/utils'

const Charts = dynamic(() => import('@/components/dashboard/Charts'), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false,
})

export default function DashboardPage() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: getOverviewKpis,
    refetchInterval: 30000,
  })
  const { data: activity } = useQuery({
    queryKey: ['activity'],
    queryFn: getRecentActivity,
    refetchInterval: 5000,
  })

  const cards = [
    {
      label: 'Total Users',
      value: kpis?.totalUsers,
      change: kpis?.usersChangeMtd,
      href: '/users',
    },
    {
      label: 'Active Listings',
      value: kpis?.activeListings,
      change: kpis?.listingsChangeMtd,
      href: '/listings?status=active',
    },
    {
      label: 'Pending KYC',
      value: kpis?.pendingKyc,
      urgent: kpis?.urgentKyc,
      href: '/kyc?status=pending',
    },
    {
      label: 'Active Subscriptions',
      value: kpis?.activeSubscriptions,
      href: '/subscriptions?status=active',
    },
    {
      label: 'Monthly GMV',
      value: kpis ? formatInr(kpis.monthlyGmv) : undefined,
      href: '/transactions',
    },
    {
      label: 'Open Disputes',
      value: kpis?.openDisputes,
      warn: true,
      href: '/disputes?status=!resolved',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Last updated {new Date().toLocaleTimeString('en-IN')} · live
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card hover className="h-full">
              <CardContent className="space-y-2">
                <p className="text-sm text-text-secondary">{card.label}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-3xl font-bold text-text-primary">{card.value ?? '—'}</p>
                )}
                {card.change != null ? (
                  <p className="flex items-center gap-1 text-xs text-status-success">
                    <ArrowUpRight className="h-3 w-3" /> {card.change}% MTD
                  </p>
                ) : null}
                {card.urgent != null && card.urgent > 0 ? (
                  <p className="text-xs font-medium text-status-error">{card.urgent} urgent</p>
                ) : null}
                {card.warn && (kpis?.openDisputes ?? 0) > 0 ? (
                  <p className="text-xs text-status-warning">Needs review</p>
                ) : null}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {kpis ? <Charts kpis={kpis} /> : <Skeleton className="h-72 w-full" />}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-semibold text-text-primary">Recent Activity</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {!activity ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : (
              activity.map((item) => (
                <Link
                  key={item.id}
                  href={item.href ?? '#'}
                  className="flex items-start gap-3 rounded-lg p-2 hover:bg-bg-surfaceHover"
                >
                  <Avatar name={item.actorName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary">{item.description}</p>
                    <p className="text-xs text-text-muted">{relativeTime(item.createdAt)}</p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-text-primary">Quick Actions</h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link
              href="/kyc?status=pending"
              className={cn(buttonVariants({ variant: 'secondary' }), 'justify-start')}
            >
              <ShieldCheck className="h-4 w-4" /> Review KYC Applications
            </Link>
            <Link
              href="/disputes?status=!resolved"
              className={cn(buttonVariants({ variant: 'secondary' }), 'justify-start')}
            >
              <Scale className="h-4 w-4" /> Resolve Disputes
            </Link>
            <Link
              href="/notifications"
              className={cn(buttonVariants({ variant: 'secondary' }), 'justify-start')}
            >
              <Bell className="h-4 w-4" /> Send Bulk Notification
            </Link>
          </CardContent>
        </Card>
      </div>

      {kpis ? (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-text-primary">Regional Activity</h2>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-text-secondary">
                  <tr className="border-b border-border-light">
                    <th className="px-2 py-2 text-left font-medium">State</th>
                    <th className="px-2 py-2 text-left font-medium">Activity</th>
                    <th className="px-2 py-2 text-left font-medium">GMV</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.regionalActivity.map((r) => (
                    <tr key={r.state} className="border-b border-border-light">
                      <td className="px-2 py-2">{r.state}</td>
                      <td className="px-2 py-2">{r.activity}</td>
                      <td className="px-2 py-2 font-mono">{formatInr(r.gmv)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
