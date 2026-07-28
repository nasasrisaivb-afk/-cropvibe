import type { PageId, Role } from '../types/roles'

export const ROLE_LABELS: Record<Role, string> = {
  seller: 'Seller',
  buyer: 'Buyer',
  rental: 'Rental Provider',
  service: 'Service Provider',
  educator: 'Educator',
}

export interface NavItem {
  id: PageId
  label: string
  path: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { id: 'listings', label: 'Listings', path: '/dashboard/listings' },
  { id: 'orders', label: 'Orders', path: '/dashboard/orders' },
  { id: 'wallet', label: 'Wallet', path: '/dashboard/wallet' },
  { id: 'messages', label: 'Messages', path: '/dashboard/messages' },
  { id: 'notifications', label: 'Notifications', path: '/dashboard/notifications' },
  { id: 'reviews', label: 'Reviews', path: '/dashboard/reviews' },
  { id: 'analytics', label: 'Analytics', path: '/dashboard/analytics' },
  { id: 'profile', label: 'Profile', path: '/dashboard/profile' },
  { id: 'settings', label: 'Settings', path: '/dashboard/settings' },
]

export const LISTINGS_LABEL: Record<Role, string> = {
  seller: 'Listings',
  buyer: 'Suppliers',
  rental: 'Equipment',
  service: 'Services',
  educator: 'Courses',
}

export const ORDERS_LABEL: Record<Role, string> = {
  seller: 'Orders',
  buyer: 'Purchase Orders',
  rental: 'Bookings',
  service: 'Appointments',
  educator: 'Enrollments',
}

export const PRIMARY_CTA: Record<Role, { label: string; path: string }> = {
  seller: { label: '+ Create Listing', path: '/dashboard/create' },
  buyer: { label: '🔍 Find Suppliers', path: '/dashboard/create' },
  rental: { label: '+ Add Equipment', path: '/dashboard/create' },
  service: { label: '📅 Schedule Availability', path: '/dashboard/create' },
  educator: { label: '+ Create Course', path: '/dashboard/create' },
}

export function getNavItems(role: Role): NavItem[] {
  return NAV_ITEMS.map((item) => {
    if (item.id === 'listings') return { ...item, label: LISTINGS_LABEL[role] }
    if (item.id === 'orders') return { ...item, label: ORDERS_LABEL[role] }
    return item
  })
}

export const MOBILE_TABS: PageId[] = ['dashboard', 'listings', 'orders', 'messages', 'profile']

export const SEARCH_PLACEHOLDERS: Record<PageId, string> = {
  dashboard: 'Search dashboard insights...',
  listings: 'Search listings by name or category...',
  orders: 'Search orders by id or status...',
  wallet: 'Search transactions...',
  messages: 'Search conversations...',
  notifications: 'Search alerts...',
  reviews: 'Search review feedback...',
  analytics: 'Search reports...',
  profile: 'Search profile sections...',
  settings: 'Search settings...',
  create: 'Search...',
}

export const BREADCRUMB_TITLES: Record<PageId, string[]> = {
  dashboard: ['Dashboard', 'Home'],
  listings: ['Dashboard', 'Listings'],
  orders: ['Dashboard', 'Orders'],
  wallet: ['Dashboard', 'Wallet'],
  messages: ['Dashboard', 'Messages'],
  notifications: ['Dashboard', 'Notifications'],
  reviews: ['Dashboard', 'Reviews'],
  analytics: ['Dashboard', 'Analytics'],
  profile: ['Dashboard', 'Profile'],
  settings: ['Dashboard', 'Settings'],
  create: ['Dashboard', 'Create'],
}
