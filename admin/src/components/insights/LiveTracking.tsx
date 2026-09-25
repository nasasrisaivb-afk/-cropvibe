'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ArrowRight, Navigation, Radio, Search, Truck } from 'lucide-react'
import { listRecords } from '@/lib/api/resources.api'
import type { Delivery } from '@/lib/types/ops'
import { DELIVERY_STATUS } from '@/lib/resources/operations'
import { StatCard, StatGrid } from '@/components/ui/stat-card'
import { Segmented } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/loading'
import { cn } from '@/lib/cn'
import { formatDateTime, relativeDue, relativeTime } from '@/lib/utils'

const ACTIVE: Delivery['status'][] = ['awaiting_pickup', 'in_transit', 'out_for_delivery', 'delayed', 'failed']

function position(d: Delivery) {
  const t = d.progress / 100
  return { x: d.from.x + (d.to.x - d.from.x) * t, y: d.from.y + (d.to.y - d.from.y) * t }
}

/**
 * Live tracking. The map is a schematic of India's agri corridors (not geographic
 * tiles) — enough to see where trips are and which lanes are in trouble.
 */
export function LiveTracking() {
  const router = useRouter()
  const params = useSearchParams()
  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['resource', 'deliveries'],
    queryFn: () => listRecords<Delivery>('deliveries'),
    refetchInterval: 20000,
  })
  const [view, setView] = useState('active')
  const [q, setQ] = useState('')
  const selectedId = params.get('id')

  const trips = useMemo(() => {
    let rows = (data ?? []).filter((d) => (view === 'active' ? ACTIVE.includes(d.status) : view === 'attention' ? d.status === 'delayed' || d.status === 'failed' : true))
    const term = q.trim().toLowerCase()
    if (term) rows = rows.filter((d) => `${d.id} ${d.orderId} ${d.origin} ${d.destination} ${d.driverName} ${d.vehicleNo} ${d.carrier}`.toLowerCase().includes(term))
    return rows.sort((a, b) => Number(b.status === 'delayed' || b.status === 'failed') - Number(a.status === 'delayed' || a.status === 'failed'))
  }, [data, view, q])

  const selected = (data ?? []).find((d) => d.id === selectedId) ?? null
  const select = (id: string | null) => router.replace(id ? `/operations/tracking?id=${id}` : '/operations/tracking', { scroll: false })

  const all = data ?? []
  const stale = all.filter((d) => ACTIVE.includes(d.status) && Date.now() - new Date(d.lastPing).getTime() > 60 * 60000).length

  return (
    <div className="space-y-5">
      <StatGrid>
        <StatCard label="Trips on the road" value={all.filter((d) => d.status === 'in_transit' || d.status === 'out_for_delivery').length} icon={Truck} highlight loading={isLoading} />
        <StatCard label="Awaiting pickup" value={all.filter((d) => d.status === 'awaiting_pickup').length} icon={Navigation} loading={isLoading} />
        <StatCard label="Delayed or failed" value={all.filter((d) => d.status === 'delayed' || d.status === 'failed').length} hintTone="error" hint="Customers notified" icon={AlertTriangle} loading={isLoading} />
        <StatCard label="No GPS ping > 1h" value={stale} hint="Call the driver" hintTone={stale ? 'warning' : 'success'} icon={Radio} loading={isLoading} />
      </StatGrid>

      <div className="grid gap-5 xl:grid-cols-12">
        {/* Map */}
        <section className="rounded-xl border border-border-default bg-bg-surface shadow-card xl:col-span-8" aria-label="Trip map">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Live map</h2>
              <p className="text-sm text-text-secondary">
                Updated {dataUpdatedAt ? relativeTime(new Date(dataUpdatedAt).toISOString()) : '—'} · refreshes every 20s
              </p>
            </div>
            <ul className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
              <li className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-lime" aria-hidden /> Moving
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-status-warning" aria-hidden /> Delayed / failed
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full border border-text-muted" aria-hidden /> Awaiting pickup
              </li>
            </ul>
          </div>
          <div className="p-4">
            {isLoading ? (
              <Skeleton className="aspect-square max-h-[620px] w-full" />
            ) : (
              <svg viewBox="0 0 100 100" className="mx-auto aspect-square max-h-[620px] w-full rounded-lg bg-bg-inset" role="img" aria-label={`${trips.length} trips shown on a schematic map`}>
                <defs>
                  <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
                    <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#2A2A2A" strokeWidth="0.15" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
                {/* India outline — equirectangular projection of ~50 border points */}
                <path
                  d="M22.4 0.0 L33.8 5.2 L37.9 15.5 L43.1 23.4 L55.2 33.4 L69.0 35.2 L71.7 30.7 L82.8 31.7 L94.8 27.6 L100.0 31.0 L93.1 37.9 L91.7 44.8 L86.2 51.7 L83.8 46.6 L82.8 43.1 L75.9 40.7 L72.4 40.3 L71.4 44.1 L72.4 51.7 L65.5 53.4 L63.8 58.6 L58.6 61.4 L51.7 66.6 L48.3 70.7 L42.4 74.1 L42.1 82.8 L40.7 92.1 L35.2 96.9 L32.8 99.7 L29.3 96.6 L26.9 87.9 L23.4 82.8 L20.7 75.9 L18.3 69.0 L16.6 62.1 L16.2 55.2 L14.5 53.4 L6.9 55.2 L2.8 50.7 L5.2 48.3 L0.7 46.2 L8.6 43.8 L10.3 43.1 L6.9 37.9 L8.6 31.7 L13.8 29.3 L19.0 24.1 L22.4 20.7 L23.4 15.5 L20.7 10.3 Z"
                  fill="#202020"
                  stroke="#333333"
                  strokeWidth="0.4"
                />
                {trips.map((d) => {
                  const p = position(d)
                  const warn = d.status === 'delayed' || d.status === 'failed'
                  const isSel = d.id === selectedId
                  return (
                    <g key={d.id}>
                      <line
                        x1={d.from.x}
                        y1={d.from.y}
                        x2={d.to.x}
                        y2={d.to.y}
                        stroke={isSel ? '#CCFF00' : '#3D3D3D'}
                        strokeWidth={isSel ? 0.5 : 0.3}
                      />
                      <circle cx={d.to.x} cy={d.to.y} r={0.7} fill="#6E6E6E" />
                      <g
                        role="button"
                        tabIndex={0}
                        aria-label={`${d.id}, ${d.origin} to ${d.destination}, ${DELIVERY_STATUS[d.status].label}`}
                        onClick={() => select(d.id)}
                        onKeyDown={(e) => e.key === 'Enter' && select(d.id)}
                        className="cursor-pointer outline-none"
                      >
                        <circle cx={p.x} cy={p.y} r={3} fill="transparent" />
                        {isSel ? <circle cx={p.x} cy={p.y} r={2.6} fill="none" stroke="#CCFF00" strokeWidth={0.4} /> : null}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isSel ? 1.6 : 1.2}
                          fill={d.status === 'awaiting_pickup' ? '#1F1F1F' : warn ? '#FBBF24' : '#CCFF00'}
                          stroke={d.status === 'awaiting_pickup' ? '#8F8F8F' : '#242424'}
                          strokeWidth={0.4}
                        />
                      </g>
                    </g>
                  )
                })}
              </svg>
            )}
          </div>
          {selected ? (
            <div className="grid gap-4 border-t border-border-light px-6 py-4 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <p className="text-xs text-text-muted">
                  {selected.id} · {selected.orderId}
                </p>
                <p className="font-semibold text-text-primary">
                  {selected.origin} → {selected.destination}
                </p>
                <p className="text-sm text-text-secondary">
                  {selected.driverName} · {selected.vehicleNo} · {selected.carrier}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">ETA</p>
                <p className="text-sm text-text-primary">{formatDateTime(selected.eta)}</p>
                <p className="text-xs text-text-secondary">{relativeDue(selected.eta).label}</p>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <Badge variant={DELIVERY_STATUS[selected.status].tone} showIcon>
                  {DELIVERY_STATUS[selected.status].label}
                </Badge>
                <Link href={`/operations/deliveries?id=${selected.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-lime hover:underline">
                  Manage shipment <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : null}
        </section>

        {/* Trip list */}
        <section className="flex max-h-[760px] flex-col rounded-xl border border-border-default bg-bg-surface shadow-card xl:col-span-4" aria-label="Trips">
          <div className="space-y-3 border-b border-border-light p-4">
            <Segmented
              ariaLabel="Trips to show"
              value={view}
              onChange={setView}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'attention', label: 'Attention' },
                { value: 'all', label: 'All' },
              ]}
            />
            <label className="relative block">
              <span className="sr-only">Search trips</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Vehicle, driver, order or city…" className="cv-control h-9 pl-9" />
            </label>
          </div>
          <ul className="scrollbar-thin flex-1 divide-y divide-border-light overflow-y-auto">
            {trips.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => select(d.id)}
                  aria-pressed={d.id === selectedId}
                  className={cn('w-full px-4 py-3 text-left transition hover:bg-bg-surfaceHover', d.id === selectedId && 'bg-brand-lime/5')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {d.origin} → {d.destination}
                    </p>
                    <Badge variant={DELIVERY_STATUS[d.status].tone}>{DELIVERY_STATUS[d.status].label}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-text-muted">
                    {d.vehicleNo} · {d.driverName} · ping {relativeTime(d.lastPing)}
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-bg-elevated">
                    <div className={cn('h-full rounded-full', d.status === 'delayed' || d.status === 'failed' ? 'bg-status-warning' : 'bg-brand-lime')} style={{ width: `${d.progress}%` }} />
                  </div>
                </button>
              </li>
            ))}
            {!isLoading && trips.length === 0 ? <li className="px-4 py-10 text-center text-sm text-text-muted">No trips match.</li> : null}
          </ul>
        </section>
      </div>
    </div>
  )
}
