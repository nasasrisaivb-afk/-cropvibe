import '@/lib/data/ops-seeds'
import { users, transactions, listings, subscriptions } from '@/lib/data/seeds'
import type { AnalyticsData } from '@/lib/types'
import { delay } from '@/lib/utils'

export async function getAnalytics(dateFrom?: string, dateTo?: string): Promise<AnalyticsData> {
  await delay(500)
  const from = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 86400000)
  const to = dateTo ? new Date(dateTo) : new Date()

  const inRange = (iso: string) => {
    const d = new Date(iso)
    return d >= from && d <= to
  }

  const newUsers = users.filter((u) => inRange(u.joinedAt)).length
  const activeUsers = users.filter((u) => u.lastActiveAt && inRange(u.lastActiveAt)).length
  const gmv = transactions
    .filter((t) => t.status === 'completed' && t.type === 'payment' && inRange(t.createdAt))
    .reduce((s, t) => s + t.amount, 0)

  const cancelled = subscriptions.filter((s) => s.status === 'cancelled').length
  const churnRate = subscriptions.length
    ? Math.round((cancelled / subscriptions.length) * 1000) / 10
    : 0

  const userAcquisition = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(from.getTime() + i * ((to.getTime() - from.getTime()) / 29))
    return {
      date: d.toISOString().slice(0, 10),
      count: Math.floor(2 + Math.random() * 8),
      role: 'all',
    }
  })

  const gmvTrend = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(from.getTime() + i * ((to.getTime() - from.getTime()) / 29))
    return {
      date: d.toISOString().slice(0, 10),
      amount: Math.floor(30000 + Math.random() * 150000),
    }
  })

  const stateMap = new Map<string, { users: number; gmv: number; churn: number }>()
  users.forEach((u) => {
    const cur = stateMap.get(u.location.state) ?? { users: 0, gmv: 0, churn: 0 }
    cur.users += 1
    stateMap.set(u.location.state, cur)
  })

  return {
    newUsers,
    newUsersChange: 14,
    activeUsers,
    activeUsersChange: 9,
    gmv,
    gmvChange: 11,
    churnRate,
    churnReasons: [
      { reason: 'Too expensive', count: 5 },
      { reason: 'Not using enough', count: 3 },
      { reason: 'Switched plan', count: 2 },
      { reason: 'Other', count: 1 },
    ],
    userAcquisition,
    gmvTrend,
    regional: Array.from(stateMap.entries())
      .map(([state, v]) => ({
        state,
        users: v.users,
        gmv: Math.floor(v.users * 15000 * Math.random()),
        churn: Math.round(Math.random() * 8 * 10) / 10,
      }))
      .sort((a, b) => b.gmv - a.gmv)
      .slice(0, 12),
    topListings: [...listings]
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map((l) => ({ id: l.id, title: l.title, views: l.views, type: l.type })),
  }
}
