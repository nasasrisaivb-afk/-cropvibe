'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, ListTodo } from 'lucide-react'
import { getPendingActions, type PendingGroup } from '@/lib/api/insights.api'
import { StatCard, StatGrid } from '@/components/ui/stat-card'
import { Segmented } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/loading'
import { cn } from '@/lib/cn'
import { relativeTime } from '@/lib/utils'

/**
 * One inbox for everything waiting on an admin. Groups are ordered by how many items
 * breach SLA, and each item deep-links straight into the record so it can be actioned.
 */
export function PendingActions() {
  const { data, isLoading } = useQuery({ queryKey: ['pending-actions'], queryFn: getPendingActions, refetchInterval: 30000 })
  const [view, setView] = useState('urgent')

  const groups = useMemo(() => {
    const list = (data ?? []).map((g) => ({
      ...g,
      urgent: g.items.filter((i) => i.urgent).length,
      shown: view === 'urgent' ? g.items.filter((i) => i.urgent) : g.items,
    }))
    return list.sort((a, b) => b.urgent - a.urgent || b.count - a.count)
  }, [data, view])

  const total = groups.reduce((s, g) => s + g.count, 0)
  const urgent = groups.reduce((s, g) => s + g.urgent, 0)
  const oldest = (data ?? [])
    .flatMap((g) => g.items)
    .map((i) => i.waitingSince)
    .sort()[0]

  return (
    <div className="space-y-5">
      <StatGrid>
        <StatCard label="Waiting on an admin" value={total} icon={ListTodo} highlight loading={isLoading} />
        <StatCard label="Urgent or past SLA" value={urgent} hint="Do these first" hintTone="error" icon={AlertTriangle} loading={isLoading} />
        <StatCard label="Oldest item" value={oldest ? relativeTime(oldest).replace(' ago', '') : '—'} hint="waiting" icon={Clock3} loading={isLoading} />
        <StatCard label="Queues clear" value={groups.filter((g) => g.count === 0).length + ` / ${groups.length}`} icon={CheckCircle2} loading={isLoading} />
      </StatGrid>

      <div className="flex items-center justify-between gap-3">
        <Segmented
          ariaLabel="Which items"
          value={view}
          onChange={setView}
          options={[
            { value: 'urgent', label: 'Urgent first' },
            { value: 'all', label: 'Everything' },
          ]}
        />
        <p className="hidden text-sm text-text-secondary sm:block">Updates every 30 seconds</p>
      </div>

      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {groups.map((g) => (
            <QueueCard key={g.key} group={g} urgent={g.urgent} items={g.shown} />
          ))}
        </div>
      )}
    </div>
  )
}

function QueueCard({ group, urgent, items }: { group: PendingGroup; urgent: number; items: PendingGroup['items'] }) {
  return (
    <section className="flex flex-col rounded-xl border border-border-default bg-bg-surface shadow-card" aria-labelledby={`q-${group.key}`}>
      <div className="flex items-start justify-between gap-3 border-b border-border-light px-6 py-4">
        <div>
          <p className="text-xs text-text-muted">{group.module}</p>
          <h2 id={`q-${group.key}`} className="text-base font-semibold text-text-primary">
            {group.label}
          </h2>
          <p className="mt-0.5 text-xs text-text-secondary">SLA {group.slaHours < 48 ? `${group.slaHours}h` : `${group.slaHours / 24} days`}</p>
        </div>
        <div className="flex items-center gap-2">
          {urgent > 0 ? (
            <span className="tabular rounded-full bg-status-error/15 px-2 py-0.5 text-xs font-semibold text-status-error">{urgent} urgent</span>
          ) : null}
          <span className="tabular rounded-full bg-bg-surfaceAlt px-2 py-0.5 text-xs font-semibold text-text-primary">{group.count}</span>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <CheckCircle2 className="h-6 w-6 text-status-success" aria-hidden />
          <p className="mt-2 text-sm text-text-secondary">{group.count === 0 ? 'Queue is clear.' : 'Nothing urgent — switch to “Everything”.'}</p>
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-border-light">
          {items.slice(0, 5).map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="flex items-center gap-3 px-6 py-3 transition hover:bg-bg-surfaceHover">
                <span
                  className={cn('h-2 w-2 shrink-0 rounded-full', item.urgent ? 'bg-status-error' : 'bg-text-muted')}
                  aria-label={item.urgent ? 'Urgent' : undefined}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-text-primary">{item.title}</span>
                  <span className="block truncate text-xs text-text-muted">{item.meta}</span>
                </span>
                <span className="shrink-0 text-xs text-text-secondary">{relativeTime(item.waitingSince)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href={group.href}
        className="flex items-center justify-between border-t border-border-light px-6 py-3 text-sm font-medium text-brand-lime transition hover:bg-bg-surfaceHover"
      >
        View all {group.count} in {group.module}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  )
}
