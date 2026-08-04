'use client'

import { Suspense, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ColumnDef } from '@tanstack/react-table'
import { getKycQueue, getKycCounts } from '@/lib/api/kyc.api'
import type { KycApplication } from '@/lib/types'
import { USER_ROLE_LABELS } from '@/lib/types'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { relativeTime } from '@/lib/utils'

function slaBadge(submittedAt: string) {
  const hours = (Date.now() - new Date(submittedAt).getTime()) / 3600000
  if (hours > 48) return { variant: 'error' as const, label: 'OVERDUE' }
  if (hours > 24) return { variant: 'warning' as const, label: `${Math.round(48 - hours)}h left` }
  return { variant: 'success' as const, label: `${Math.round(24 - hours)}h left` }
}

function KycPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState(params.get('status') ?? 'all')
  const [docType, setDocType] = useState('all')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['kyc', { status, docType, page }],
    queryFn: () => getKycQueue({ status, documentType: docType, page, limit: 50 }),
  })
  const { data: counts } = useQuery({ queryKey: ['kyc-counts'], queryFn: getKycCounts })

  const columns = useMemo<ColumnDef<KycApplication>[]>(
    () => [
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <Badge variant="pending">{row.original.status}</Badge>,
      },
      { accessorKey: 'userName', header: 'Applicant' },
      {
        id: 'role',
        header: 'Role',
        cell: ({ row }) => USER_ROLE_LABELS[row.original.userRole],
      },
      { accessorKey: 'documentType', header: 'Document' },
      {
        accessorKey: 'submittedAt',
        header: 'Submitted',
        cell: ({ row }) => relativeTime(row.original.submittedAt),
      },
      {
        id: 'sla',
        header: 'SLA',
        cell: ({ row }) => {
          const s = slaBadge(row.original.submittedAt)
          return <Badge variant={s.variant}>{s.label}</Badge>
        },
      },
    ],
    []
  )

  const tabs = ['all', 'pending', 'in_review', 'approved', 'rejected', 'resubmit_requested']

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">KYC Verification</h1>
        <p className="text-sm text-text-secondary">
          Avg review ~6h · Approval rate ~82% (mock)
        </p>
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
            {t.replace('_', ' ')} ({counts?.[t] ?? 0})
          </button>
        ))}
      </div>

      <select
        value={docType}
        onChange={(e) => setDocType(e.target.value)}
        className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
      >
        <option value="all">All document types</option>
        <option value="aadhaar">Aadhaar</option>
        <option value="pan">PAN</option>
        <option value="gst">GST</option>
        <option value="digilocker">DigiLocker</option>
      </select>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        total={data?.total}
        page={page}
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/kyc/${row.id}`)}
        emptyMessage="No pending KYC applications! All applications have been reviewed."
      />
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
