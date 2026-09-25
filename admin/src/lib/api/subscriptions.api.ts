import '@/lib/data/ops-seeds'
import { audit } from '@/lib/data/store'
import { subscriptions, subscriptionPlans, pushActivity } from '@/lib/data/seeds'
import type { PaginatedResult, Subscription, SubscriptionPlan } from '@/lib/types'
import { delay } from '@/lib/utils'

export async function getPlans(): Promise<SubscriptionPlan[]> {
  await delay()
  return subscriptionPlans
}

export async function getSubscriptions(filters: {
  status?: string
  search?: string
  page?: number
  limit?: number
} = {}): Promise<PaginatedResult<Subscription>> {
  await delay()
  let data = [...subscriptions]
  if (filters.status && filters.status !== 'all') {
    data = data.filter((s) => s.status === filters.status)
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    data = data.filter(
      (s) => s.userName.toLowerCase().includes(q) || s.planName.toLowerCase().includes(q)
    )
  }
  const page = filters.page ?? 1
  const limit = filters.limit ?? 50
  const start = (page - 1) * limit
  return { data: data.slice(start, start + limit), total: data.length, page, limit }
}

export async function getSubscriptionById(id: string): Promise<Subscription | null> {
  await delay(300)
  return subscriptions.find((s) => s.id === id) ?? null
}

export async function overrideSubscriptionPlan(
  id: string,
  planId: string
): Promise<Subscription> {
  await delay(500)
  const sub = subscriptions.find((s) => s.id === id)
  if (!sub) throw new Error('Subscription not found')
  const plan = subscriptionPlans.find((p) => p.id === planId)
  if (!plan) throw new Error('Plan not found')
  sub.planId = plan.id
  sub.planName = plan.name
  sub.monthlyPrice = plan.monthlyPrice
  audit('finance', 'Subscription', id, `Overrode plan to ${plan.name}`, { href: `/subscriptions/${id}`, severity: 'warning', collection: 'subscriptions' })
  pushActivity({
    type: 'subscription_changed',
    description: `${sub.userName} plan overridden to ${plan.name}`,
    actorName: 'Admin',
    href: `/subscriptions/${id}`,
  })
  return sub
}

export async function cancelSubscription(id: string, reason: string): Promise<Subscription> {
  await delay(500)
  const sub = subscriptions.find((s) => s.id === id)
  if (!sub) throw new Error('Subscription not found')
  sub.status = 'cancelled'
  sub.cancelledAt = new Date().toISOString()
  sub.reason = reason
  audit('finance', 'Subscription', id, 'Cancelled subscription', { note: reason, href: `/subscriptions/${id}`, severity: 'warning', collection: 'subscriptions' })
  return sub
}

export async function getBillingKpis() {
  await delay()
  const active = subscriptions.filter((s) => s.status === 'active' || s.status === 'expiring_soon')
  const cancelled = subscriptions.filter((s) => s.status === 'cancelled')
  return {
    mrr: subscriptionPlans.reduce((s, p) => s + p.mrr, 0),
    activeCount: active.length,
    churnRate: subscriptions.length
      ? Math.round((cancelled.length / subscriptions.length) * 1000) / 10
      : 0,
    churnReasons: [
      { reason: 'Too expensive', count: 5 },
      { reason: 'Not using enough', count: 3 },
      { reason: 'Switched plan', count: 2 },
    ],
  }
}
