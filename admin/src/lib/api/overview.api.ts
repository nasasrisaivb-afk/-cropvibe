import {
  users,
  listings,
  kycApplications,
  subscriptions,
  transactions,
  disputes,
  activities,
  subscriptionPlans,
} from '@/lib/data/seeds'
import type { OverviewKpis, ActivityItem } from '@/lib/types'
import { delay } from '@/lib/utils'
import { USER_ROLE_LABELS } from '@/lib/types'

export async function getOverviewKpis(): Promise<OverviewKpis> {
  await delay()
  const pendingKyc = kycApplications.filter(
    (k) => k.status === 'pending' || k.status === 'in_review'
  )
  const urgentKyc = pendingKyc.filter(
    (k) => Date.now() - new Date(k.submittedAt).getTime() > 48 * 3600000
  )
  const activeListings = listings.filter((l) => l.status === 'active')
  const activeSubs = subscriptions.filter(
    (s) => s.status === 'active' || s.status === 'expiring_soon'
  )
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const monthlyGmv = transactions
    .filter(
      (t) =>
        t.status === 'completed' &&
        t.type === 'payment' &&
        new Date(t.createdAt) >= monthStart
    )
    .reduce((sum, t) => sum + t.amount, 0)
  const openDisputes = disputes.filter((d) => d.status !== 'resolved')

  const userGrowth = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    const key = d.toISOString().slice(0, 10)
    const count = users.filter((u) => u.joinedAt.slice(0, 10) === key).length
    return { date: key, count: count || Math.floor(2 + Math.random() * 6) }
  })

  const roleCounts = new Map<string, number>()
  users.forEach((u) => {
    u.roles.forEach((r) => {
      roleCounts.set(r, (roleCounts.get(r) ?? 0) + 1)
    })
  })
  const roleDistribution = Array.from(roleCounts.entries()).map(([role, count]) => ({
    role: USER_ROLE_LABELS[role as keyof typeof USER_ROLE_LABELS] ?? role,
    count,
  }))

  const transactionVolume = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    const dayTx = transactions.filter((t) => t.createdAt.slice(0, 10) === key)
    return {
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      count: dayTx.length || Math.floor(5 + Math.random() * 20),
      amount: dayTx.reduce((s, t) => s + t.amount, 0) || Math.floor(50000 + Math.random() * 200000),
    }
  })

  const stateMap = new Map<string, { activity: number; gmv: number }>()
  users.forEach((u) => {
    const cur = stateMap.get(u.location.state) ?? { activity: 0, gmv: 0 }
    cur.activity += 1
    stateMap.set(u.location.state, cur)
  })
  transactions
    .filter((t) => t.status === 'completed')
    .forEach((t) => {
      const user = users.find((u) => u.id === t.fromUserId)
      if (!user) return
      const cur = stateMap.get(user.location.state) ?? { activity: 0, gmv: 0 }
      cur.gmv += t.amount
      stateMap.set(user.location.state, cur)
    })
  const regionalActivity = Array.from(stateMap.entries())
    .map(([state, v]) => ({ state, ...v }))
    .sort((a, b) => b.activity - a.activity)
    .slice(0, 10)

  return {
    totalUsers: users.length,
    usersChangeMtd: 12,
    activeListings: activeListings.length,
    listingsChangeMtd: 8,
    pendingKyc: pendingKyc.length,
    urgentKyc: urgentKyc.length,
    activeSubscriptions: activeSubs.length,
    monthlyGmv,
    openDisputes: openDisputes.length,
    userGrowth,
    roleDistribution,
    transactionVolume,
    regionalActivity,
    badgeCounts: {
      users: users.length,
      kyc: pendingKyc.length,
      disputes: openDisputes.length,
      listings: activeListings.length,
    },
  }
}

export async function getRecentActivity(): Promise<ActivityItem[]> {
  await delay(200)
  // Simulate a slight shuffle of timestamps for "live" feel
  return activities.slice(0, 12).map((a, i) =>
    i === 0
      ? { ...a, createdAt: new Date(Date.now() - Math.random() * 120000).toISOString() }
      : a
  )
}

export async function getSubscriptionSummary() {
  await delay()
  return {
    plans: subscriptionPlans,
    mrr: subscriptionPlans.reduce((s, p) => s + p.mrr, 0),
    churnRate: 4.2,
  }
}
