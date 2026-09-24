import '@/lib/data/ops-seeds'
import { kycApplications, disputes, users, activities } from '@/lib/data/seeds'
import {
  alerts,
  bookings,
  deliveries,
  financialDisputes,
  listingApprovals,
  logisticsPartners,
  machineryRentals,
  moderationReports,
  orders,
  payments,
  payouts,
  products,
  refunds,
  revenueEntries,
  sellerProfiles,
  supportTickets,
  categories,
} from '@/lib/data/ops-seeds'
import { auditLog } from '@/lib/data/store'
import { computeNavBadges } from './nav.api'
import { delay } from '@/lib/utils'

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
const sumOf = <T,>(rows: T[], f: (r: T) => number) => rows.reduce((s, r) => s + f(r), 0)

/* ───────── Overview ───────── */

export async function getOverview() {
  await delay(350)
  const r = mulberry32(7)
  const liveOrders = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'returned')
  const gmv30 = sumOf(liveOrders, (o) => o.amount) + sumOf(bookings.filter((b) => b.status !== 'cancelled'), (b) => b.amount)
  const revenue30 = sumOf(revenueEntries.filter((e) => e.status === 'recognized' && Date.now() - new Date(e.date).getTime() < 30 * 86400000), (e) => e.amount)
  const activeUsers = users.filter((u) => u.accountStatus === 'active').length

  // Seasonal GMV curve — rabi sowing (Oct–Dec) and harvest (Mar–May) peaks
  const season = [1.05, 1.18, 1.1, 0.86, 0.92, 1.24, 1.36, 1.28, 0.98, 0.9, 0.94, 1.08]
  const salesPerformance = MONTHS.map((m, i) => ({
    month: m,
    thisYear: Math.round(season[i]! * (62 + i * 3.2) * 100000 * (0.95 + r() * 0.1)),
    lastYear: Math.round(season[i]! * (41 + i * 2.1) * 100000 * (0.95 + r() * 0.1)),
  }))

  const salesByPlatform = [
    { label: 'Mobile App', value: Math.round(gmv30 * 0.58), sub: 'Android 91%' },
    { label: 'Marketplace', value: Math.round(gmv30 * 0.21), sub: 'Web buyers' },
    { label: 'Website', value: Math.round(gmv30 * 0.13), sub: 'Desktop' },
    { label: 'Social Commerce', value: Math.round(gmv30 * 0.08), sub: 'WhatsApp catalogue' },
  ]

  const badges = computeNavBadges()
  return {
    headline: {
      gmv30,
      gmvTrend: 12.4,
      revenue30,
      revenueTrend: 18.6,
      orders30: orders.length + bookings.length,
      ordersTrend: 8.1,
      activeUsers,
      usersTrend: 5.3,
    },
    queues: {
      pendingActions: badges.pendingActions,
      alerts: alerts.filter((a) => a.status === 'open').length,
      criticalAlerts: alerts.filter((a) => a.status === 'open' && a.severity === 'critical').length,
      kyc: badges.kyc,
      kycOverdue: kycApplications.filter((k) => (k.status === 'pending' || k.status === 'in_review') && Date.now() - new Date(k.submittedAt).getTime() > 48 * 3600000).length,
      disputes: badges.disputes + badges.financialDisputes,
      support: badges.support,
    },
    salesByPlatform,
    salesPerformance,
    recentPayments: [...payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8),
    topCategories: categories
      .filter((c) => !c.parent)
      .sort((a, b) => b.gmv30d - a.gmv30d)
      .slice(0, 5)
      .map((c) => ({ label: c.name, value: c.gmv30d })),
  }
}

/* ───────── Activity ───────── */

export interface FeedItem {
  id: string
  at: string
  actor: string
  kind: 'admin' | 'platform'
  module: string
  text: string
  href?: string
  severity?: 'info' | 'warning' | 'critical'
}

