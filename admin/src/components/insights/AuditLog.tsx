'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Download, Search, ShieldAlert, UserCog, History, Users } from 'lucide-react'
import { toast } from 'sonner'
import { getAuditLog } from '@/lib/api/resources.api'
import { StatCard, StatGrid } from '@/components/ui/stat-card'
import { FilterSelect } from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { downloadCsv, formatDateTime, relativeTime, titleCase } from '@/lib/utils'

const SEVERITY = {
  info: { label: 'Info', tone: 'default' as const },
  warning: { label: 'Warning', tone: 'warning' as const },
  critical: { label: 'Sensitive', tone: 'error' as const },
}

/** Immutable record of every admin action (Figma "Verification | audit log"). */
export function AuditLog() {
  const { data, isLoading } = useQuery({ queryKey: ['audit-log'], queryFn: getAuditLog, refetchInterval: 15000 })
  const [module, setModule] = useState('all')
  const [severity, setSeverity] = useState('all')
  const [actor, setActor] = useState('all')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(25)

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase()
    return (data ?? []).filter(
      (e) =>
        (module === 'all' || e.module === module) &&
        (severity === 'all' || e.severity === severity) &&
        (actor === 'all' || e.actor === actor) &&
        (!term || `${e.action} ${e.entity} ${e.entityId} ${e.note ?? ''} ${e.actor}`.toLowerCase().includes(term))
    )
  }, [data, module, severity, actor, q])

  const actors = Array.from(new Set((data ?? []).map((e) => e.actor)))
  const modules = Array.from(new Set((data ?? []).map((e) => e.module)))
  const pageRows = rows.slice((page - 1) * size, page * size)

  return (
    <div className="space-y-5">
      <StatGrid>
        <StatCard label="Entries" value={data?.length ?? ''} icon={History} highlight loading={isLoading} />
        <StatCard label="Sensitive actions" value={(data ?? []).filter((e) => e.severity === 'critical').length} hint="Settings, roles, write-offs" hintTone="warning" icon={ShieldAlert} loading={isLoading} />
        <StatCard label="Admins active" value={actors.length} icon={Users} loading={isLoading} />
        <StatCard label="Last action" value={data?.[0] ? relativeTime(data[0].at) : '—'} hint={data?.[0]?.actor} icon={UserCog} loading={isLoading} />
      </StatGrid>

      <div className="flex justify-end">
        <Button
          variant="secondary"
          disabled={rows.length === 0}
          onClick={() => {
            downloadCsv(
              `audit-log-${new Date().toISOString().slice(0, 10)}.csv`,
              rows.map((e) => ({ id: e.id, time: e.at, actor: e.actor, role: e.actorRole, module: e.module, entity: e.entity, entityId: e.entityId, action: e.action, note: e.note ?? '', severity: e.severity, ip: e.ip }))
            )
            toast.success(`Exported ${rows.length} audit entries`)
          }}
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <section className="overflow-hidden rounded-xl border border-border-default bg-bg-surface shadow-card">
        <div className="flex flex-col gap-3 border-b border-border-default px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterSelect label="Module" value={module} onChange={(v) => { setModule(v); setPage(1) }} options={modules.map((m) => ({ value: m, label: titleCase(m) }))} />
            <FilterSelect label="Severity" value={severity} onChange={(v) => { setSeverity(v); setPage(1) }} options={Object.entries(SEVERITY).map(([value, d]) => ({ value, label: d.label }))} />
            <FilterSelect label="Admin" value={actor} onChange={(v) => { setActor(v); setPage(1) }} options={actors.map((a) => ({ value: a, label: a }))} />
          </div>
          <label className="relative w-full lg:max-w-xs">
            <span className="sr-only">Search audit log</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} placeholder="Search action, record or note…" className="cv-control h-9 pl-9" />
          </label>
        </div>
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-default">
                <th className="cv-th">Time</th>
                <th className="cv-th">Admin</th>
                <th className="cv-th">Action</th>
                <th className="cv-th">Record</th>
                <th className="cv-th">Severity</th>
                <th className="cv-th">IP</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-border-light">
                      <td colSpan={6} className="px-6 py-3">
                        <div className="h-5 animate-pulse rounded bg-bg-surfaceAlt" />
                      </td>
                    </tr>
                  ))
                : pageRows.map((e) => (
                    <tr key={e.id} className="border-b border-border-light last:border-0 hover:bg-bg-surfaceHover">
                      <td className="cv-td whitespace-nowrap">
                        <p className="text-text-primary">{formatDateTime(e.at)}</p>
                        <p className="text-xs text-text-muted">{relativeTime(e.at)}</p>
                      </td>
                      <td className="cv-td">
                        <span className="flex items-center gap-2.5">
                          <Avatar name={e.actor} size="sm" />
                          <span>
                            <span className="block font-medium text-text-primary">{e.actor}</span>
                            <span className="block text-xs text-text-muted">{e.actorRole}</span>
                          </span>
                        </span>
                      </td>
                      <td className="cv-td max-w-[22rem]">
                        <p className="text-text-primary">{e.action}</p>
                        {e.note ? <p className="truncate text-xs text-text-muted" title={e.note}>“{e.note}”</p> : null}
                      </td>
                      <td className="cv-td">
                        {e.href ? (
                          <Link href={e.href} className="hover:text-brand-lime">
                            <span className="block text-text-secondary">{e.entity}</span>
                            <span className="block font-mono text-xs text-text-muted">{e.entityId}</span>
                          </Link>
                        ) : (
                          <>
                            <span className="block text-text-secondary">{e.entity}</span>
                            <span className="block font-mono text-xs text-text-muted">{e.entityId}</span>
                          </>
                        )}
                      </td>
                      <td className="cv-td">
                        <Badge variant={SEVERITY[e.severity].tone}>{SEVERITY[e.severity].label}</Badge>
                      </td>
                      <td className="cv-td font-mono text-xs text-text-muted">{e.ip}</td>
                    </tr>
                  ))}
              {!isLoading && rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-text-muted">
                    No audit entries match these filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
      {rows.length > 0 ? (
        <Pagination page={page} pageSize={size} total={rows.length} onPageChange={setPage} onPageSizeChange={(s) => { setSize(s); setPage(1) }} pageSizes={[25, 50, 100]} />
      ) : null}
    </div>
  )
}
