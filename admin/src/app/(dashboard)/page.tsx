'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/lib/auth-client'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  IndianRupee,
  ListTodo,
  Scale,
  ShieldCheck,
  ShoppingCart,
  Siren,
  TrendingUp,
  Users,
} from 'lucide-react'
import { getOverview } from '@/lib/api/insights.api'
import { StatCard, StatGrid } from '@/components/ui/stat-card'
import { IconTile } from '@/components/ui/icon-tile'
import { Skeleton } from '@/components/ui/loading'
import { ChartCard, TrendChart, BarList } from '@/components/charts/ChartKit'
import { CellValue } from '@/components/resource/cells'
import { cn } from '@/lib/cn'
import { formatInrCompact, formatNumber } from '@/lib/utils'
import type { StatusDef } from '@/lib/resources/types'
import { useMounted } from '@/lib/use-mounted'

const PAYMENT_STATUS: Record<string, StatusDef> = {
  captured: { label: 'Captured', tone: 'success' },
  authorized: { label: 'Authorised', tone: 'info' },
  pending: { label: 'Pending', tone: 'pending' },
  failed: { label: 'Failed', tone: 'error' },
  refunded: { label: 'Refunded', tone: 'default' },
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export default function OverviewPage() {
  const { data: session } = useSession()
  const { data, isLoading } = useQuery({ queryKey: ['overview-v2'], queryFn: getOverview, refetchInterval: 60000 })
  const first = session?.user?.name?.split(' ')[0]
  const mounted = useMounted()

  const headline = data
    ? [
        { label: 'GMV · 30 days', value: formatInrCompact(data.headline.gmv30), trend: data.headline.gmvTrend, icon: IndianRupee, href: '/dashboard/revenue' },
        { label: 'Net revenue · 30 days', value: formatInrCompact(data.headline.revenue30), trend: data.headline.revenueTrend, icon: TrendingUp, href: '/finance/revenue' },
        { label: 'Orders & bookings', value: formatNumber(data.headline.orders30), trend: data.headline.ordersTrend, icon: ShoppingCart, href: '/marketplace/orders' },
        { label: 'Active users', value: formatNumber(data.headline.activeUsers), trend: data.headline.usersTrend, icon: Users, href: '/users' },
      ]
    : []

  return (
    <div className="space-y-5">
      {/* Headline set (Figma "Card 01 | set") */}
      <section className="rounded-xl border border-border-default bg-bg-surface shadow-card" aria-labelledby="headline-title">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light px-6 py-4">
          <div>
            <h2 id="headline-title" className="text-lg font-semibold text-text-primary">
              {mounted ? greeting() : 'Welcome back'}
              {first ? `, ${first}` : ''}
            </h2>
            <p className="text-sm text-text-secondary">
              {mounted ? `${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · ` : ''}
              Rabi sowing season — demand for seeds and fertilizers is up.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border-default px-3 py-1 text-xs text-text-secondary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-lime opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-lime" />
            </span>
            Live
          </span>
        </div>
        <div className="grid grid-cols-1 divide-y divide-border-light sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-4 xl:divide-x">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-6">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-3 h-8 w-32" />
                </div>
              ))
            : headline.map((h, i) => (
                <Link key={h.label} href={h.href} className="group flex items-center gap-4 p-6 transition-colors hover:bg-bg-surfaceHover">
                  <IconTile icon={h.icon} size="lg" active={i === 0} />
                  <div className="min-w-0">
                    <p className="text-sm text-text-secondary">{h.label}</p>
                    <p className="tabular mt-1 text-[1.75rem] font-bold leading-none tracking-tight text-text-primary">{h.value}</p>
                    <p
                      className={cn(
                        'mt-2 inline-flex items-center gap-0.5 text-xs font-semibold',
                        h.trend >= 0 ? 'text-status-success' : 'text-status-error'
                      )}
                    >
                      {h.trend >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      {Math.abs(h.trend)}% <span className="font-normal text-text-muted">vs last month</span>
                    </p>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      {/* Queues that need an admin */}
      <StatGrid>
        <StatCard
          label="Pending actions"
          value={data?.queues.pendingActions ?? ''}
          loading={isLoading}
          icon={ListTodo}
          highlight
          hint="Across all modules"
          href="/dashboard/pending-actions"
        />
        <StatCard
          label="Open alerts"
          value={data?.queues.alerts ?? ''}
          loading={isLoading}
          icon={Siren}
          hint={data?.queues.criticalAlerts ? `${data.queues.criticalAlerts} critical` : 'None critical'}
          hintTone={data?.queues.criticalAlerts ? 'error' : 'success'}
          href="/dashboard/alerts"
        />
        <StatCard
          label="KYC queue"
          value={data?.queues.kyc ?? ''}
          loading={isLoading}
          icon={ShieldCheck}
          hint={data?.queues.kycOverdue ? `${data.queues.kycOverdue} past 48h SLA` : 'Within SLA'}
          hintTone={data?.queues.kycOverdue ? 'warning' : 'success'}
          href="/kyc?status=pending"
        />
        <StatCard
          label="Open disputes"
          value={data?.queues.disputes ?? ''}
          loading={isLoading}
          icon={Scale}
          hint="Orders, services & payments"
          href="/disputes"
        />
      </StatGrid>

      <div className="grid gap-5 xl:grid-cols-12">
        <ChartCard
          className="xl:col-span-5"
          title="Sales by platform"
          description="GMV share by channel, last 30 days"
          series={[{ key: 'value', label: 'GMV' }]}
          data={data?.salesByPlatform.map((p) => ({ platform: p.label, value: p.value }))}
          xKey="platform"
          format={formatInrCompact}
        >
          {data ? <BarList items={data.salesByPlatform} format={formatInrCompact} /> : <Skeleton className="mx-3 h-56" />}
        </ChartCard>
        <ChartCard
          className="xl:col-span-7"
          title="Sales performance"
          description="Monthly GMV — this year against last year"
          series={[
            { key: 'thisYear', label: 'This year' },
            { key: 'lastYear', label: 'Last year', role: 'compare' },
          ]}
          data={data?.salesPerformance}
          xKey="month"
          format={formatInrCompact}
        >
          {data ? (
            <TrendChart
              data={data.salesPerformance}
              xKey="month"
              format={formatInrCompact}
              series={[
                { key: 'thisYear', label: 'This year' },
                { key: 'lastYear', label: 'Last year', role: 'compare' },
              ]}
            />
          ) : (
            <Skeleton className="mx-3 h-60" />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <section className="overflow-hidden rounded-xl border border-border-default bg-bg-surface shadow-card xl:col-span-8">
          <div className="flex items-center justify-between gap-3 border-b border-border-light px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Recent payments</h2>
              <p className="text-sm text-text-secondary">Latest money in, across all gateways</p>
            </div>
            <Link href="/finance/payments" className="inline-flex items-center gap-1 text-sm font-medium text-brand-lime hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="cv-th">Payment</th>
                  <th className="cv-th">Payer</th>
                  <th className="cv-th">Method</th>
                  <th className="cv-th text-right">Amount</th>
                  <th className="cv-th">Status</th>
                  <th className="cv-th">Time</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentPayments ?? []).map((p) => (
                  <tr key={p.id} className="border-b border-border-light last:border-0 hover:bg-bg-surfaceHover">
                    <td className="cv-td">
                      <Link href={`/finance/payments?id=${p.id}`} className="font-mono text-[13px] text-text-secondary hover:text-brand-lime">
                        {p.id}
                      </Link>
                    </td>
                    <td className="cv-td">
                      <CellValue kind="person" value={p.payerName} />
                    </td>
                    <td className="cv-td text-text-secondary">
                      {p.method} · {p.gateway}
                    </td>
                    <td className="cv-td text-right">
                      <CellValue kind="money" value={p.amount} />
                    </td>
                    <td className="cv-td">
                      <CellValue kind="status" value={p.status} statusMap={PAYMENT_STATUS} />
                    </td>
                    <td className="cv-td">
                      <CellValue kind="relative" value={p.createdAt} />
                    </td>
                  </tr>
                ))}
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-6 py-3">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
        </section>

        <ChartCard
          className="xl:col-span-4"
          title="Top categories"
          description="GMV, last 30 days"
          series={[{ key: 'value', label: 'GMV' }]}
          data={data?.topCategories.map((c) => ({ category: c.label, value: c.value }))}
          xKey="category"
          format={formatInrCompact}
        >
          {data ? <BarList items={data.topCategories} format={formatInrCompact} /> : <Skeleton className="mx-3 h-56" />}
        </ChartCard>
      </div>
    </div>
  )
}
