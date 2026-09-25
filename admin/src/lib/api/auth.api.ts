import '@/lib/data/ops-seeds'
import { adminUsers, DEMO_PASSWORD } from '@/lib/data/seeds'
import type { AdminUser } from '@/lib/types'
import { delay } from '@/lib/utils'

export async function loginMockApi(
  emailOrPhone: string,
  password: string
): Promise<AdminUser | null> {
  await delay(500)
  if (password !== DEMO_PASSWORD) return null
  const user = adminUsers.find(
    (a) =>
      a.email.toLowerCase() === emailOrPhone.toLowerCase() ||
      a.phone === emailOrPhone
  )
  if (!user || user.status !== 'active') return null
  return { ...user, lastLogin: new Date().toISOString() }
}

export async function requestPasswordReset(email: string): Promise<{ ok: boolean }> {
  await delay(400)
  const exists = adminUsers.some((a) => a.email.toLowerCase() === email.toLowerCase())
  if (!exists) throw new Error('No account found with that email')
  return { ok: true }
}