export async function getActivityFeed(): Promise<FeedItem[]> {
  await delay(250)
  const admin: FeedItem[] = auditLog.map((a) => ({
    id: a.id,
    at: a.at,
    actor: a.actor,
    kind: 'admin',
    module: a.module,
    text: `${a.action} · ${a.entity} ${a.entityId}`,
    href: a.href,
    severity: a.severity,
  }))
  const platform: FeedItem[] = [
    ...orders.slice(0, 20).map((o) => ({ id: `o-${o.id}`, at: o.placedAt, actor: o.buyerName, kind: 'platform' as const, module: 'marketplace', text: `placed ${o.id} — ${o.itemSummary}`, href: `/marketplace/orders?id=${o.id}` })),
    ...bookings.slice(0, 16).map((b) => ({ id: `b-${b.id}`, at: b.createdAt, actor: b.customerName, kind: 'platform' as const, module: 'operations', text: `booked ${b.serviceName}`, href: `/operations/bookings?id=${b.id}` })),
    ...supportTickets.slice(0, 12).map((t) => ({ id: `t-${t.id}`, at: t.createdAt, actor: t.requesterName, kind: 'platform' as const, module: 'support', text: `opened ticket “${t.subject}”`, href: `/support?id=${t.id}` })),
    ...listingApprovals.slice(0, 12).map((l) => ({ id: `l-${l.id}`, at: l.submittedAt, actor: l.sellerName, kind: 'platform' as const, module: 'marketplace', text: `submitted “${l.listingTitle}” for review`, href: `/marketplace/approvals?id=${l.id}` })),
    ...activities.slice(0, 12).map((a) => ({ id: `a-${a.id}`, at: a.createdAt, actor: a.actorName, kind: 'platform' as const, module: 'users', text: a.description, href: a.href })),
  ]
  return [...admin, ...platform].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 80)
}

/* ───────── Revenue ───────── */

export async function getRevenueInsights() {
  await delay(350)
  const r = mulberry32(11)
  const streams = new Map<string, number>()
  revenueEntries
    .filter((e) => e.status === 'recognized')
    .forEach((e) => streams.set(e.stream, (streams.get(e.stream) ?? 0) + e.amount))
  const byStream = Array.from(streams.entries()).map(([label, value]) => ({ label, value: value * 4 })).sort((a, b) => b.value - a.value)
  const monthly = MONTHS.map((m, i) => ({
    month: m,
    revenue: Math.round((14 + i * 1.6 + r() * 3) * 100000),
    lastYear: Math.round((8 + i * 1.1 + r() * 2) * 100000),
  }))
  const yearly = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map((y, i) => ({
    year: String(y),
    revenue: Math.round(Math.pow(1.72, i) * 1400000 * (0.9 + r() * 0.2)),
  }))
  const takeRate = categories
    .filter((c) => !c.parent)
    .map((c) => ({ label: c.name, value: c.commission }))
    .sort((a, b) => b.value - a.value)
  const total = monthly.reduce((s, m) => s + m.revenue, 0)
  return {
    total12m: total,
    mrrSubscriptions: 486000,
    takeRateOverall: 4.1,
    arpu: Math.round(total / users.length / 12),
    monthly,
    yearly,
    byStream,
    takeRateByCategory: takeRate,
  }
}

/* ───────── Transactions monitor ───────── */

export async function getTransactionMonitor() {
  await delay(300)
  const r = mulberry32(19)
  const hours = Array.from({ length: 24 }, (_, i) => {
    const h = (new Date().getHours() - 23 + i + 24) % 24
    const base = h >= 6 && h <= 21 ? 90 + Math.sin(((h - 6) / 15) * Math.PI) * 160 : 25
    return {
      hour: `${String(h).padStart(2, '0')}:00`,
      volume: Math.round(base * (0.85 + r() * 0.3)),
      yesterday: Math.round(base * (0.8 + r() * 0.3)),
    }
  })
  const methods = ['UPI', 'Card', 'Net banking', 'Wallet'] as const
  const byMethod = methods.map((m) => {
    const rows = payments.filter((p) => p.method === m && p.status !== 'pending')
    const ok = rows.filter((p) => p.status !== 'failed').length
    return { label: m, value: rows.length ? Math.round((ok / rows.length) * 1000) / 10 : 100, sub: `${rows.length} attempts` }
  })
  const gateways = (['Razorpay', 'PayU', 'Cashfree'] as const).map((g) => {
    const rows = payments.filter((p) => p.gateway === g && p.status !== 'pending')
    const ok = rows.filter((p) => p.status !== 'failed').length
    return {
      gateway: g,
      successRate: rows.length ? Math.round((ok / rows.length) * 1000) / 10 : 100,
      volume: sumOf(rows, (p) => p.amount),
      latencyMs: g === 'PayU' ? 1840 : g === 'Razorpay' ? 620 : 710,
      status: g === 'PayU' ? 'degraded' : 'operational',
    }
  })
  const failures = payments.filter((p) => p.status === 'failed').sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8)
  const captured = payments.filter((p) => p.status === 'captured')
  return {
    hours,
    byMethod,
    gateways,
    failures,
    todayVolume: hours.slice(-12).reduce((s, h) => s + h.volume, 0),
    avgTicket: Math.round(sumOf(captured, (p) => p.amount) / Math.max(1, captured.length)),
    refundsPending: refunds.filter((x) => x.status === 'requested').length,
    payoutsPending: payouts.filter((x) => x.status === 'pending_approval').length,
  }
}

