import { adminUsers } from '@/lib/data/seeds'
import type { AdminRole, AdminUser, Permission } from '@/lib/types'
import { delay } from '@/lib/utils'

const MODULES = [
  'users', 'kyc', 'disputes', 'listings', 'subscriptions',
  'transactions', 'notifications', 'analytics', 'content', 'roles', 'settings',
]

function defaultPerms(role: AdminRole): Permission[] {
  if (role === 'super_admin') {
    return MODULES.map((m) => ({ module: m, actions: ['view', 'create', 'edit', 'delete'] }))
  }
  if (role === 'auditor') {
    return MODULES.map((m) => ({ module: m, actions: ['view'] }))
  }
  if (role === 'ops_admin') {
    return ['users', 'kyc', 'disputes', 'listings', 'notifications', 'analytics'].map((m) => ({
      module: m,
      actions: ['view', 'create', 'edit'],
    }))
  }
  if (role === 'finance_admin') {
    return ['subscriptions', 'transactions', 'analytics', 'settings'].map((m) => ({
      module: m,
      actions: ['view', 'create', 'edit'],
    }))
  }
  return ['disputes', 'notifications', 'users'].map((m) => ({
    module: m,
    actions: m === 'disputes' ? ['view', 'edit'] : ['view'],
  }))
}

export async function getAdminTeam(): Promise<AdminUser[]> {
  await delay()
  return adminUsers
}

export async function createAdmin(payload: {
  name: string
  email: string
  role: AdminRole
}): Promise<AdminUser> {
  await delay(500)
  if (adminUsers.some((a) => a.email.toLowerCase() === payload.email.toLowerCase())) {
    throw new Error('Email already registered')
  }
  const admin: AdminUser = {
    id: `admin-${Date.now()}`,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    permissions: defaultPerms(payload.role),
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  adminUsers.push(admin)
  return admin
}

export async function updateAdminRole(id: string, role: AdminRole): Promise<AdminUser> {
  await delay(400)
  const admin = adminUsers.find((a) => a.id === id)
  if (!admin) throw new Error('Admin not found')
  admin.role = role
  admin.permissions = defaultPerms(role)
  admin.updatedAt = new Date().toISOString()
  return admin
}

export async function deactivateAdmin(id: string): Promise<AdminUser> {
  await delay(400)
  const admin = adminUsers.find((a) => a.id === id)
  if (!admin) throw new Error('Admin not found')
  if (admin.role === 'super_admin') throw new Error('Cannot deactivate super admin')
  admin.status = 'inactive'
  admin.updatedAt = new Date().toISOString()
  return admin
}

export async function getPermissionMatrix(): Promise<
  { role: AdminRole; module: string; actions: string[] }[]
> {
  await delay(300)
  const roles: AdminRole[] = [
    'super_admin',
    'ops_admin',
    'support_agent',
    'finance_admin',
    'auditor',
  ]
  return roles.flatMap((role) =>
    defaultPerms(role).map((p) => ({ role, module: p.module, actions: p.actions }))
  )
}

export { MODULES }
