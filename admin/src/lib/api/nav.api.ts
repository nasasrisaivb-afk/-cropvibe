import '@/lib/data/ops-seeds'
import { kycApplications, disputes } from '@/lib/data/seeds'
import {
  alerts,
  listingApprovals,
  orders,
  financialDisputes,
  refunds,
  payouts,
  moderationReports,
  supportTickets,
  bookings,
  deliveries,
} from '@/lib/data/ops-seeds'
import type { NavBadgeKey } from '@/config/navigation'
import { delay } from '@/lib/utils'

export type NavBadges = Record<NavBadgeKey, number>

export function computeNavBadges(): NavBadges {
  const counts = {
    alerts: alerts.filter((a) => a.status === 'open' && (a.severity === 'critical' || a.severity === 'high')).length,
    kyc: kycApplications.filter((k) => k.status === 'pending' || k.status === 'in_review').length,
    listingApprovals: listingApprovals.filter((l) => l.status === 'pending').length,
    orders: orders.filter((o) => o.status === 'placed').length,
    disputes: disputes.filter((d) => d.status !== 'resolved').length,
    financialDisputes: financialDisputes.filter((d) => d.status === 'open').length,
    refunds: refunds.filter((r) => r.status === 'requested').length,
    payouts: payouts.filter((p) => p.status === 'pending_approval' || p.status === 'failed').length,
    moderation: moderationReports.filter((m) => m.status === 'open' || m.status === 'escalated').length,
    support: supportTickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length,
    bookings: bookings.filter((b) => b.status === 'requested').length,
    deliveries: deliveries.filter((d) => d.status === 'delayed' || d.status === 'failed').length,
  }
  return {
    ...counts,
    pendingActions:
      counts.kyc +
      counts.listingApprovals +
      counts.disputes +
      counts.financialDisputes +
      counts.refunds +
      counts.payouts +
      counts.moderation +
      counts.bookings,
  }
}

export async function getNavBadges(): Promise<NavBadges> {
  await delay(150)
  return computeNavBadges()
}
