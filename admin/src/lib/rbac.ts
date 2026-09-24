'use client'

import { useSession } from 'next-auth/react'
import type { Permission, PermissionAction, PermissionModule } from '@/lib/types'
import { ADMIN_ROLE_LABELS } from '@/lib/types'

export function can(
  permissions: Permission[] | undefined,
  module: PermissionModule,
  action: PermissionAction = 'view'
): boolean {
  if (!permissions) return false
  return permissions.some((p) => p.module === module && p.actions.includes(action))
}

/** Capabilities of the signed-in admin on one console module. */
export function usePermission(module: PermissionModule) {
  const { data, status } = useSession()
  const permissions = data?.user?.permissions
  // While the session loads, render read-only rather than flashing actions in and out.
  const ready = status !== 'loading'
  return {
    ready,
    canView: can(permissions, module, 'view'),
    canCreate: ready && can(permissions, module, 'create'),
    canEdit: ready && can(permissions, module, 'edit'),
    canDelete: ready && can(permissions, module, 'delete'),
  }
}

/** Name + role label stamped onto audit entries for actions taken in this session. */
export function useActor(): { name: string; role: string } {
  const { data } = useSession()
  const role = data?.user?.role
  return {
    name: data?.user?.name ?? 'Admin',
    role: role ? ADMIN_ROLE_LABELS[role] : 'Admin',
  }
}