/* ───────── Pending actions ───────── */

export interface PendingItem {
  id: string
  title: string
  meta: string
  waitingSince: string
  href: string
  urgent?: boolean
}

export interface PendingGroup {
  key: string
  label: string
  module: string
  href: string
  count: number
  slaHours: number
  items: PendingItem[]
}

const olderFirst = <T extends { at: string }>(rows: T[]) => [...rows].sort((a, b) => a.at.localeCompare(b.at))

export async function getPendingActions(): Promise<PendingGroup[]> {
  await delay(300)
  const overdue = (iso: string, h: number) => Date.now() - new Date(iso).getTime() > h * 3600000
  const groups: PendingGroup[] = [
    {
      key: 'kyc',
      label: 'KYC reviews',
      module: 'Users & Roles',
      href: '/kyc?status=pending',
      slaHours: 48,
      items: olderFirst(kycApplications.filter((k) => k.status === 'pending' || k.status === 'in_review').map((k) => ({ at: k.submittedAt, k }))).map(({ k }) => ({
        id: k.id,
        title: `${k.userName} — ${k.documentType.toUpperCase()}`,
        meta: `${k.location.district}, ${k.location.state}`,
        waitingSince: k.submittedAt,
        href: `/kyc/${k.id}`,
        urgent: overdue(k.submittedAt, 48),
      })),
      count: 0,
    },
    {
      key: 'listings',
      label: 'Listing approvals',
      module: 'Marketplace',
      href: '/marketplace/approvals',
      slaHours: 24,
      items: olderFirst(listingApprovals.filter((l) => l.status === 'pending').map((l) => ({ at: l.submittedAt, l }))).map(({ l }) => ({
        id: l.id,
        title: l.listingTitle,
        meta: `${l.sellerName} · ${l.risk} risk`,
        waitingSince: l.submittedAt,
        href: `/marketplace/approvals?id=${l.id}`,
        urgent: l.risk === 'high' || overdue(l.submittedAt, 24),
      })),
      count: 0,
    },
    {
      key: 'disputes',
      label: 'Order & service disputes',
      module: 'Trust & Safety',
      href: '/disputes',
      slaHours: 168,
      items: olderFirst(disputes.filter((d) => d.status !== 'resolved').map((d) => ({ at: d.createdAt, d }))).map(({ d }) => ({
        id: d.id,
        title: `${d.reason} — ₹${d.amount.toLocaleString('en-IN')}`,
        meta: `${d.buyerName} vs ${d.sellerName}`,
        waitingSince: d.createdAt,
        href: `/disputes/${d.id}`,
        urgent: d.status === 'escalated' || new Date(d.slaDeadline).getTime() < Date.now(),
      })),
      count: 0,
    },
    {
      key: 'refunds',
      label: 'Refund approvals',
      module: 'Finance',
      href: '/finance/refunds',
      slaHours: 24,
      items: olderFirst(refunds.filter((x) => x.status === 'requested').map((x) => ({ at: x.requestedAt, x }))).map(({ x }) => ({
        id: x.id,
        title: `₹${x.amount.toLocaleString('en-IN')} to ${x.customerName}`,
        meta: x.reason,
        waitingSince: x.requestedAt,
        href: `/finance/refunds?id=${x.id}`,
        urgent: overdue(x.requestedAt, 24),
      })),
      count: 0,
    },
    {
      key: 'payouts',
      label: 'Payout approvals',
      module: 'Finance',
      href: '/finance/payouts',
      slaHours: 24,
      items: payouts
        .filter((p) => p.status === 'pending_approval' || p.status === 'failed')
        .map((p) => ({
          id: p.id,
          title: `₹${p.amount.toLocaleString('en-IN')} to ${p.beneficiaryName}`,
          meta: p.status === 'failed' ? 'Transfer failed — retry' : `${p.beneficiaryRole} · ${p.cycle}`,
          waitingSince: p.history?.[0]?.at ?? p.scheduledFor,
          href: `/finance/payouts?id=${p.id}`,
          urgent: p.status === 'failed',
        })),
      count: 0,
    },
    {
      key: 'chargebacks',
      label: 'Chargebacks & payment disputes',
      module: 'Finance',
      href: '/finance/disputes',
      slaHours: 168,
      items: financialDisputes
        .filter((d) => d.status === 'open')
        .sort((a, b) => a.respondBy.localeCompare(b.respondBy))
        .map((d) => ({
          id: d.id,
          title: `${d.disputeType} — ₹${d.amount.toLocaleString('en-IN')}`,
          meta: `${d.customerName} · ${d.gateway}`,
          waitingSince: d.raisedAt,
          href: `/finance/disputes?id=${d.id}`,
          urgent: new Date(d.respondBy).getTime() - Date.now() < 48 * 3600000,
        })),
      count: 0,
    },
    {
      key: 'moderation',
      label: 'Moderation queue',
      module: 'Trust & Safety',
      href: '/moderation',
      slaHours: 12,
      items: moderationReports
        .filter((m) => m.status === 'open' || m.status === 'escalated')
        .sort((a, b) => b.aiScore - a.aiScore)
        .map((m) => ({
          id: m.id,
          title: m.reason,
          meta: `${m.contentType} · ${m.reportedUserName}`,
          waitingSince: m.createdAt,
          href: `/moderation?id=${m.id}`,
          urgent: m.severity === 'high',
        })),
      count: 0,
    },
    {
      key: 'bookings',
      label: 'Booking confirmations',
      module: 'Bookings & Ops',
      href: '/operations/bookings?tab=requested',
      slaHours: 6,
      items: bookings
        .filter((b) => b.status === 'requested')
        .map((b) => ({
          id: b.id,
          title: `${b.serviceName} for ${b.customerName}`,
          meta: `${b.serviceType} · ${b.district}`,
          waitingSince: b.createdAt,
          href: `/operations/bookings?id=${b.id}`,
          urgent: overdue(b.createdAt, 6),
        })),
      count: 0,
    },
  ]
  return groups.map((g) => ({ ...g, count: g.items.length }))
}

