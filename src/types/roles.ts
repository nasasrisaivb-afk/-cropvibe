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
  | 'calendar'
  | 'agreements'
  | 'damage'
  | 'overdue'
  | 'settlements'
  | 'help'

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
  seller: '#22C55E',
  buyer: '#22C55E',
  rental: '#22C55E',
  service: '#22C55E',
  educator: '#22C55E',
}

export const ROLE_SOFT: Record<Role, string> = {
  seller: 'rgba(34,197,94,0.14)',
  buyer: 'rgba(34,197,94,0.14)',
  rental: 'rgba(34,197,94,0.14)',
  service: 'rgba(34,197,94,0.14)',
  educator: 'rgba(34,197,94,0.14)',
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
