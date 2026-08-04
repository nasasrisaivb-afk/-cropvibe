'use client'

import { Suspense, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import {
  getPlans,
  getSubscriptions,
  getBillingKpis,
  cancelSubscription,
} from '@/lib/api/subscriptions.api'
import type { Subscription } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatInr } from '@/lib/utils'

function SubsInner() {
  const router = useRouter()
  const params = useSearchParams()
  const qc = useQueryClient()
  const [status, setStatus] = useState(params.get('status') ?? 'all')
  const [page, setPage] = useState(1)

  const { data: plans } = useQuery({ queryKey: ['plans'], queryFn: getPlans })
  const { data: kpis } = useQuery({ queryKey: ['billing-kpis'], queryFn: getBillingKpis })
  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions', { status, page }],
    queryFn: () => getSubscriptions({ status, page, limit: 50 }),
  })

  const cancelMut = useMutation({
    mutationFn: (id: string) => cancelSubscription(id, 'Admin cancel'),
    onSuccess: () => {
      toast.success('Subscription cancelled')
      void qc.invalidateQueries({ queryKey: ['subscriptions'] })
      void qc.invalidateQueries({ queryKey: ['billing-kpis'] })
    },
  })

  const columns = useMemo<ColumnDef<Subscription>[]>(
    () => [
      { accessorKey: 'userName', header: 'Subscriber' },
      { accessorKey: 'planName', header: 'Plan' },
      {
        accessorKey: 'monthlyPrice',
        header: 'Price',
        cell: ({ row }) => <span className="font-mono">{formatInr(row.original.monthlyPrice)}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'active' ? 'success' : 'warning'}>
            {row.original.status.replace('_', ' ')}
          </Badge>
        ),
      },
      {
        accessorKey: 'renewalDate',
        header: 'Renewal',
        cell: ({ row }) => new Date(row.original.renewalDate).toLocaleDateString('en-IN'),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="danger"
            disabled={row.original.status === 'cancelled'}
            onClick={(e) => {
              e.stopPropagation()
              cancelMut.mutate(row.original.id)
            }}
          >
            Cancel
          </Button>
        ),
      },
    ],
    [cancelMut]
  )

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Subscriptions</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="pt-5"><p className="text-sm text-text-secondary">MRR</p><p className="text-2xl font-bold font-mono">{kpis ? formatInr(kpis.mrr) : '—'}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-sm text-text-secondary">Active</p><p className="text-2xl font-bold">{kpis?.activeCount ?? '—'}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-sm text-text-secondary">Churn</p><p className="text-2xl font-bold">{kpis?.churnRate ?? '—'}%</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold">Plans</h2></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-text-secondary">
              <tr className="border-b border-border-light">
                <th className="px-2 py-2 text-left">Plan</th>
                <th className="px-2 py-2 text-left">Price</th>
                <th className="px-2 py-2 text-left">Subscribers</th>
                <th className="px-2 py-2 text-left">MRR</th>
                <th className="px-2 py-2 text-left">Features</th>
              </tr>
            </thead>
            <tbody>
              {(plans ?? []).map((p) => (
                <tr key={p.id} className="border-b border-border-light">
                  <td className="px-2 py-2 font-medium">{p.name}</td>
                  <td className="px-2 py-2 font-mono">{formatInr(p.monthlyPrice)}</td>
                  <td className="px-2 py-2">{p.activeSubscribers}</td>
                  <td className="px-2 py-2 font-mono">{formatInr(p.mrr)}</td>
                  <td className="px-2 py-2 text-text-secondary">{p.features.join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {['all', 'active', 'expiring_soon', 'paused', 'cancelled', 'expired'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1 text-xs ${
              status === s ? 'bg-brand-lime text-text-inverse' : 'bg-bg-surfaceAlt text-text-secondary'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        total={data?.total}
        page={page}
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/subscriptions/${row.id}`)}
      />
    </div>
  )
}

export default function SubscriptionsPage() {
  return (
    <Suspense>
      <SubsInner />
    </Suspense>
  )
}
