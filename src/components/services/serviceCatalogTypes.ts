export type ServiceCategory = 'consultancy' | 'testing' | 'repair' | 'aerial' | 'irrigation'

export type ServiceStatus = 'open' | 'booked' | 'paused'

export type PriceFilter = 'all' | 'under1k' | '1k-5k' | '5k-10k' | 'above10k'

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular'

export type VerificationBadge = 'identity' | 'email' | 'phone' | 'tax' | 'expert'

export interface ServiceReview {
  id: string
  author: string
  rating: number
  text: string
  date: string
  verified: boolean
}

export interface ServiceProviderProfile {
  title: string
  experienceYears: number
  responseTime: string
  responseRate: number
  acceptanceRate: number
  specializations: string[]
  certifications: string[]
  verifications: VerificationBadge[]
  serviceAreas: string[]
  repeatCustomers: number
  verifiedBookings: number
  onTimeRate: number
}

export interface ServiceAvailabilityDay {
  iso: string
  label: string
  weekday: string
  available: boolean
  times: string[]
}

export interface ServiceItem {
  id: string
  title: string
  subtitle: string
  provider: string
  rate: number
  unit: string
  durationMinutes: number
  status: ServiceStatus
  location: string
  rating: number
  reviewCount: number
  description: string
  includes: string[]
  nextAvailable: string[]
  createdAt: string
  bookingCount: number
  cancellationPolicy: string
  format: string
  providerProfile: ServiceProviderProfile
  reviews: ServiceReview[]
}

export interface ServiceFiltersState {
  q: string
  status: string
  location: string
  price: PriceFilter
  sort: SortOption
}

export interface ServiceBookingRecord {
  id: string
  serviceId: string
  category: ServiceCategory
  serviceTitle: string
  provider: string
  date: string
  time: string
  notes: string
  amount: number
  createdAt: string
  confirmationCode: string
  status?: 'confirmed' | 'cancelled'
}

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  consultancy: 'Consultancy',
  testing: 'Testing',
  repair: 'Repair',
  aerial: 'Aerial',
  irrigation: 'Irrigation',
}

export function serviceDetailPath(category: ServiceCategory, serviceId: string): string {
  return `/dashboard/${category}/${serviceId}`
}
