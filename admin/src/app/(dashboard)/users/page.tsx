'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { getUsers, getUserCountsByRole, bulkUpdateUserStatus } from '@/lib/api/users.api'
import type { User } from '@/lib/types'
import { ALL_USER_ROLES, USER_ROLE_LABELS, INDIAN_STATES } from '@/lib/types'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPhone, relativeTime, downloadCsv } from '@/lib/utils'
import { Suspense } from 'react'

function kycVariant(k: User['kyc']) {
  if (k === 'approved') return 'success'
  if (k === 'pending') return 'pending'
  if (k === 'rejected') return 'error'
  return 'default'
}

function statusVariant(s: User['accountStatus']) {
  if (s === 'active') return 'success'
  if (s === 'suspended') return 'warning'
  if (s === 'banned') return 'error'
  return 'default'
}

function UsersPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState(params.get('role') ?? 'all')
  const [status, setStatus] = useState('all')
  const [kyc, setKyc] = useState('all')
  const [location, setLocation] = useState('')
  const [selected, setSelected] = useState<User[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['users', { page, limit, search, role, status, kyc, location }],
    queryFn: () =>
      getUsers({
        page,
        limit,
        search,
        role: role as never,
        status: status as never,
        kyc: kyc as never,
        location: location || undefined,
      }),
  })
  const { data: counts } = useQuery({ queryKey: ['user-counts'], queryFn: getUserCountsByRole })

  const bulk = useMutation({
    mutationFn: (s: 'suspended' | 'active') =>
      bulkUpdateUserStatus(
        selected.map((u) => u.id),
        s
      ),
    onSuccess: (_, s) => {
      toast.success(`${selected.length} users ${s}`)
      setSelected([])
      void qc.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Select all"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label="Select row"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'firstName',
        header: 'Name',
        cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
      },
      {
        id: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <Badge>{USER_ROLE_LABELS[row.original.roles[0]!]}</Badge>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => (
          <span className="font-mono text-sm">{formatPhone(row.original.phone)}</span>
        ),
      },
      {
        id: 'location',
        header: 'Location',
        cell: ({ row }) => `${row.original.location.state} — ${row.original.location.district}`,
      },
      {
        accessorKey: 'kyc',
        header: 'KYC',
        cell: ({ row }) => <Badge variant={kycVariant(row.original.kyc)}>{row.original.kyc}</Badge>,
      },
      {
        accessorKey: 'accountStatus',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.accountStatus)}>
            {row.original.accountStatus}
          </Badge>
        ),
      },
      {
        accessorKey: 'joinedAt',
        header: 'Joined',
        cell: ({ row }) => (
          <span title={new Date(row.original.joinedAt).toLocaleString('en-IN')}>
            {relativeTime(row.original.joinedAt)}
          </span>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Users</h1>
        <Button
          variant="secondary"
          onClick={() =>
            downloadCsv(
              'users.csv',
              (data?.data ?? []).map((u) => ({
                id: u.id,
                name: `${u.firstName} ${u.lastName}`,
                email: u.email,
                phone: u.phone,
                role: u.roles.join('|'),
                status: u.accountStatus,
                kyc: u.kyc,
              }))
            )
          }
        >
          Export
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 overflow-x-auto">
        {['all', ...ALL_USER_ROLES].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setRole(r)
              setPage(1)
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              role === r
                ? 'bg-brand-lime text-text-inverse'
                : 'bg-bg-surfaceAlt text-text-secondary hover:bg-bg-surfaceHover'
            }`}
          >
            {r === 'all' ? 'All' : USER_ROLE_LABELS[r as keyof typeof USER_ROLE_LABELS]} (
            {counts?.[r] ?? 0})
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search name, phone, email"
          className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={kyc}
          onChange={(e) => setKyc(e.target.value)}
          className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
        >
          <option value="all">All KYC</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="none">None</option>
        </select>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
        >
          <option value="">All states</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border-default bg-bg-surface p-3">
          <span className="text-sm text-text-secondary">{selected.length} selected</span>
          <Button size="sm" variant="danger" loading={bulk.isPending} onClick={() => bulk.mutate('suspended')}>
            Suspend
          </Button>
          <Button size="sm" variant="secondary" loading={bulk.isPending} onClick={() => bulk.mutate('active')}>
            Reactivate
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              downloadCsv(
                'selected-users.csv',
                selected.map((u) => ({
                  id: u.id,
                  name: `${u.firstName} ${u.lastName}`,
                  phone: u.phone,
                  email: u.email,
                }))
              )
            }
          >
            Export
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
            Clear
          </Button>
        </div>
      ) : null}

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        total={data?.total}
        page={page}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setLimit(s)
          setPage(1)
        }}
        enableSelection
        onSelectionChange={setSelected}
        onRowClick={(row) => router.push(`/users/${row.id}`)}
        emptyMessage="No users found. Try adjusting your filters."
      />
    </div>
  )
}

export default function UsersPage() {
  return (
    <Suspense>
      <UsersPageInner />
    </Suspense>
  )
}
