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
  seller: '#C9FF35',
  buyer: '#C9FF35',
  rental: '#C9FF35',
  service: '#C9FF35',
  educator: '#C9FF35',
}

export const ROLE_SOFT: Record<Role, string> = {
  seller: 'rgba(201,255,53,0.12)',
  buyer: 'rgba(201,255,53,0.12)',
  rental: 'rgba(201,255,53,0.12)',
  service: 'rgba(201,255,53,0.12)',
  educator: 'rgba(201,255,53,0.12)',
}

export const ROLE_ICONS: Record<Role, string> = {
  seller: '🌾',
  buyer: '🛒',
  rental: '🚜',
  service: '👨‍🔧',
  educator: '📚',
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

export const ALL_ROLES: Role[] = ['seller', 'buyer', 'rental', 'service', 'educator']
