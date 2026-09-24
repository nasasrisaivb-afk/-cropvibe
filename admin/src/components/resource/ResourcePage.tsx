'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Download,
  Eye,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { listRecords, updateRecord, createRecord, nextId } from '@/lib/api/resources.api'
import type { ActionInput, BaseRecord, ResourceAction, ResourceConfig } from '@/lib/resources/types'
import { usePermission, useActor } from '@/lib/rbac'
import { Button } from '@/components/ui/button'
import { StatCard, StatGrid } from '@/components/ui/stat-card'
import { UnderlineTabs } from '@/components/ui/tabs'
import { FilterSelect } from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown'
import { CellValue, plainValue } from './cells'
import { ActionDialog } from './ActionDialog'
import { CreateDialog } from './CreateDialog'
import { RecordDrawer } from './RecordDrawer'
import { cn } from '@/lib/cn'
import { downloadCsv, formatNumber } from '@/lib/utils'

const hideClass = { md: 'hidden md:table-cell', lg: 'hidden lg:table-cell', xl: 'hidden xl:table-cell' }

export function ResourcePage<T extends BaseRecord>({
  config,
  intro,
  outro,
  toolbar,
}: {
  config: ResourceConfig<T>
  /** Extra page-level buttons next to Export (e.g. a link to a full editor) */
  toolbar?: React.ReactNode
  /** Bespoke content between the KPIs and the list (charts, maps…) */
  intro?: React.ReactNode
  outro?: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const qc = useQueryClient()
  const perm = usePermission(config.module)
  const actor = useActor()

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['resource', config.collection],
    queryFn: () => listRecords<T>(config.collection),
  })

  /* ── URL-backed state: tab, search and open record survive refresh and can be shared ── */
  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString())
      if (value == null || value === '') next.delete(key)
      else next.set(key, value)
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [params, pathname, router]
  )

  const scoped = useMemo(() => (data ?? []).filter((r) => (config.scope ? config.scope(r) : true)), [data, config])

  const tabs = useMemo(() => {
    if (config.tabs) return config.tabs
    if (!config.status) return []
    const status = config.status
    return [
      { value: 'all', label: 'All' },
      ...Object.entries(status.map).map(([value, def]) => ({
        value,
        label: def.label,
        match: (r: T) => status.value(r) === value,
      })),
    ]
  }, [config])

  const tabCounts = useMemo(
    () => Object.fromEntries(tabs.map((t) => [t.value, t.match ? scoped.filter(t.match).length : scoped.length])),
    [tabs, scoped]
  )

  const tab = params.get('tab') ?? tabs[0]?.value ?? 'all'
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(config.defaultSort ?? null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pending, setPending] = useState<{ action: ResourceAction<T>; rows: T[] } | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  // Reset paging/selection whenever the result set changes shape
  useEffect(() => {
    setPage(1)
    setSelected(new Set())
  }, [tab, query, filters])

  const rows = useMemo(() => {
    const activeTab = tabs.find((t) => t.value === tab)
    let list = activeTab?.match ? scoped.filter(activeTab.match) : scoped
    for (const f of config.filters ?? []) {
      const v = filters[f.key]
      if (v && v !== 'all') list = list.filter((r) => f.match(r, v))
    }
    const q = query.trim().toLowerCase()
    if (q) list = list.filter((r) => `${r.id} ${config.searchText(r)}`.toLowerCase().includes(q))
    if (sort) {
      const col = config.columns.find((c) => c.key === sort.key)
      if (col) {
        list = [...list].sort((a, b) => {
          const av = plainValue(col.value(a))
          const bv = plainValue(col.value(b))
          const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
          return sort.dir === 'asc' ? cmp : -cmp
        })
      }
    }
    return list
  }, [scoped, tabs, tab, config, filters, query, sort])

  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)
  const openId = params.get('id')
  const openRow = openId ? (scoped.find((r) => r.id === openId) ?? null) : null

  const allowed = useCallback(
    (a: ResourceAction<T>, row: T) => {
      const need = a.permission ?? 'edit'
      const ok = need === 'create' ? perm.canCreate : need === 'delete' ? perm.canDelete : perm.canEdit
      return ok && (!a.when || a.when(row))
    },
    [perm]
  )

  const bulkActions = (config.actions ?? []).filter((a) => a.bulk)
  const selectable = bulkActions.length > 0 && perm.canEdit
  const selectedRows = scoped.filter((r) => selected.has(r.id))

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['resource', config.collection] })
    void qc.invalidateQueries({ queryKey: ['nav-badges'] })
    void qc.invalidateQueries({ queryKey: ['audit-log'] })
    void qc.invalidateQueries({ queryKey: ['pending-actions'] })
  }

  const actionMut = useMutation({
    mutationFn: async ({ action, rows: targets, input }: { action: ResourceAction<T>; rows: T[]; input: ActionInput }) => {
      const results = []
      for (const row of targets) {
        const result = action.run(row, input)
        const note = [input.reason, input.note].filter(Boolean).join(' — ') || undefined
        await updateRecord<T>(config.collection, row.id, result.patch, {
          actor,
          action: result.audit,
          note,
          module: config.module,
          entity: config.entity,
          href: `${pathname}?id=${row.id}`,
          severity: result.severity,
        })
        results.push(result)
      }
      return results
    },
    onSuccess: (results, { action, rows: targets }) => {
      invalidate()
      setPending(null)
      setSelected(new Set())
      if (targets.length > 1) {
        toast.success(`${action.label}: ${targets.length} ${config.entityPlural.toLowerCase()} updated`)
      } else {
        toast.success(results[0]?.toast ?? `${results[0]?.audit} · ${targets[0]?.id}`)
      }
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const noteMut = useMutation({
    mutationFn: ({ row, note }: { row: T; note: string }) =>
      updateRecord<T>(config.collection, row.id, {}, {
        actor,
        action: 'Added note',
        note,
        module: config.module,
        entity: config.entity,
        href: `${pathname}?id=${row.id}`,
      }),
    onSuccess: () => {
      invalidate()
      toast.success('Note added')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const createMut = useMutation({
    mutationFn: (values: Record<string, string>) => {
      const c = config.create!
      const row = c.build(values, nextId(config.collection, c.idPrefix))
      return createRecord<T>(config.collection, row, {
        actor,
        module: config.module,
        entity: config.entity,
        href: pathname,
      })
    },
    onSuccess: (row) => {
      invalidate()
      setCreateOpen(false)
      toast.success(`${config.entity} ${row.id} created`)
      setParam('id', row.id)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const startAction = (action: ResourceAction<T>, targets: T[]) => {
    if (action.confirm) setPending({ action, rows: targets })
    else actionMut.mutate({ action, rows: targets, input: {} })
  }

  const openRecord = (row: T) => {
    if (config.detailHref) router.push(config.detailHref(row))
    else setParam('id', row.id)
  }

  const exportCsv = () => {
    downloadCsv(
      `${config.exportName ?? config.collection}-${new Date().toISOString().slice(0, 10)}.csv`,
      rows.map((r) =>
        Object.fromEntries([
          ['ID', r.id],
          ...config.columns.map((c) => [c.header, plainValue(c.value(r))]),
        ])
      )
    )
    toast.success(`Exported ${rows.length} ${config.entityPlural.toLowerCase()}`)
  }

  const kpis = config.kpis && data ? config.kpis(scoped) : null
  const visibleTabs = tabs.filter((t) => t.value === 'all' || t.value === tab || (tabCounts[t.value] ?? 0) > 0 || config.tabs)
  const filtersActive = Object.values(filters).some((v) => v && v !== 'all') || query.trim() !== ''
  const colSpan = config.columns.length + 2

  return (
    <div className="space-y-5">
      {/* Page toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary" aria-live="polite">
          {isLoading ? (
            'Loading…'
          ) : (
            <>
              <span className="font-semibold text-text-primary">{formatNumber(scoped.length)}</span>{' '}
              {config.entityPlural.toLowerCase()}
              {!perm.canEdit && perm.ready ? <span className="ml-2 text-text-muted">· view only</span> : null}
            </>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh"
            onClick={() => void refetch()}
            className={cn(isFetching && '[&>svg]:animate-spin')}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="secondary" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          {toolbar}
          {config.create && perm.canCreate ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              {config.create.label}
            </Button>
          ) : null}
        </div>
      </div>

      {kpis ? (
        <StatGrid>
          {kpis.map((k) => (
            <StatCard
              key={k.label}
              label={k.label}
              value={k.value}
              hint={k.hint}
              hintTone={k.hintTone}
              trend={k.trend}
              icon={k.icon}
              highlight={k.highlight}
            />
          ))}
        </StatGrid>
      ) : isLoading && config.kpis ? (
        <StatGrid>
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCard key={i} label="Loading" value="" loading />
          ))}
        </StatGrid>
      ) : null}

      {intro}

      <div className="overflow-hidden rounded-xl border border-border-default bg-bg-surface shadow-card">
        {visibleTabs.length > 1 ? (
          <UnderlineTabs
            tabs={visibleTabs.map((t) => ({ value: t.value, label: t.label, count: data ? tabCounts[t.value] : undefined }))}
            value={tab}
            onChange={(v) => setParam('tab', v === (tabs[0]?.value ?? 'all') ? null : v)}
          />
        ) : null}

        {/* Filters + search */}
        <div className="flex flex-col gap-3 border-b border-border-default px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {(config.filters ?? []).map((f) => (
              <FilterSelect
                key={f.key}
                label={f.label}
                value={filters[f.key] ?? 'all'}
                onChange={(v) => setFilters((prev) => ({ ...prev, [f.key]: v }))}
                options={f.options}
              />
            ))}
            {filtersActive ? (
              <button
                type="button"
                onClick={() => {
                  setFilters({})
                  setQuery('')
                }}
                className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm text-text-secondary hover:text-text-primary"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            ) : null}
          </div>
          <label className="relative w-full lg:max-w-xs">
            <span className="sr-only">Search {config.entityPlural}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={config.searchPlaceholder ?? `Search ${config.entityPlural.toLowerCase()}…`}
              className="cv-control h-9 pl-9"
            />
          </label>
        </div>

        {/* Bulk bar */}
        {selectable && selected.size > 0 ? (
          <div className="flex flex-wrap items-center gap-2 border-b border-brand-lime/30 bg-brand-lime/10 px-6 py-2.5" role="region" aria-label="Bulk actions">
            <span className="mr-2 text-sm font-semibold text-text-primary">{selected.size} selected</span>
            {bulkActions.map((a) => {
              const eligible = selectedRows.filter((r) => allowed(a, r))
              const Icon = a.icon
              return (
                <Button
                  key={a.id}
                  size="sm"
                  variant={a.tone === 'danger' ? 'danger' : a.tone === 'primary' ? 'primary' : 'secondary'}
                  disabled={eligible.length === 0}
                  onClick={() => startAction(a, eligible)}
                  title={eligible.length < selectedRows.length ? `${selectedRows.length - eligible.length} selected record(s) are not eligible` : undefined}
                >
                  {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                  {a.label}
                  {eligible.length !== selectedRows.length ? ` (${eligible.length})` : ''}
                </Button>
              )
            })}
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Clear selection
            </Button>
          </div>
        ) : null}

        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-default">
                <th className="w-12 px-4 py-3">
                  {selectable ? (
                    <input
                      type="checkbox"
                      aria-label="Select all on this page"
                      checked={pageRows.length > 0 && pageRows.every((r) => selected.has(r.id))}
                      onChange={() =>
                        setSelected((prev) => {
                          const next = new Set(prev)
                          const all = pageRows.every((r) => next.has(r.id))
                          pageRows.forEach((r) => (all ? next.delete(r.id) : next.add(r.id)))
                          return next
                        })
                      }
                      className="h-4 w-4 rounded accent-brand-lime"
                    />
                  ) : (
                    <span className="sr-only">Row</span>
                  )}
                </th>
                {config.columns.map((col) => {
                  const sortable = col.sortable !== false && col.kind !== 'tags'
                  const active = sort?.key === col.key
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                      className={cn('cv-th', col.hideBelow && hideClass[col.hideBelow], col.align === 'right' && 'text-right')}
                    >
                      {sortable ? (
                        <button
                          type="button"
                          onClick={() =>
                            setSort((s) =>
                              s?.key === col.key
                                ? s.dir === 'asc'
                                  ? { key: col.key, dir: 'desc' }
                                  : null
                                : { key: col.key, dir: 'asc' }
                            )
                          }
                          className={cn('inline-flex items-center gap-1 uppercase hover:text-text-primary', active && 'text-text-primary')}
                        >
                          {col.header}
                          {active ? (
                            sort!.dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  )
                })}
                <th className="w-12 px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border-light">
                    {Array.from({ length: colSpan }).map((__, j) => (
                      <td key={j} className="cv-td">
                        <div className="h-4 w-full animate-pulse rounded bg-bg-surfaceAlt" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={colSpan} className="px-6 py-14 text-center">
                    <p className="font-medium text-text-primary">Couldn&apos;t load {config.entityPlural.toLowerCase()}</p>
                    <p className="mt-1 text-sm text-text-secondary">Check your connection and try again.</p>
                    <Button className="mt-4" variant="secondary" onClick={() => void refetch()}>
                      Retry
                    </Button>
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-6 py-16 text-center">
                    <p className="font-medium text-text-primary">
                      {filtersActive ? 'No matches for these filters' : config.emptyTitle ?? `No ${config.entityPlural.toLowerCase()} here`}
                    </p>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-text-secondary">
                      {filtersActive
                        ? 'Try a different search term or clear the filters.'
                        : config.emptyDescription ?? 'Nothing needs your attention in this view right now.'}
                    </p>
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => {
                  const rowActions = (config.actions ?? []).filter((a) => allowed(a, row))
                  const isSelected = selected.has(row.id)
                  return (
                    <tr
                      key={row.id}
                      tabIndex={0}
                      onClick={() => openRecord(row)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target === e.currentTarget) openRecord(row)
                      }}
                      aria-label={`${config.entity} ${row.id}`}
                      className={cn(
                        'cursor-pointer border-b border-border-light outline-none transition-colors last:border-0 hover:bg-bg-surfaceHover focus-visible:bg-bg-surfaceHover focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-brand-lime',
                        isSelected && 'bg-brand-lime/5'
                      )}
                    >
                      <td className="cv-td w-12" onClick={(e) => e.stopPropagation()}>
                        {selectable ? (
                          <input
                            type="checkbox"
                            aria-label={`Select ${row.id}`}
                            checked={isSelected}
                            onChange={() =>
                              setSelected((prev) => {
                                const next = new Set(prev)
                                if (next.has(row.id)) next.delete(row.id)
                                else next.add(row.id)
                                return next
                              })
                            }
                            className="h-4 w-4 rounded accent-brand-lime"
                          />
                        ) : null}
                      </td>
                      {config.columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            'cv-td max-w-[18rem]',
                            col.hideBelow && hideClass[col.hideBelow],
                            col.align === 'right' && 'text-right'
                          )}
                        >
                          <CellValue
                            kind={col.kind}
                            value={col.value(row)}
                            sub={col.sub?.(row)}
                            statusMap={col.statusMap ?? (col.kind === 'status' ? config.status?.map : undefined)}
                            href={col.href?.(row)}
                          />
                        </td>
                      ))}
                      <td className="cv-td w-12" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              aria-label={`Actions for ${row.id}`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-bg-elevated hover:text-text-primary data-[state=open]:bg-bg-elevated"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => openRecord(row)}>
                              <Eye /> View details
                            </DropdownMenuItem>
                            {rowActions.length > 0 ? (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {rowActions.map((a) => {
                                  const Icon = a.icon
                                  return (
                                    <DropdownMenuItem
                                      key={a.id}
                                      destructive={a.tone === 'danger'}
                                      onSelect={() => startAction(a, [row])}
                                    >
                                      {Icon ? <Icon /> : null}
                                      {a.label}
                                    </DropdownMenuItem>
                                  )
                                })}
                              </>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && rows.length > 0 ? (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={rows.length}
          onPageChange={(p) => {
            setPage(p)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onPageSizeChange={(s) => {
            setPageSize(s)
            setPage(1)
          }}
        />
      ) : null}

      {outro}

      <RecordDrawer
        config={config}
        row={openRow}
        open={Boolean(openRow)}
        onOpenChange={(o) => {
          if (!o) setParam('id', null)
        }}
        actions={openRow ? (config.actions ?? []).filter((a) => allowed(a, openRow)) : []}
        onAction={(a) => openRow && startAction(a, [openRow])}
        onAddNote={(note) => openRow && noteMut.mutate({ row: openRow, note })}
        notePending={noteMut.isPending}
        canEdit={perm.canEdit}
      />

      <ActionDialog
        action={pending?.action ?? null}
        rows={pending?.rows ?? []}
        open={Boolean(pending)}
        onOpenChange={(o) => {
          if (!o) setPending(null)
        }}
        pending={actionMut.isPending}
        onConfirm={(input) => pending && actionMut.mutate({ action: pending.action, rows: pending.rows, input })}
      />

      {config.create ? (
        <CreateDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          title={config.create.label}
          description={config.create.description}
          fields={config.create.fields}
          pending={createMut.isPending}
          onSubmit={(values) => createMut.mutate(values)}
        />
      ) : null}
    </div>
  )
}