/* ───────── Marketplace & operations reports ───────── */

export async function getMarketplaceReport() {
  await delay(300)
  const r = mulberry32(23)
  const catGmv = categories.filter((c) => !c.parent).map((c) => ({ label: c.name, value: c.gmv30d })).sort((a, b) => b.value - a.value)
  const stateMap = new Map<string, number>()
  orders.forEach((o) => stateMap.set(o.state, (stateMap.get(o.state) ?? 0) + o.amount))
  const byState = Array.from(stateMap.entries()).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 8)
  const funnel = [
    { label: 'Product views', value: 184200 },
    { label: 'Added to cart', value: 21400 },
    { label: 'Checkout started', value: 9800 },
    { label: 'Orders placed', value: 6120 },
    { label: 'Delivered', value: 5480 },
  ]
  const weekly = Array.from({ length: 12 }, (_, i) => ({
    week: `W${25 + i}`,
    orders: Math.round((380 + i * 22) * (0.9 + r() * 0.2)),
  }))
  const topSellers = [...sellerProfiles].sort((a, b) => b.gmv30d - a.gmv30d).slice(0, 6)
  const topProducts = [...products].sort((a, b) => b.orders30d - a.orders30d).slice(0, 6)
  return { catGmv, byState, funnel, weekly, topSellers, topProducts }
}

