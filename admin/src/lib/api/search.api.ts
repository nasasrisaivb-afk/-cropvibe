import { users, listings, transactions, disputes, kycApplications } from '@/lib/data/seeds'
import { delay } from '@/lib/utils'

export interface SearchResult {
  id: string
  type: 'user' | 'listing' | 'transaction' | 'dispute' | 'kyc'
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

  return results
}
