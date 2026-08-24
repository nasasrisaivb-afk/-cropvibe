import type {
  PriceFilter,
  ServiceCategory,
  ServiceFiltersState,
  ServiceItem,
  SortOption,
} from './serviceCatalogTypes'
import { SERVICE_CATALOG } from './serviceCatalogData'

export function getAllServices(category: ServiceCategory): ServiceItem[] {
  return SERVICE_CATALOG[category]
}

export function getServiceById(category: ServiceCategory, id: string): ServiceItem | undefined {
  return SERVICE_CATALOG[category].find((s) => s.id === id)
}

export function getLocations(category: ServiceCategory): string[] {
  const set = new Set(SERVICE_CATALOG[category].map((s) => s.location))
  return Array.from(set).sort()
}

export function matchesPrice(rate: number, price: PriceFilter): boolean {
  if (price === 'all') return true
  if (price === 'under1k') return rate < 1000
  if (price === '1k-5k') return rate >= 1000 && rate <= 5000
  if (price === '5k-10k') return rate > 5000 && rate <= 10000
  return rate > 10000
}

export function filterAndSortServices(
  category: ServiceCategory,
  filters: ServiceFiltersState,
): ServiceItem[] {
  const query = filters.q.trim().toLowerCase()

  let items = SERVICE_CATALOG[category].filter((item) => {
    const matchQ =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.subtitle.toLowerCase().includes(query) ||
      item.provider.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.providerProfile.specializations.some((s) => s.toLowerCase().includes(query))

    const matchStatus = filters.status === 'all' || item.status === filters.status
    const matchLocation = filters.location === 'all' || item.location === filters.location
    const matchPrice = matchesPrice(item.rate, filters.price)

    return matchQ && matchStatus && matchLocation && matchPrice
  })

  items = [...items].sort((a, b) => compareServices(a, b, filters.sort))
  return items
}

function compareServices(a: ServiceItem, b: ServiceItem, sort: SortOption): number {
  switch (sort) {
    case 'price-asc':
      return a.rate - b.rate
    case 'price-desc':
      return b.rate - a.rate
    case 'rating':
      return b.rating - a.rating || b.reviewCount - a.reviewCount
    case 'popular':
      return b.bookingCount - a.bookingCount
    case 'newest':
    default:
      return b.createdAt.localeCompare(a.createdAt)
  }
}

export interface SearchSuggestion {
  label: string
  count: number
}

export function getSearchSuggestions(
  category: ServiceCategory,
  query: string,
  limit = 5,
): SearchSuggestion[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const counts = new Map<string, number>()

  for (const item of SERVICE_CATALOG[category]) {
    const candidates = [
      item.title,
      item.subtitle,
      item.provider,
      ...item.providerProfile.specializations,
    ]
    for (const c of candidates) {
      if (c.toLowerCase().includes(q)) {
        counts.set(c, (counts.get(c) ?? 0) + 1)
      }
    }
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

const TIME_SLOTS = ['10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '5:00 PM']

/** Deterministic 30-day availability grid for demo bookings */
export function generateAvailability(serviceId: string, days = 30): import('./serviceCatalogTypes').ServiceAvailabilityDay[] {
  const result: import('./serviceCatalogTypes').ServiceAvailabilityDay[] = []
  const base = new Date()
  base.setHours(0, 0, 0, 0)

  for (let i = 0; i < days; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    const iso = d.toISOString().slice(0, 10)
    const seed = hash(`${serviceId}-${iso}`)
    const available = seed % 5 !== 0 && seed % 7 !== 0
    const slotCount = available ? 2 + (seed % 3) : 0
    const times = available ? TIME_SLOTS.slice(0, slotCount) : []

    result.push({
      iso,
      label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      available: available && times.length > 0,
      times,
    })
  }

  return result
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function countActiveFilters(filters: ServiceFiltersState): number {
  let n = 0
  if (filters.status !== 'all') n++
  if (filters.location !== 'all') n++
  if (filters.price !== 'all') n++
  if (filters.sort !== 'newest') n++
  return n
}

export const DEFAULT_FILTERS: ServiceFiltersState = {
  q: '',
  status: 'all',
  location: 'all',
  price: 'all',
  sort: 'newest',
}
