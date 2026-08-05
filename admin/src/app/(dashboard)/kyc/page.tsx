'use client'

import { Suspense, useMemo, useState, Fragment } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Flag,
  MinusCircle,
  Plus,
  Search,
} from 'lucide-react'
import { getKycQueue, getKycCounts } from '@/lib/api/kyc.api'
import type { KycApplication } from '@/lib/types'
import { USER_ROLE_LABELS } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { relativeTime } from '@/lib/utils'

const TABS = [
  { value: 'all', label: 'All applications' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_review', label: 'In review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'resubmit_requested', label: 'Resubmit requested' },
] as const

const DOC_OPTIONS = [
  { value: 'all', label: 'Document type' },
  { value: 'aadhaar', label: 'Aadhaar' },
  { value: 'pan', label: 'PAN' },
  { value: 'gst', label: 'GST' },
  { value: 'digilocker', label: 'DigiLocker' },
] as const

function statusMeta(status: KycApplication['status']) {
  switch (status) {
    case 'approved':
      return { variant: 'success' as const, label: 'Approved', Icon: CheckCircle2 }
    case 'pending':
      return { variant: 'warning' as const, label: 'Pending', Icon: Clock3 }
    case 'in_review':
      return { variant: 'info' as const, label: 'In review', Icon: Flag }
    case 'rejected':
      return { variant: 'error' as const, label: 'Rejected', Icon: MinusCircle }
    case 'resubmit_requested':
      return { variant: 'pending' as const, label: 'Resubmit', Icon: Clock3 }
  }
}

function slaBadge(submittedAt: string) {
  const hours = (Date.now() - new Date(submittedAt).getTime()) / 3600000
  if (hours > 48) return { variant: 'error' as const, label: 'Overdue' }
  if (hours > 24) return { variant: 'warning' as const, label: `${Math.round(48 - hours)}h left` }
  return { variant: 'success' as const, label: `${Math.round(24 - hours)}h left` }
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="relative inline-flex">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 appearance-none rounded-lg border border-border-default bg-bg-surface py-2 pl-3 pr-8 text-sm font-medium text-text-primary outline-none focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/30"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
    </label>
  )
}

function KycPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState(params.get('status') ?? 'all')
  const [docType, setDocType] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>(null)
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ['kyc', { status, docType, page, limit }],
    queryFn: () => getKycQueue({ status, documentType: docType, page, limit }),
  })
  const { data: counts } = useQuery({ queryKey: ['kyc-counts'], queryFn: getKycCounts })

  const rows = useMemo(() => {
    const list = data?.data ?? []
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (row) =>
        row.userName.toLowerCase().includes(q) ||
        row.id.toLowerCase().includes(q) ||
        row.documentType.toLowerCase().includes(q) ||
        row.userEmail.toLowerCase().includes(q) ||
        USER_ROLE_LABELS[row.userRole].toLowerCase().includes(q)
    )
  }, [data?.data, query])

  const total = data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / limit))

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const togglePage = () => {
    if (rows.length === 0) return
    const allSelected = rows.every((r) => selected.has(r.id))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) rows.forEach((r) => next.delete(r.id))
      else rows.forEach((r) => next.add(r.id))
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-[1.75rem]">
            KYC Verification overview
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Avg review ~6h · Approval rate ~82% (mock)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" type="button">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            type="button"
            onClick={() => {
              setStatus('pending')
              setPage(1)
            }}
          >
            <Plus className="h-4 w-4" />
            Review queue
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-default bg-bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.24)]">
        {/* Tabs */}
        <div className="flex gap-0 overflow-x-auto border-b border-border-default px-1">
          {TABS.map((tab) => {
            const active = status === tab.value
            const count = counts?.[tab.value] ?? 0
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatus(tab.value)
                  setPage(1)
                }}
                className={cn(
                  'relative shrink-0 px-4 py-3 text-sm font-medium transition',
                  active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {tab.label}
                <span className="ml-1.5 text-text-muted">{count}</span>
                {active ? (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-lime" />
                ) : null}
              </button>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-border-default px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterSelect
              label="Status"
              value={status}
              onChange={(v) => {
                setStatus(v)
                setPage(1)
              }}
              options={[
                { value: 'all', label: 'Status' },
                ...TABS.filter((t) => t.value !== 'all').map((t) => ({
                  value: t.value,
                  label: t.label,
                })),
              ]}
            />
            <FilterSelect
              label="Document type"
              value={docType}
              onChange={(v) => {
                setDocType(v)
                setPage(1)
              }}
              options={[...DOC_OPTIONS]}
            />
            <FilterSelect
              label="SLA"
              value="all"
              onChange={() => undefined}
              options={[
                { value: 'all', label: 'SLA' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'overdue', label: 'Overdue' },
              ]}
            />
          </div>
          <label className="relative min-w-0 flex-1 sm:max-w-xs">
            <span className="sr-only">Search KYC</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, ID, or document…"
              className="h-9 w-full rounded-lg border border-border-default bg-bg-surface py-2 pl-9 pr-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/30"
            />
          </label>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-default">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={rows.length > 0 && rows.every((r) => selected.has(r.id))}
                    onChange={togglePage}
                    className="h-4 w-4 rounded border-border-default accent-brand-lime"
                    aria-label="Select page"
                  />
                </th>
                {['Application', 'Applicant', 'Role', 'Document', 'Submitted', 'SLA', 'Status', ''].map(
                  (col) => (
                    <th
                      key={col || 'actions'}
                      className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border-light">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-4 w-full animate-pulse rounded bg-bg-surfaceAlt" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center text-text-muted">
                    No pending KYC applications! All applications have been reviewed.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const meta = statusMeta(row.status)
                  const sla = slaBadge(row.submittedAt)
                  const open = expanded === row.id
                  return (
                    <Fragment key={row.id}>
                      <tr className="border-b border-border-light transition-colors hover:bg-bg-surfaceHover">
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selected.has(row.id)}
                            onChange={() => toggleOne(row.id)}
                            className="h-4 w-4 rounded border-border-default accent-brand-lime"
                            aria-label={`Select ${row.userName}`}
                          />
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            className="font-mono text-[13px] text-text-secondary hover:text-brand-lime"
                            onClick={() => router.push(`/kyc/${row.id}`)}
                          >
                            {row.id.slice(0, 12)}…
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-text-primary">{row.userName}</p>
                          <p className="text-xs text-text-muted">{row.userEmail}</p>
                        </td>
                        <td className="px-4 py-3.5 text-text-secondary">
                          {USER_ROLE_LABELS[row.userRole]}
                        </td>
                        <td className="px-4 py-3.5 capitalize text-text-secondary">
                          {row.documentType}
                        </td>
                        <td className="px-4 py-3.5 text-text-muted">
                          {relativeTime(row.submittedAt)}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={sla.variant} showIcon>
                            {sla.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={meta.variant} icon={meta.Icon} showIcon>
                            {meta.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            className="rounded-md p-1 text-text-muted hover:bg-bg-surfaceAlt hover:text-text-primary"
                            aria-label={open ? 'Collapse' : 'Expand'}
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpanded(open ? null : row.id)
                            }}
                          >
                            <ChevronDown
                              className={cn('h-4 w-4 transition', open && 'rotate-180')}
                            />
                          </button>
                        </td>
                      </tr>
                      {open ? (
                        <tr className="border-b border-border-light bg-bg-surfaceAlt/40">
                          <td colSpan={9} className="px-4 py-3">
                            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                              <p className="text-text-secondary">
                                {row.location.district}, {row.location.state} · {row.userPhone}
                              </p>
                              <Button
                                size="sm"
                                onClick={() => router.push(`/kyc/${row.id}`)}
                              >
                                Open application
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border-default px-4 py-3">
          <p className="text-sm text-text-secondary">
            {total} result{total === 1 ? '' : 's'}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function KycPage() {
  return (
    <Suspense>
      <KycPageInner />
    </Suspense>
  )
}
