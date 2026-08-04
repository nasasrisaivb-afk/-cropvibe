'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'
import {
  getAdminTeam,
  createAdmin,
  updateAdminRole,
  deactivateAdmin,
  getPermissionMatrix,
  MODULES,
} from '@/lib/api/roles.api'
import type { AdminRole, AdminUser } from '@/lib/types'
import { ADMIN_ROLE_LABELS } from '@/lib/types'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['super_admin', 'ops_admin', 'support_agent', 'finance_admin', 'auditor']),
})

type FormData = z.infer<typeof schema>

export default function RolesPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const { data: team, isLoading } = useQuery({ queryKey: ['admins'], queryFn: getAdminTeam })
  const { data: matrix } = useQuery({ queryKey: ['perm-matrix'], queryFn: getPermissionMatrix })

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', role: 'support_agent' },
  })

  const createMut = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      toast.success('Admin added')
      setOpen(false)
      form.reset()
      void qc.invalidateQueries({ queryKey: ['admins'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const roleMut = useMutation({
    mutationFn: ({ id, role }: { id: string; role: AdminRole }) => updateAdminRole(id, role),
    onSuccess: () => {
      toast.success('Role updated')
      void qc.invalidateQueries({ queryKey: ['admins'] })
    },
  })

  const deactivateMut = useMutation({
    mutationFn: deactivateAdmin,
    onSuccess: () => {
      toast.success('Admin deactivated')
      void qc.invalidateQueries({ queryKey: ['admins'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <select
            className="h-8 rounded-md border border-border-default bg-bg-base px-2 text-xs"
            value={row.original.role}
            disabled={row.original.role === 'super_admin'}
            onChange={(e) =>
              roleMut.mutate({ id: row.original.id, role: e.target.value as AdminRole })
            }
          >
            {(Object.keys(ADMIN_ROLE_LABELS) as AdminRole[]).map((r) => (
              <option key={r} value={r}>
                {ADMIN_ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'active' ? 'success' : 'default'}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="danger"
            disabled={row.original.role === 'super_admin' || row.original.status === 'inactive'}
            onClick={() => deactivateMut.mutate(row.original.id)}
          >
            Deactivate
          </Button>
        ),
      },
    ],
    [deactivateMut, roleMut]
  )

  const roles: AdminRole[] = [
    'super_admin',
    'ops_admin',
    'support_agent',
    'finance_admin',
    'auditor',
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Roles & Permissions</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add admin</Button>
          </DialogTrigger>
          <DialogContent title="Add admin" description="Invite a teammate to the console.">
            <form
              onSubmit={form.handleSubmit((d) => createMut.mutate(d))}
              className="space-y-3"
            >
              <input {...form.register('name')} placeholder="Name" className="h-9 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm" />
              <input {...form.register('email')} placeholder="Email" className="h-9 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm" />
              <select {...form.register('role')} className="h-9 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm">
                {(Object.keys(ADMIN_ROLE_LABELS) as AdminRole[]).map((r) => (
                  <option key={r} value={r}>{ADMIN_ROLE_LABELS[r]}</option>
                ))}
              </select>
              <Button type="submit" className="w-full" loading={createMut.isPending}>Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable data={team ?? []} columns={columns} loading={isLoading} />

      <Card>
        <CardHeader><h2 className="font-semibold">Role definitions</h2></CardHeader>
        <CardContent className="space-y-2 text-sm text-text-secondary">
          <p><strong className="text-text-primary">Super Admin</strong> — All modules, all actions</p>
          <p><strong className="text-text-primary">Ops Admin</strong> — Users, KYC, Disputes, Listings</p>
          <p><strong className="text-text-primary">Support Agent</strong> — Disputes edit, Notifications/Users view</p>
          <p><strong className="text-text-primary">Finance Admin</strong> — Subscriptions, Transactions</p>
          <p><strong className="text-text-primary">Auditor</strong> — All modules view-only</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="font-semibold">Permission matrix</h2></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border-light text-text-secondary">
                <th className="px-2 py-2 text-left">Module</th>
                {roles.map((r) => (
                  <th key={r} className="px-2 py-2 text-left">{ADMIN_ROLE_LABELS[r]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((mod) => (
                <tr key={mod} className="border-b border-border-light">
                  <td className="px-2 py-2 capitalize">{mod}</td>
                  {roles.map((role) => {
                    const entry = matrix?.find((m) => m.role === role && m.module === mod)
                    return (
                      <td key={role} className="px-2 py-2 font-mono text-xs text-text-muted">
                        {entry?.actions.join(', ') || '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
