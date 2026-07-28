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

export interface NavSection {
  title: string
  items: NavItem[]
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

/** Rental Provider–only sidebar */
export const RENTAL_NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
      { id: 'analytics', label: 'Analytics', path: '/dashboard/analytics' },
    ],
  },
  {
    title: 'Rentals',
    items: [
      { id: 'equipment', label: 'Equipment', path: '/dashboard/equipment' },
      { id: 'machinery', label: 'Machinery', path: '/dashboard/machinery' },
      { id: 'labours', label: 'Labours', path: '/dashboard/labours' },
      { id: 'drivers', label: 'Drivers', path: '/dashboard/drivers' },
      { id: 'land', label: 'Land', path: '/dashboard/land' },
      { id: 'warehouses', label: 'Warehouses', path: '/dashboard/warehouses' },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { id: 'bookings', label: 'Bookings', path: '/dashboard/bookings' },
      { id: 'calendar', label: 'Calendar', path: '/dashboard/calendar' },
      { id: 'agreements', label: 'Agreements', path: '/dashboard/agreements' },
    ],
  },
  {
    title: 'Reports',
    items: [
      { id: 'damage', label: 'Damage Reports', path: '/dashboard/damage' },
      { id: 'overdue', label: 'Overdue Rentals', path: '/dashboard/overdue' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'wallet', label: 'Settlements', path: '/dashboard/wallet' },
      { id: 'messages', label: 'Messages', path: '/dashboard/messages' },
      { id: 'reviews', label: 'Reviews', path: '/dashboard/reviews' },
      { id: 'help', label: 'Help Desk', path: '/dashboard/help' },
      { id: 'profile', label: 'Profile', path: '/dashboard/profile' },
      { id: 'settings', label: 'Settings', path: '/dashboard/settings' },
    ],
  },
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
  buyer: { label: 'Find Suppliers', path: '/dashboard/create' },
  rental: { label: '+ Add Equipment', path: '/dashboard/create' },
  service: { label: 'Schedule Availability', path: '/dashboard/create' },
  educator: { label: '+ Create Course', path: '/dashboard/create' },
}

export function getNavItems(role: Role): NavItem[] {
  if (role === 'rental') {
    return RENTAL_NAV_SECTIONS.flatMap((section) => section.items)
  }
  return NAV_ITEMS.map((item) => {
    if (item.id === 'listings') return { ...item, label: LISTINGS_LABEL[role] }
    if (item.id === 'orders') return { ...item, label: ORDERS_LABEL[role] }
    return item
  })
}

export function getNavSections(role: Role): NavSection[] | null {
  if (role === 'rental') return RENTAL_NAV_SECTIONS
  return null
}

export const MOBILE_TABS: PageId[] = ['dashboard', 'listings', 'orders', 'messages', 'profile']

export const RENTAL_MOBILE_TABS: PageId[] = [
  'dashboard',
  'equipment',
  'bookings',
  'messages',
  'profile',
]

const baseSearch: Partial<Record<PageId, string>> = {
  dashboard: 'Search dashboard insights...',
  listings: 'Search listings by name or category...',
  orders: 'Search orders by id or status...',
  wallet: 'Search settlements...',
  messages: 'Search conversations...',
  notifications: 'Search alerts...',
  reviews: 'Search review feedback...',
  analytics: 'Search reports...',
  profile: 'Search profile sections...',
  settings: 'Search settings...',
  create: 'Search...',
  equipment: 'Search equipment...',
  machinery: 'Search machinery...',
  labours: 'Search labour listings...',
  drivers: 'Search drivers...',
  land: 'Search land rentals...',
  warehouses: 'Search warehouses...',
  bookings: 'Search bookings...',
  calendar: 'Search calendar...',
  agreements: 'Search agreements...',
  damage: 'Search damage reports...',
  overdue: 'Search overdue rentals...',
  settlements: 'Search settlements...',
  help: 'Search help articles...',
}

export const SEARCH_PLACEHOLDERS = new Proxy(baseSearch as Record<PageId, string>, {
  get(target, prop: string) {
    return target[prop as PageId] ?? 'Search...'
  },
})

const baseCrumbs: Partial<Record<PageId, string[]>> = {
  dashboard: ['Dashboard', 'Home'],
  listings: ['Dashboard', 'Listings'],
  orders: ['Dashboard', 'Orders'],
  wallet: ['Dashboard', 'Settlements'],
  messages: ['Dashboard', 'Messages'],
  notifications: ['Dashboard', 'Notifications'],
  reviews: ['Dashboard', 'Reviews'],
  analytics: ['Dashboard', 'Analytics'],
  profile: ['Dashboard', 'Profile'],
  settings: ['Dashboard', 'Settings'],
  create: ['Dashboard', 'Create'],
  equipment: ['Rentals', 'Equipment'],
  machinery: ['Rentals', 'Machinery'],
  labours: ['Rentals', 'Labours'],
  drivers: ['Rentals', 'Drivers'],
  land: ['Rentals', 'Land'],
  warehouses: ['Rentals', 'Warehouses'],
  bookings: ['Monitoring', 'Bookings'],
  calendar: ['Monitoring', 'Calendar'],
  agreements: ['Monitoring', 'Agreements'],
  damage: ['Reports', 'Damage Reports'],
  overdue: ['Reports', 'Overdue Rentals'],
  settlements: ['Account', 'Settlements'],
  help: ['Account', 'Help Desk'],
}

export const BREADCRUMB_TITLES = new Proxy(baseCrumbs as Record<PageId, string[]>, {
  get(target, prop: string) {
    return target[prop as PageId] ?? ['Dashboard']
  },
})

export function getAllNavPaths(): Record<PageId, string> {
  const paths = {} as Record<PageId, string>
  for (const item of NAV_ITEMS) paths[item.id] = item.path
  for (const section of RENTAL_NAV_SECTIONS) {
    for (const item of section.items) paths[item.id] = item.path
  }
  paths.create = '/dashboard/create'
  paths.listings = '/dashboard/listings'
  paths.orders = '/dashboard/orders'
  paths.analytics = '/dashboard/analytics'
  paths.notifications = '/dashboard/notifications'
  paths.reviews = '/dashboard/reviews'
  paths.settlements = '/dashboard/wallet'
  return paths
}
