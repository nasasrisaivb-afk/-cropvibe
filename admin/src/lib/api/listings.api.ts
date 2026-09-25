import '@/lib/data/ops-seeds'
import { audit } from '@/lib/data/store'
import { listings, pushActivity } from '@/lib/data/seeds'
import type { Listing, PaginatedResult } from '@/lib/types'
import { delay } from '@/lib/utils'

export interface ListingFilters {
  type?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

export async function getListings(filters: ListingFilters = {}): Promise<PaginatedResult<Listing>> {
  await delay()
  let data = [...listings]
  if (filters.type && filters.type !== 'all') {
    data = data.filter((l) => l.type === filters.type)
  }
  if (filters.status && filters.status !== 'all') {
    data = data.filter((l) => l.status === filters.status)
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    data = data.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.sellerName.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q)
    )
  }
  data.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const page = filters.page ?? 1
  const limit = filters.limit ?? 50
  const start = (page - 1) * limit
  return { data: data.slice(start, start + limit), total: data.length, page, limit }
}

export async function getListingById(id: string): Promise<Listing | null> {
  await delay(300)
  return listings.find((l) => l.id === id) ?? null
}

export async function moderateListing(
  id: string,
  action: 'approve' | 'flag' | 'remove' | 'feature' | 'archive',
  reason?: string,
  notes?: string
): Promise<Listing> {
  await delay(500)
  const listing = listings.find((l) => l.id === id)
  if (!listing) throw new Error('Listing not found')
  if (action === 'approve') listing.status = 'active'
  if (action === 'flag') {
    listing.status = 'flagged'
    listing.flagReason = reason
  }
  if (action === 'remove') {
    listing.status = 'removed'
    listing.removalReason = reason
  }
  if (action === 'archive') listing.status = 'archived'
  if (action === 'feature') listing.views += 100
  listing.internalNotes = notes
  listing.updatedAt = new Date().toISOString()
  audit('marketplace', 'Listing', id, `${action.charAt(0).toUpperCase()}${action.slice(1)} listing`, { note: reason, href: `/listings/${id}`, severity: action === 'remove' ? 'warning' : 'info', collection: 'listings' })
  pushActivity({
    type: 'listing_moderated',
    description: `Listing "${listing.title}" ${action}`,
    actorName: 'Admin',
    href: `/listings/${id}`,
  })
  return listing
}

export async function getListingCounts(): Promise<{
  byType: Record<string, number>
  byStatus: Record<string, number>
}> {
  await delay(200)
  const byType: Record<string, number> = { all: listings.length }
  const byStatus: Record<string, number> = { all: listings.length }
  listings.forEach((l) => {
    byType[l.type] = (byType[l.type] ?? 0) + 1
    byStatus[l.status] = (byStatus[l.status] ?? 0) + 1
  })
  return { byType, byStatus }
}
