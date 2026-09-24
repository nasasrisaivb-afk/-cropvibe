'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Check, Eye, Minus, Pencil, Plus, Trash2 } from 'lucide-react'
import { getAdminTeam, getPermissionMatrix, MODULES } from '@/lib/api/roles.api'
import type { AdminRole } from '@/lib/types'
import { ADMIN_ROLE_LABELS } from '@/lib/types'
import { NAV_MODULES } from '@/config/navigation'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/loading'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { titleCase } from '@/lib/utils'

const ROLES: { role: AdminRole; summary: string }[] = [
  { role: 'super_admin', summary: 'Everything, including settings, roles and destructive actions.' },
  { role: 'ops_admin', summary: 'Users, KYC, marketplace, services, operations, trust & support.' },
  { role: 'finance_admin', summary: 'Payments, refunds, settlements, payouts and invoices.' },
  { role: 'support_agent', summary: 'Tickets and disputes; read-only on users and orders.' },
  { role: 'auditor', summary: 'Read-only across every module, plus audit log export.' },
]

const ACTIONS = [
  { key: 'view', label: 'View', icon: Eye },
  { key: 'create', label: 'Create', icon: Plus },
  { key: 'edit', label: 'Edit', icon: Pencil },
  { key: 'delete', label: 'Delete', icon: Trash2 },
] as const

function moduleLabel(key: string) {
  if (key === 'kyc') return 'KYC verification'
  if (key === 'roles') return 'Role management'
  return NAV_MODULES.find((m) => m.permission === key)?.label ?? titleCase(key)
}

export default function RolesPage() {
  const { data: team, isLoading } = useQuery({ queryKey: ['resource', 'admins'], queryFn: getAdminTeam })
  const { data: matrix } = useQuery({ queryKey: ['perm-matrix'], queryFn: getPermissionMatrix })

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          Five roles, scoped per module. Every change is written to the audit log and applies on the admin’s next page load.
        </p>
        <Link href="/users/admins" className={buttonVariants({ variant: 'secondary' })}>
          Manage admin team <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {ROLES.map(({ role, summary }) => {
          const members = (team ?? []).filter((a) => a.role === role && a.status === 'active')
          return (
            <section key={role} className="flex flex-col rounded-xl border border-border-default bg-bg-surface p-5 shadow-card">
              <h2 className="font-semibold text-text-primary">{ADMIN_ROLE_LABELS[role]}</h2>
              <p className="mt-1 flex-1 text-sm text-text-secondary">{summary}</p>
              <div className="mt-4 flex items-center justify-between">
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="flex -space-x-2">
                    {members.slice(0, 4).map((m) => (
                      <span key={m.id} className="rounded-full ring-2 ring-bg-surface" title={m.name}>
                        <Avatar name={m.name} size="sm" />
                      </span>
                    ))}
                  </div>
                )}
                <span className="text-xs text-text-muted">
                  {members.length} member{members.length === 1 ? '' : 's'}
                </span>
              </div>
            </section>
          )
        })}
      </div>

      <section className="overflow-hidden rounded-xl border border-border-default bg-bg-surface shadow-card">
        <div className="flex flex-col gap-3 border-b border-border-light px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Permission matrix</h2>
            <p className="text-sm text-text-secondary">What each role can do in each module</p>
          </div>
          <ul className="flex flex-wrap gap-4 text-xs text-text-secondary">
            {ACTIONS.map(({ key, label, icon: Icon }) => (
              <li key={key} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-border-default">
                <th className="cv-th text-left">Module</th>
                {ROLES.map(({ role }) => (
                  <th key={role} className="cv-th text-center">
                    {ADMIN_ROLE_LABELS[role]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((mod) => (
                <tr key={mod} className="border-b border-border-light last:border-0 hover:bg-bg-surfaceHover">
                  <th scope="row" className="cv-td text-left font-medium text-text-primary">
                    {moduleLabel(mod)}
                  </th>
                  {ROLES.map(({ role }) => {
                    const actions = matrix?.find((m) => m.role === role && m.module === mod)?.actions ?? []
                    return (
                      <td key={role} className="cv-td">
                        {actions.length === 0 ? (
                          <span className="flex justify-center text-text-muted" aria-label="No access">
                            <Minus className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="flex justify-center gap-1" aria-label={actions.join(', ')}>
                            {ACTIONS.map(({ key, label, icon: Icon }) => {
                              const on = actions.includes(key)
                              return (
                                <span
                                  key={key}
                                  title={`${label}${on ? '' : ' — not allowed'}`}
                                  className={cn(
                                    'flex h-7 w-7 items-center justify-center rounded-md',
                                    on
                                      ? key === 'delete'
                                        ? 'bg-status-error/15 text-status-error'
                                        : 'bg-brand-lime/15 text-brand-lime'
                                      : 'text-border-strong'
                                  )}
                                >
                                  <Icon className="h-3.5 w-3.5" aria-hidden />
                                </span>
                              )
                            })}
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="flex items-center gap-2 text-sm text-text-muted">
        <Check className="h-4 w-4 text-status-success" aria-hidden />
        Role changes and 2FA resets are made per admin on the Admins page.
      </p>
    </div>
  )
}
