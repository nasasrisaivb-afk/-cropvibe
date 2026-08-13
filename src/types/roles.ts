export type Role = 'seller' | 'buyer' | 'rental' | 'service' | 'educator'

export type PageId =
  | 'dashboard'
  | 'listings'
  | 'orders'
  | 'wallet'
  | 'messages'
  | 'notifications'
  | 'reviews'
  | 'analytics'
  | 'profile'
  | 'settings'
  | 'create'
  | 'equipment'
  | 'machinery'
  | 'labours'
  | 'drivers'
  | 'land'
  | 'warehouses'
  | 'bookings'
  | 'scheduling'
  | 'calendar'
  | 'agreements'
  | 'damage'
  | 'overdue'
  | 'finance'
  | 'payouts'
  | 'disputes'
  | 'settlements'
  | 'help'
  | 'consultancy'
  | 'testing'
  | 'repair'
  | 'aerial'
  | 'irrigation'
  | 'selfpaced'
  | 'live'
  | 'certifications'

export type KycStatus = 'none' | 'pending' | 'approved' | 'rejected' | 'resubmit'

export interface UserProfile {
  name: string
  email: string
  phone: string
  location?: string
}

export interface User {
  id: string
  profile: UserProfile
  roles: Role[]
  activeRole: Role
  kycStatus: KycStatus
}

export const ROLE_COLORS: Record<Role, string> = {
  seller: 'var(--cv-nav-active-fg)',
  buyer: 'var(--cv-nav-active-fg)',
  rental: 'var(--cv-nav-active-fg)',
  service: 'var(--cv-nav-active-fg)',
  educator: 'var(--cv-nav-active-fg)',
}

export const ROLE_SOFT: Record<Role, string> = {
  seller: 'color-mix(in srgb, var(--cv-nav-active-fg) 12%, transparent)',
  buyer: 'color-mix(in srgb, var(--cv-nav-active-fg) 12%, transparent)',
  rental: 'color-mix(in srgb, var(--cv-nav-active-fg) 12%, transparent)',
  service: 'color-mix(in srgb, var(--cv-nav-active-fg) 12%, transparent)',
  educator: 'color-mix(in srgb, var(--cv-nav-active-fg) 12%, transparent)',
}

export const ROLE_ICONS: Record<Role, string> = {
  seller: '🌾',
  buyer: '🛒',
  rental: '🚜',
  service: '👨‍🔧',
  educator: '📚',
}

export const ROLE_LABELS: Record<Role, string> = {
  seller: 'Seller',
  buyer: 'Buyer',
  rental: 'Rental Provider',
  service: 'Service Provider',
  educator: 'Educator',
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  seller: 'Sell agricultural products directly',
  buyer: 'Buy agricultural products in bulk',
  rental: 'Rent out equipment and machinery',
  service: 'Provide consultancy and farm services',
  educator: 'Teach courses and workshops',
}

export const ROLE_TITLES: Record<Role, string> = {
  seller: 'Sell Products',
  buyer: 'Buy in Bulk',
  rental: 'Rent Equipment',
  service: 'Provide Services',
  educator: 'Teach Courses',
}

export const ROLE_CTA: Record<Role, string> = {
  seller: 'Add Product',
  buyer: 'Browse Marketplace',
  rental: 'Rent Equipment',
  service: 'Add Service',
  educator: 'Create Course',
}

export const ALL_ROLES: Role[] = ['seller', 'buyer', 'rental', 'service', 'educator']
