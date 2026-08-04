'use client'

import { Suspense, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ColumnDef } from '@tanstack/react-table'
import { getListings, getListingCounts } from '@/lib/api/listings.api'
import type { Listing } from '@/lib/types'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { formatInr, relativeTime } from '@/lib/utils'

function ListingsInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [type, setType] = useState(params.get('type') ?? 'all')
  const [status, setStatus] = useState(params.get('status') ?? 'all')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['listings', { type, status, page, search }],
    queryFn: () => getListings({ type, status, page, search, limit: 50 }),
  })
  const { data: counts } = useQuery({ queryKey: ['listing-counts'], queryFn: getListingCounts })

  const columns = useMemo<ColumnDef<Listing>[]>(
    () => [
      { accessorKey: 'title', header: 'Title' },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => <Badge>{row.original.type.replace('_', ' ')}</Badge>,
      },
      { accessorKey: 'sellerName', header: 'Seller' },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) =>
          row.original.price != null ? (
            <span className="font-mono">{formatInr(row.original.price)}</span>
          ) : (
            '—'
          ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === 'active'
                ? 'success'
                : row.original.status === 'flagged' || row.original.status === 'removed'
                  ? 'error'
                  : 'pending'
            }
          >
            {row.original.status.replace('_', ' ')}
          </Badge>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ row }) => relativeTime(row.original.updatedAt),
      },
    ],
    []
  )

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Listings</h1>
      <div className="flex flex-wrap gap-2">
        {['all', 'crop', 'equipment_rental', 'warehouse'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              type === t ? 'bg-brand-lime text-text-inverse' : 'bg-bg-surfaceAlt text-text-secondary'
            }`}
          >
            {t.replace('_', ' ')} ({counts?.byType[t] ?? 0})
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {['all', 'pending_review', 'active', 'flagged', 'archived', 'removed'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              status === s ? 'bg-brand-lime/20 text-brand-limeAlt' : 'bg-bg-surface text-text-muted'
            }`}
          >
            {s.replace('_', ' ')} ({counts?.byStatus[s] ?? 0})
          </button>
        ))}
      </div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search listings…"
        className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
      />
      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        total={data?.total}
        page={page}
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/listings/${row.id}`)}
      />
    </div>
  )
}

export default function ListingsPage() {
  return (
    <Suspense>
      <ListingsInner />
    </Suspense>
  )
}
