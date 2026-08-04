'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { getTransactions, reverseTransaction, retryTransaction } from '@/lib/api/transactions.api'
import type { Transaction } from '@/lib/types'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatInr, relativeTime, downloadCsv } from '@/lib/utils'

export default function TransactionsPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', { page, type, status, search }],
    queryFn: () => getTransactions({ page, type, status, search, limit: 50 }),
  })

  const reverseMut = useMutation({
    mutationFn: reverseTransaction,
    onSuccess: () => {
      toast.success('Transaction reversed')
      void qc.invalidateQueries({ queryKey: ['transactions'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
  const retryMut = useMutation({
    mutationFn: retryTransaction,
    onSuccess: () => {
      toast.success('Transaction retried')
      void qc.invalidateQueries({ queryKey: ['transactions'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      { accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => relativeTime(row.original.createdAt),
      },
      { accessorKey: 'type', header: 'Type' },
      {
        id: 'parties',
        header: 'Parties',
        cell: ({ row }) => (
          <span className="text-xs">
            {row.original.fromName} → {row.original.toName}
          </span>
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => <span className="font-mono">{formatInr(row.original.amount)}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === 'completed'
                ? 'success'
                : row.original.status === 'failed'
                  ? 'error'
                  : 'warning'
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {row.original.status === 'failed' ? (
              <Button size="sm" variant="secondary" onClick={() => retryMut.mutate(row.original.id)}>
                Retry
              </Button>
            ) : null}
            {row.original.status === 'completed' ? (
              <Button size="sm" variant="outline" onClick={() => reverseMut.mutate(row.original.id)}>
                Reverse
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [reverseMut, retryMut]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Button
          variant="secondary"
          onClick={() =>
            downloadCsv(
              'transactions.csv',
              (data?.data ?? []).map((t) => ({
                id: t.id,
                type: t.type,
                amount: t.amount,
                status: t.status,
                from: t.fromName,
                to: t.toName,
                createdAt: t.createdAt,
              }))
            )
          }
        >
          Export CSV
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ID, party, gateway…"
          className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
        />
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm">
          <option value="all">All types</option>
          <option value="payment">Payment</option>
          <option value="payout">Payout</option>
          <option value="refund">Refund</option>
          <option value="chargeback">Chargeback</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm">
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="reversed">Reversed</option>
        </select>
      </div>
      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        total={data?.total}
        page={page}
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/transactions/${row.id}`)}
      />
    </div>
  )
}
