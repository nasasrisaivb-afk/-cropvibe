'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Activity, ShieldCheck, UserCog, Users } from 'lucide-react'
import { getActivityFeed, type FeedItem } from '@/lib/api/insights.api'
import { Segmented } from '@/components/ui/tabs'
import { StatCard, StatGrid } from '@/components/ui/stat-card'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/loading'
import { cn } from '@/lib/cn'
import { formatDateTime, relativeTime, titleCase } from '@/lib/utils'

const MODULE_LABEL: Record<string, string> = {
  marketplace: 'Marketplace',
  operations: 'Bookings & Ops',
  support: 'Support',
  users: 'Users',
  kyc: 'KYC',
  finance: 'Finance',
  trust: 'Trust & Safety',
  services: 'Services',
  settings: 'Settings',
  roles: 'Roles',
  reports: 'Reports',
  dashboard: 'Dashboard',
}

function dayLabel(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const y = new Date(Date.now() - 86400000)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === y.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })
}

/** Unified live feed: what users did on the platform and what admins did in the console. */
export function ActivityFeed() {
  const { data, isLoading } = useQuery({ queryKey: ['activity-feed', 'audit-log'], queryFn: getActivityFeed, refetchInterval: 15000 })
  const [kind, setKind] = useState('all')
  const [module, setModule] = useState('all')

  const items = useMemo(
    () => (data ?? []).filter((i) => (kind === 'all' || i.kind === kind) && (module === 'all' || i.module === module)),
    [data, kind, module]
  )
  const modules = useMemo(() => Array.from(new Set((data ?? []).map((i) => i.module))), [data])

  const groups = useMemo(() => {
    const map = new Map<string, FeedItem[]>()
    items.forEach((i) => {
      const k = dayLabel(i.at)
      map.set(k, [...(map.get(k) ?? []), i])
    })
    return Array.from(map.entries())
  }, [items])

  const lastHour = (data ?? []).filter((i) => Date.now() - new Date(i.at).getTime() < 3600000).length

  return (
    <div className="space-y-5">
      <StatGrid>
        <StatCard label="Events in the last hour" value={lastHour} icon={Activity} highlight loading={isLoading} />
        <StatCard label="Platform events" value={(data ?? []).filter((i) => i.kind === 'platform').length} hint="Orders, bookings, tickets, signups" icon={Users} loading={isLoading} />
        <StatCard label="Admin actions" value={(data ?? []).filter((i) => i.kind === 'admin').length} hint="Recorded in the audit log" icon={UserCog} loading={isLoading} />
        <StatCard
          label="Sensitive admin actions"
          value={(data ?? []).filter((i) => i.severity === 'critical').length}
          hint="Settings, roles, write-offs"
          hintTone="warning"
          icon={ShieldCheck}
          loading={isLoading}
        />
      </StatGrid>

      <section className="rounded-xl border border-border-default bg-bg-surface shadow-card">
        <div className="flex flex-col gap-3 border-b border-border-light px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Segmented
            ariaLabel="Event source"
            value={kind}
            onChange={setKind}
            options={[
              { value: 'all', label: 'Everything' },
              { value: 'platform', label: 'Platform' },
              { value: 'admin', label: 'Admin actions' },
            ]}
          />
          <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1">
            {['all', ...modules].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModule(m)}
                aria-pressed={module === m}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                  module === m
                    ? 'border-brand-lime bg-brand-lime/10 text-brand-lime'
                    : 'border-border-default text-text-secondary hover:text-text-primary'
                )}
              >
                {m === 'all' ? 'All modules' : MODULE_LABEL[m] ?? titleCase(m)}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-4" aria-live="polite">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <p className="py-12 text-center text-sm text-text-muted">No events match these filters.</p>
          ) : (
            groups.map(([day, rows]) => (
              <div key={day} className="mb-6 last:mb-0">
                <h3 className="sticky top-[81px] z-10 -mx-6 mb-2 bg-bg-surface/95 px-6 py-2 text-2xs font-semibold uppercase tracking-wider text-text-muted backdrop-blur">
                  {day}
                </h3>
                <ul className="divide-y divide-border-light">
                  {rows.map((item) => {
                    const body = (
                      <div className="flex items-start gap-3 py-3">
                        <Avatar name={item.actor} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-text-primary">
                            <span className="font-semibold">{item.actor}</span>{' '}
                            <span className="text-text-secondary">{item.text}</span>
                          </p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                            <span
                              className={cn(
                                'rounded px-1.5 py-0.5 font-medium',
                                item.kind === 'admin' ? 'bg-brand-lime/10 text-brand-lime' : 'bg-bg-surfaceAlt text-text-secondary'
                              )}
                            >
                              {item.kind === 'admin' ? 'Admin' : 'Platform'}
                            </span>
                            <span>{MODULE_LABEL[item.module] ?? titleCase(item.module)}</span>
                            <span aria-hidden>·</span>
                            <time dateTime={item.at} title={formatDateTime(item.at)}>
                              {relativeTime(item.at)}
                            </time>
                            {item.severity === 'critical' ? <span className="text-status-warning">· sensitive</span> : null}
                          </p>
                        </div>
                      </div>
                    )
                    return (
                      <li key={item.id}>
                        {item.href ? (
                          <Link href={item.href} className="-mx-3 block rounded-lg px-3 transition hover:bg-bg-surfaceHover">
                            {body}
                          </Link>
                        ) : (
                          body
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
