'use client'

import { Suspense, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ColumnDef } from '@tanstack/react-table'
import { getDisputes, getDisputeCounts } from '@/lib/api/disputes.api'
import type { Dispute } from '@/lib/types'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { formatInr, relativeTime } from '@/lib/utils'

function DisputesInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState(params.get('status') ?? 'all')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['disputes', { status, page, search }],
    queryFn: () => getDisputes({ status, page, search, limit: 50 }),
  })
  const { data: counts } = useQuery({ queryKey: ['dispute-counts'], queryFn: getDisputeCounts })

  const columns = useMemo<ColumnDef<Dispute>[]>(
    () => [
      { accessorKey: 'id', header: 'Dispute' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => <span className="font-mono">{formatInr(row.original.amount)}</span>,
      },
      { accessorKey: 'buyerName', header: 'Buyer' },
      { accessorKey: 'sellerName', header: 'Seller' },
      { accessorKey: 'reason', header: 'Reason' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === 'resolved'
                ? 'success'
                : row.original.status === 'escalated'
                  ? 'error'
                  : 'warning'
            }
          >
            {row.original.status.replace(/_/g, ' ')}
          </Badge>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => relativeTime(row.original.createdAt),
      },
    ],
    []
  )

  const tabs = ['all', 'new', 'under_investigation', 'awaiting_response', 'resolved', 'escalated', '!resolved']

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Disputes</h1>
        <p className="text-sm text-text-secondary">Avg resolution ~3.2 days · Resolution rate 91%</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setStatus(t)
              setPage(1)
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              status === t ? 'bg-brand-lime text-text-inverse' : 'bg-bg-surfaceAlt text-text-secondary'
            }`}
          >
            {t === '!resolved' ? 'Open' : t.replace(/_/g, ' ')} (
            {t === '!resolved'
              ? (counts?.all ?? 0) - (counts?.resolved ?? 0)
              : counts?.[t] ?? 0}
            )
          </button>
        ))}
      </div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search dispute, buyer, seller…"
        className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
      />
      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        total={data?.total}
        page={page}
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/disputes/${row.id}`)}
      />
    </div>
  )
}

export default function DisputesPage() {
  return (
    <Suspense>
      <DisputesInner />
    </Suspense>
  )
}