export async function getOperationsReport() {
  await delay(300)
  const r = mulberry32(29)
  const carriers = logisticsPartners.filter((l) => l.status === 'active').map((l) => ({ label: l.name, value: l.onTimeRate })).sort((a, b) => b.value - a.value)
  const typeMap = new Map<string, number>()
  bookings.forEach((b) => typeMap.set(b.serviceType, (typeMap.get(b.serviceType) ?? 0) + 1))
  const byType = Array.from(typeMap.entries()).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
  const utilisation = ['Tractor', 'Harvester', 'Rotavator', 'Sprayer', 'Seed drill', 'Drone'].map((t) => {
    const rows = machineryRentals.filter((m) => m.machineType === t)
    return { label: t, value: rows.length ? Math.round(rows.reduce((s, m) => s + m.utilisation, 0) / rows.length) : 0 }
  })
  const weekly = Array.from({ length: 12 }, (_, i) => ({
    week: `W${25 + i}`,
    onTime: Math.round((88 + r() * 8) * 10) / 10,
    target: 95,
  }))
  const delivered = deliveries.filter((d) => d.status === 'delivered').length
  const delayed = deliveries.filter((d) => d.status === 'delayed').length
  return {
    carriers,
    byType,
    utilisation,
    weekly,
    kpis: {
      onTime: Math.round((delivered / Math.max(1, delivered + delayed)) * 1000) / 10,
      bookingCompletion: Math.round((bookings.filter((b) => b.status === 'completed').length / Math.max(1, bookings.filter((b) => ['completed', 'cancelled', 'no_show', 'disputed'].includes(b.status)).length)) * 1000) / 10,
      avgUtilisation: Math.round(machineryRentals.reduce((s, m) => s + m.utilisation, 0) / machineryRentals.length),
      activeShipments: deliveries.filter((d) => ['in_transit', 'out_for_delivery', 'awaiting_pickup', 'delayed'].includes(d.status)).length,
    },
  }
}

/* ───────── Platform performance ───────── */

export async function getPlatformPerformance() {
  await delay(300)
  const r = mulberry32(31)
  const latency = Array.from({ length: 24 }, (_, i) => {
    const h = (new Date().getHours() - 23 + i + 24) % 24
    const peak = h >= 9 && h <= 20 ? 1 : 0
    return {
      hour: `${String(h).padStart(2, '0')}:00`,
      p95: Math.round(280 + peak * 180 + r() * 140 + (i === 20 ? 420 : 0)),
      p50: Math.round(90 + peak * 40 + r() * 30),
    }
  })
  const errors = Array.from({ length: 24 }, (_, i) => ({
    hour: latency[i]!.hour,
    rate: Math.round((0.2 + r() * 0.5 + (i === 20 ? 1.6 : 0)) * 100) / 100,
  }))
  const services = [
    { name: 'Web & mobile API', status: 'operational', uptime: 99.98, p95: 412 },
    { name: 'Search', status: 'degraded', uptime: 99.71, p95: 912 },
    { name: 'Payments', status: 'degraded', uptime: 99.62, p95: 1840 },
    { name: 'Notifications (SMS / WhatsApp)', status: 'degraded', uptime: 99.4, p95: 2300 },
    { name: 'KYC & DigiLocker', status: 'operational', uptime: 99.93, p95: 780 },
    { name: 'Tracking & maps', status: 'operational', uptime: 99.99, p95: 210 },
    { name: 'Admin console', status: 'operational', uptime: 100, p95: 180 },
  ] as const
  const incidents = [
    { id: 'INC-418', title: 'PayU UPI success rate below 95%', started: new Date(Date.now() - 42 * 60000).toISOString(), status: 'Investigating', severity: 'SEV-2' },
    { id: 'INC-417', title: 'Search p95 latency above 800ms', started: new Date(Date.now() - 3.5 * 3600000).toISOString(), status: 'Monitoring', severity: 'SEV-3' },
    { id: 'INC-416', title: 'Jio SMS OTP delivery degraded', started: new Date(Date.now() - 9 * 3600000).toISOString(), status: 'Mitigated — WhatsApp OTP failover', severity: 'SEV-3' },
    { id: 'INC-412', title: 'Image CDN 5xx in ap-south-1', started: new Date(Date.now() - 4 * 86400000).toISOString(), status: 'Resolved', severity: 'SEV-2' },
  ]
  const app = [
    { label: 'Android crash-free sessions', value: 99.4 },
    { label: 'iOS crash-free sessions', value: 99.7 },
    { label: 'Cold start under 3s (Android Go)', value: 87.2 },
    { label: 'Offline sync success', value: 96.8 },
  ]
  return { latency, errors, services, incidents, app, uptime30d: 99.91, apdex: 0.93 }
}
