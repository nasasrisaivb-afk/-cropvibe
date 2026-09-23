export type Role = 'seller' | 'buyer' | 'rental' | 'service' | 'educator'

export type PageId =
  | 'dashboard'
  | 'listings'
  | 'orders'
  | 'quotes'
  | 'insights'
  | 'discover'
  | 'rfqs'
  | 'suppliers'
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
  | 'operators'
  | 'maintenance'
  | 'agreements'
  | 'damage'
  | 'overdue'
  | 'finance'
  | 'payouts'
  | 'disputes'
  | 'settlements'
  | 'help'
  | 'services'
  | 'appointments'
  | 'reports'
  | 'portfolio'
  | 'consultancy'
  | 'testing'
  | 'repair'
  | 'aerial'
  | 'irrigation'
  | 'courses'
  | 'learners'
  | 'sessions'
  | 'assessments'
  | 'qna'
  | 'selfpaced'
  | 'live'
  | 'certifications'
  | 'mandi'
  | 'weather'
  | 'schemes'
  | 'more'

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
  seller: 'var(--cv-role-seller)',
  buyer: 'var(--cv-role-buyer)',
  rental: 'var(--cv-role-rental)',
  service: 'var(--cv-role-service)',
  educator: 'var(--cv-role-educator)',
}

/** Pill fill + readable text — never colour-only; always pair with icon + label */
export const ROLE_PILL: Record<Role, { bg: string; fg: string }> = {
  seller: { bg: 'var(--cv-blue, #5b5ce2)', fg: '#ffffff' },
  buyer: { bg: 'color-mix(in srgb, var(--cv-blue, #5b5ce2) 70%, var(--cv-grey, #8b90a7))', fg: '#ffffff' },
  rental: { bg: 'color-mix(in srgb, var(--cv-blue, #5b5ce2) 55%, #ffffff)', fg: '#4a4fd4' },
  service: { bg: 'color-mix(in srgb, var(--cv-blue, #5b5ce2) 82%, var(--cv-grey, #8b90a7))', fg: '#ffffff' },
  educator: { bg: 'color-mix(in srgb, var(--cv-blue, #5b5ce2) 45%, var(--cv-grey, #8b90a7))', fg: '#ffffff' },
}

export const ROLE_SOFT: Record<Role, string> = {
  seller: 'color-mix(in srgb, var(--cv-blue) 12%, transparent)',
  buyer: 'color-mix(in srgb, var(--cv-blue) 12%, transparent)',
  rental: 'color-mix(in srgb, var(--cv-blue) 12%, transparent)',
  service: 'color-mix(in srgb, var(--cv-blue) 12%, transparent)',
  educator: 'color-mix(in srgb, var(--cv-blue) 12%, transparent)',
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
