import { notifications, broadcasts } from '@/lib/data/seeds'
import type { BroadcastResult, SystemNotification } from '@/lib/types'
import { delay } from '@/lib/utils'
import { users } from '@/lib/data/seeds'

export async function getNotifications(): Promise<SystemNotification[]> {
  await delay()
  return [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function markNotificationRead(id: string): Promise<SystemNotification> {
  await delay(200)
  const n = notifications.find((x) => x.id === id)
  if (!n) throw new Error('Notification not found')
  n.read = true
  return n
}

export async function dismissNotification(id: string): Promise<void> {
  await delay(200)
  const n = notifications.find((x) => x.id === id)
  if (!n) throw new Error('Notification not found')
  n.dismissedAt = new Date().toISOString()
  n.read = true
}

export async function getUnreadCount(): Promise<number> {
  await delay(150)
  return notifications.filter((n) => !n.read && !n.dismissedAt).length
}

export async function previewAudience(params: {
  mode: 'all' | 'role' | 'location' | 'subscription'
  roles?: string[]
  states?: string[]
}): Promise<number> {
  await delay(300)
  if (params.mode === 'all') return users.length
  if (params.mode === 'role' && params.roles?.length) {
    return users.filter((u) => u.roles.some((r) => params.roles!.includes(r))).length
  }
  if (params.mode === 'location' && params.states?.length) {
    return users.filter((u) => params.states!.includes(u.location.state)).length
  }
  return Math.floor(users.length * 0.3)
}

export async function sendBroadcast(payload: {
  title: string
  body: string
  channels: string[]
  audience: string
  audienceCount: number
}): Promise<BroadcastResult> {
  await delay(700)
  const result: BroadcastResult = {
    id: `bc-${Date.now()}`,
    title: payload.title,
    body: payload.body,
    channels: payload.channels,
    audience: payload.audience,
    audienceCount: payload.audienceCount,
    sent: payload.audienceCount,
    delivered: Math.floor(payload.audienceCount * 0.97),
    opened: Math.floor(payload.audienceCount * 0.38),
    clicked: Math.floor(payload.audienceCount * 0.12),
    createdAt: new Date().toISOString(),
  }
  broadcasts.unshift(result)
  return result
}

export async function getBroadcasts(): Promise<BroadcastResult[]> {
  await delay()
  return broadcasts
}
