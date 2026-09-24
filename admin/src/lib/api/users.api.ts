import '@/lib/data/ops-seeds'
import { audit, getCurrentActor } from '@/lib/data/store'
import { users, pushActivity } from '@/lib/data/seeds'
import type { AccountStatus, PaginatedResult, User, UserRole, KycStatus } from '@/lib/types'
import { delay } from '@/lib/utils'

export interface UserFilters {
  role?: UserRole | 'all'
  status?: AccountStatus | 'all'
  kyc?: KycStatus | 'all'
  location?: string
  search?: string
  sortBy?: 'name' | 'role' | 'location' | 'joinedAt'
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
  dateFrom?: string
  dateTo?: string
}

export async function getUsers(filters: UserFilters = {}): Promise<PaginatedResult<User>> {
  await delay()
  let data = [...users]
  if (filters.role && filters.role !== 'all') {
    data = data.filter((u) => u.roles.includes(filters.role as UserRole))
  }
  if (filters.status && filters.status !== 'all') {
    data = data.filter((u) => u.accountStatus === filters.status)
  }
  if (filters.kyc && filters.kyc !== 'all') {
    data = data.filter((u) => u.kyc === filters.kyc)
  }
  if (filters.location) {
    data = data.filter((u) => u.location.state === filters.location)
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    data = data.filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q)
    )
  }
  if (filters.dateFrom) {
    data = data.filter((u) => u.joinedAt >= filters.dateFrom!)
  }
  if (filters.dateTo) {
    data = data.filter((u) => u.joinedAt <= filters.dateTo!)
  }

  const sortBy = filters.sortBy ?? 'joinedAt'
  const dir = filters.sortDir === 'asc' ? 1 : -1
  data.sort((a, b) => {
    if (sortBy === 'name') {
      return (`${a.firstName} ${a.lastName}`).localeCompare(`${b.firstName} ${b.lastName}`) * dir
    }
    if (sortBy === 'role') {
      return (a.roles[0] ?? '').localeCompare(b.roles[0] ?? '') * dir
    }
    if (sortBy === 'location') {
      return a.location.state.localeCompare(b.location.state) * dir
    }
    return a.joinedAt.localeCompare(b.joinedAt) * dir
  })

  const page = filters.page ?? 1
  const limit = filters.limit ?? 50
  const start = (page - 1) * limit
  return {
    data: data.slice(start, start + limit),
    total: data.length,
    page,
    limit,
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  await delay(300)
  return users.find((u) => u.id === userId) ?? null
}

export async function updateUserStatus(
  userId: string,
  status: AccountStatus,
  reason?: string
): Promise<User> {
  await delay(500)
  const user = users.find((u) => u.id === userId)
  if (!user) throw new Error('User not found')
  user.accountStatus = status
  audit('users', 'User', userId, `Set account to ${status}`, { note: reason, href: `/users/${userId}`, severity: status === 'banned' ? 'critical' : status === 'active' ? 'info' : 'warning', collection: 'users' })
  pushActivity({
    type: 'user_status',
    description: `${user.firstName} ${user.lastName} set to ${status}${reason ? `: ${reason}` : ''}`,
    actorName: 'Admin',
    href: `/users/${userId}`,
  })
  return user
}

export async function bulkUpdateUserStatus(
  userIds: string[],
  status: AccountStatus
): Promise<number> {
  await delay(600)
  let count = 0
  userIds.forEach((id) => {
    const user = users.find((u) => u.id === id)
    if (user) {
      user.accountStatus = status
      count++
    }
  })
  audit('users', 'Users (bulk)', `${count} users`, `Set ${count} accounts to ${status}`, { severity: 'warning', collection: 'users' })
  return count
}

export async function softDeleteUser(userId: string, reason: string): Promise<User> {
  await delay(500)
  const user = users.find((u) => u.id === userId)
  if (!user) throw new Error('User not found')
  user.accountStatus = 'inactive'
  audit('users', 'User', userId, 'Soft-deleted account', { note: reason, href: `/users/${userId}`, severity: 'critical', collection: 'users' })
  user.notes = [
    ...(user.notes ?? []),
    {
      id: `note-${Date.now()}`,
      text: `Soft deleted: ${reason}`,
      adminId: 'admin-1',
      adminName: getCurrentActor().name,
      createdAt: new Date().toISOString(),
    },
  ]
  return user
}

export async function addUserNote(userId: string, text: string, adminName: string): Promise<User> {
  await delay(400)
  const user = users.find((u) => u.id === userId)
  if (!user) throw new Error('User not found')
  user.notes = [
    {
      id: `note-${Date.now()}`,
      text,
      adminId: 'admin-1',
      adminName,
      createdAt: new Date().toISOString(),
    },
    ...(user.notes ?? []),
  ]
  audit('users', 'User', userId, 'Added internal note', { note: text, href: `/users/${userId}`, collection: 'users' })
  return user
}

export async function getUserCountsByRole(): Promise<Record<string, number>> {
  await delay(200)
  const counts: Record<string, number> = { all: users.length }
  users.forEach((u) => {
    u.roles.forEach((r) => {
      counts[r] = (counts[r] ?? 0) + 1
    })
  })
  return counts
}
