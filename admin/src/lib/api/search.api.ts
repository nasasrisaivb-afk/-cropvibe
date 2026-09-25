import { users, listings, transactions, disputes, kycApplications } from '@/lib/data/seeds'
import {
  orders,
  payments,
  refunds,
  payouts,
  supportTickets,
  bookings,
  deliveries,
  products,
  invoices,
} from '@/lib/data/ops-seeds'
import { delay, formatInr } from '@/lib/utils'

export interface SearchResult {
  id: string
  type: string
  title: string
  subtitle: string
  href: string
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  await delay(250)
  const q = query.trim().toLowerCase()
  if (!q) return []
  const results: SearchResult[] = []

  users
    .filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q)
    )
    .slice(0, 5)
    .forEach((u) => {
      results.push({
        id: u.id,
        type: 'user',
        title: `${u.firstName} ${u.lastName}`,
        subtitle: u.phone,
        href: `/users/${u.id}`,
      })
    })

  listings
    .filter((l) => l.title.toLowerCase().includes(q) || l.id.toLowerCase().includes(q))
    .slice(0, 4)
    .forEach((l) => {
      results.push({
        id: l.id,
        type: 'listing',
        title: l.title,
        subtitle: l.sellerName,
        href: `/listings/${l.id}`,
      })
    })

  transactions
    .filter((t) => t.id.toLowerCase().includes(q) || (t.gatewayReference ?? '').toLowerCase().includes(q))
    .slice(0, 4)
    .forEach((t) => {
      results.push({
        id: t.id,
        type: 'transaction',
        title: t.id,
        subtitle: `${t.type} · ₹${t.amount}`,
        href: `/transactions/${t.id}`,
      })
    })

  disputes
    .filter(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        d.buyerName.toLowerCase().includes(q) ||
        d.sellerName.toLowerCase().includes(q)
    )
    .slice(0, 3)
    .forEach((d) => {
      results.push({
        id: d.id,
        type: 'dispute',
        title: d.id,
        subtitle: d.reason,
        href: `/disputes/${d.id}`,
      })
    })

  kycApplications
    .filter((k) => k.userName.toLowerCase().includes(q) || k.id.toLowerCase().includes(q))
    .slice(0, 3)
    .forEach((k) => {
      results.push({
        id: k.id,
        type: 'kyc',
        title: k.userName,
        subtitle: `${k.documentType} · ${k.status}`,
        href: `/kyc/${k.id}`,
      })
    })

  results.push(
    ...searchIn(orders, q, 'order', '/marketplace/orders', (r) => `${r.buyerName} ${r.sellerName} ${r.itemSummary}`, (r) => r.id, (r) => `${r.buyerName} · ${formatInr(r.amount)}`),
    ...searchIn(payments, q, 'payment', '/finance/payments', (r) => `${r.payerName} ${r.gatewayRef} ${r.reference}`, (r) => r.id, (r) => `${r.payerName} · ${formatInr(r.amount)}`),
    ...searchIn(refunds, q, 'refund', '/finance/refunds', (r) => `${r.customerName} ${r.paymentId}`, (r) => r.id, (r) => `${r.customerName} · ${formatInr(r.amount)}`),
    ...searchIn(payouts, q, 'payout', '/finance/payouts', (r) => r.beneficiaryName, (r) => r.id, (r) => `${r.beneficiaryName} · ${formatInr(r.amount)}`),
    ...searchIn(invoices, q, 'invoice', '/finance/invoices', (r) => r.billedTo, (r) => r.id, (r) => `${r.billedTo} · ${formatInr(r.total)}`),
    ...searchIn(supportTickets, q, 'ticket', '/support', (r) => `${r.subject} ${r.requesterName}`, (r) => r.subject, (r) => `${r.id} · ${r.requesterName}`),
    ...searchIn(bookings, q, 'booking', '/operations/bookings', (r) => `${r.customerName} ${r.providerName} ${r.serviceName}`, (r) => r.id, (r) => `${r.serviceName} · ${r.customerName}`),
    ...searchIn(deliveries, q, 'delivery', '/operations/deliveries', (r) => `${r.orderId} ${r.driverName} ${r.vehicleNo} ${r.destination}`, (r) => r.id, (r) => `${r.origin} → ${r.destination}`),
    ...searchIn(products, q, 'product', '/marketplace/products', (r) => `${r.name} ${r.sku} ${r.sellerName}`, (r) => r.name, (r) => `${r.id} · ${r.sellerName}`)
  )

  return results.slice(0, 24)
}

function searchIn<T extends { id: string }>(
  rows: T[],
  q: string,
  type: string,
  base: string,
  text: (r: T) => string,
  title: (r: T) => string,
  subtitle: (r: T) => string
): SearchResult[] {
  return rows
    .filter((r) => r.id.toLowerCase().includes(q) || text(r).toLowerCase().includes(q))
    .slice(0, 3)
    .map((r) => ({ id: r.id, type, title: title(r), subtitle: subtitle(r), href: `${base}?id=${encodeURIComponent(r.id)}` }))
}
