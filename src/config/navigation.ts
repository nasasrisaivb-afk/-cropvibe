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

/** Rental account / inbox (profile lives in header account menu) */
const RENTAL_ACCOUNT_ITEMS: NavItem[] = [
  { id: 'messages', label: 'Messages', path: '/dashboard/messages' },
  { id: 'notifications', label: 'Notifications', path: '/dashboard/notifications' },
  { id: 'reviews', label: 'Reviews', path: '/dashboard/reviews' },
  { id: 'help', label: 'Help', path: '/dashboard/help' },
  { id: 'settings', label: 'Settings', path: '/dashboard/settings' },
]

export const SELLER_NAV_SECTIONS: NavSection[] = [
  {
    title: 'Home',
    items: [
      { id: 'dashboard', label: 'Overview', path: '/dashboard' },
      { id: 'analytics', label: 'Analytics', path: '/dashboard/analytics' },
    ],
  },
  {
    title: 'Sell',
    items: [
      { id: 'listings', label: 'Listings', path: '/dashboard/listings' },
      { id: 'orders', label: 'Orders', path: '/dashboard/orders' },
      { id: 'create', label: 'Create listing', path: '/dashboard/create' },
    ],
  },
  {
    title: 'Inbox',
    items: [
      { id: 'messages', label: 'Messages', path: '/dashboard/messages' },
      { id: 'notifications', label: 'Notifications', path: '/dashboard/notifications' },
      { id: 'reviews', label: 'Reviews', path: '/dashboard/reviews' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'wallet', label: 'Settlements', path: '/dashboard/wallet' },
      { id: 'settings', label: 'Settings', path: '/dashboard/settings' },
      { id: 'help', label: 'Help', path: '/dashboard/help' },
    ],
  },
]

export const BUYER_NAV_SECTIONS: NavSection[] = [
  {
    title: 'Home',
    items: [
      { id: 'dashboard', label: 'Overview', path: '/dashboard' },
      { id: 'analytics', label: 'Analytics', path: '/dashboard/analytics' },
    ],
  },
  {
    title: 'Buy',
    items: [
      { id: 'listings', label: 'Suppliers', path: '/dashboard/listings' },
      { id: 'orders', label: 'Purchase orders', path: '/dashboard/orders' },
      { id: 'create', label: 'Find suppliers', path: '/dashboard/create' },
    ],
  },
  {
    title: 'Inbox',
    items: [
      { id: 'messages', label: 'Messages', path: '/dashboard/messages' },
      { id: 'notifications', label: 'Notifications', path: '/dashboard/notifications' },
      { id: 'reviews', label: 'Reviews', path: '/dashboard/reviews' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'wallet', label: 'Wallet', path: '/dashboard/wallet' },
      { id: 'settings', label: 'Settings', path: '/dashboard/settings' },
      { id: 'help', label: 'Help', path: '/dashboard/help' },
    ],
  },
]

/**
 * Rental IA — fewer groups, task-first labels.
 * Inventory is collapsible in the sidebar UI (see Navigation).
 */
export const RENTAL_NAV_SECTIONS: NavSection[] = [
  {
    title: 'Home',
    items: [
      { id: 'dashboard', label: 'Overview', path: '/dashboard' },
      { id: 'analytics', label: 'Analytics', path: '/dashboard/analytics' },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { id: 'machinery', label: 'Machinery', path: '/dashboard/machinery' },
      { id: 'equipment', label: 'Equipment', path: '/dashboard/equipment' },
      { id: 'labours', label: 'Labour', path: '/dashboard/labours' },
      { id: 'drivers', label: 'Drivers', path: '/dashboard/drivers' },
      { id: 'land', label: 'Land', path: '/dashboard/land' },
      { id: 'warehouses', label: 'Warehouses', path: '/dashboard/warehouses' },
    ],
  },
  {
    title: 'Bookings',
    items: [
      { id: 'scheduling', label: 'Schedule', path: '/dashboard/scheduling' },
      { id: 'overdue', label: 'Overdue', path: '/dashboard/overdue' },
    ],
  },
  {
    title: 'Documents',
    items: [
      { id: 'agreements', label: 'Agreements', path: '/dashboard/agreements' },
      { id: 'damage', label: 'Damage reports', path: '/dashboard/damage' },
    ],
  },
  {
    title: 'Money',
    items: [
      { id: 'finance', label: 'Earnings', path: '/dashboard/finance' },
      { id: 'payouts', label: 'Payouts', path: '/dashboard/payouts' },
      { id: 'disputes', label: 'Issues', path: '/dashboard/disputes' },
    ],
  },
  {
    title: 'Account',
    items: RENTAL_ACCOUNT_ITEMS,
  },
]

export const SERVICE_NAV_SECTIONS: NavSection[] = [
  {
    title: 'Home',
    items: [
      { id: 'dashboard', label: 'Overview', path: '/dashboard' },
      { id: 'analytics', label: 'Analytics', path: '/dashboard/analytics' },
    ],
  },
  {
    title: 'Services',
    items: [
      { id: 'consultancy', label: 'Consultancy', path: '/dashboard/consultancy' },
      { id: 'testing', label: 'Testing', path: '/dashboard/testing' },
      { id: 'repair', label: 'Repair', path: '/dashboard/repair' },
      { id: 'aerial', label: 'Aerial', path: '/dashboard/aerial' },
      { id: 'irrigation', label: 'Irrigation', path: '/dashboard/irrigation' },
    ],
  },
  {
    title: 'Bookings',
    items: [
      { id: 'orders', label: 'Appointments', path: '/dashboard/orders' },
      { id: 'calendar', label: 'Calendar', path: '/dashboard/calendar' },
    ],
  },
  {
    title: 'Inbox',
    items: [
      { id: 'messages', label: 'Messages', path: '/dashboard/messages' },
      { id: 'reviews', label: 'Reviews', path: '/dashboard/reviews' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'wallet', label: 'Settlements', path: '/dashboard/wallet' },
      { id: 'settings', label: 'Settings', path: '/dashboard/settings' },
      { id: 'help', label: 'Help', path: '/dashboard/help' },
    ],
  },
]

export const EDUCATOR_NAV_SECTIONS: NavSection[] = [
  {
    title: 'Home',
    items: [
      { id: 'dashboard', label: 'Overview', path: '/dashboard' },
      { id: 'analytics', label: 'Analytics', path: '/dashboard/analytics' },
    ],
  },
  {
    title: 'Courses',
    items: [
      { id: 'selfpaced', label: 'Self-paced', path: '/dashboard/selfpaced' },
      { id: 'live', label: 'Live cohorts', path: '/dashboard/live' },
      { id: 'certifications', label: 'Certifications', path: '/dashboard/certifications' },
    ],
  },
  {
    title: 'Learners',
    items: [
      { id: 'orders', label: 'Enrollments', path: '/dashboard/orders' },
      { id: 'calendar', label: 'Calendar', path: '/dashboard/calendar' },
    ],
  },
  {
    title: 'Inbox',
    items: [
      { id: 'messages', label: 'Messages', path: '/dashboard/messages' },
      { id: 'reviews', label: 'Reviews', path: '/dashboard/reviews' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'wallet', label: 'Settlements', path: '/dashboard/wallet' },
      { id: 'settings', label: 'Settings', path: '/dashboard/settings' },
      { id: 'help', label: 'Help', path: '/dashboard/help' },
    ],
  },
]

/** @deprecated flat list — prefer getNavSections */
export const NAV_ITEMS: NavItem[] = SELLER_NAV_SECTIONS.flatMap((s) => s.items)

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
  service: { label: '+ Create Service', path: '/dashboard/create' },
  educator: { label: '+ Create Course', path: '/dashboard/create' },
}

export function getNavSections(role: Role): NavSection[] {
  if (role === 'buyer') return BUYER_NAV_SECTIONS
  if (role === 'rental') return RENTAL_NAV_SECTIONS
  if (role === 'service') return SERVICE_NAV_SECTIONS
  if (role === 'educator') return EDUCATOR_NAV_SECTIONS
  return SELLER_NAV_SECTIONS
}

export function getNavItems(role: Role): NavItem[] {
  return getNavSections(role).flatMap((section) => section.items)
}

export const MOBILE_TABS: PageId[] = ['dashboard', 'listings', 'orders', 'messages', 'profile']

export const RENTAL_MOBILE_TABS: PageId[] = [
  'dashboard',
  'equipment',
  'scheduling',
  'messages',
  'profile',
]

export const SERVICE_MOBILE_TABS: PageId[] = [
  'dashboard',
  'consultancy',
  'orders',
  'messages',
  'profile',
]

export const EDUCATOR_MOBILE_TABS: PageId[] = [
  'dashboard',
  'selfpaced',
  'orders',
  'messages',
  'profile',
]

export function getMobileTabs(role: Role): PageId[] {
  if (role === 'rental') return RENTAL_MOBILE_TABS
  if (role === 'service') return SERVICE_MOBILE_TABS
  if (role === 'educator') return EDUCATOR_MOBILE_TABS
  return MOBILE_TABS
}

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
  scheduling: 'Search schedule by renter, asset, or date...',
  calendar: 'Search calendar...',
  agreements: 'Search agreements...',
  damage: 'Search reports by asset, renter, or status...',
  overdue: 'Search overdue rentals...',
  finance: 'Search earnings and revenue...',
  payouts: 'Search payouts and settlements...',
  disputes: 'Search finance issues...',
  settlements: 'Search settlements...',
  help: 'Search help articles...',
  consultancy: 'Search consultancy services...',
  testing: 'Search testing offers...',
  repair: 'Search repair service slots...',
  aerial: 'Search aerial services...',
  irrigation: 'Search irrigation packages...',
  selfpaced: 'Search self-paced courses...',
  live: 'Search live cohorts...',
  certifications: 'Search certifications...',
}

export const SEARCH_PLACEHOLDERS = new Proxy(baseSearch as Record<PageId, string>, {
  get(target, prop: string) {
    return target[prop as PageId] ?? 'Search...'
  },
})

const baseCrumbs: Partial<Record<PageId, string[]>> = {
  dashboard: ['Home', 'Overview'],
  listings: ['Sell', 'Listings'],
  orders: ['Sell', 'Orders'],
  wallet: ['Account', 'Settlements'],
  messages: ['Account', 'Messages'],
  notifications: ['Account', 'Notifications'],
  reviews: ['Account', 'Reviews'],
  analytics: ['Home', 'Analytics'],
  profile: ['Account', 'Profile'],
  settings: ['Account', 'Settings'],
  create: ['Sell', 'Create'],
  equipment: ['Inventory', 'Equipment'],
  machinery: ['Inventory', 'Machinery'],
  labours: ['Inventory', 'Labour'],
  drivers: ['Inventory', 'Drivers'],
  land: ['Inventory', 'Land'],
  warehouses: ['Inventory', 'Warehouses'],
  bookings: ['Bookings', 'Bookings'],
  scheduling: ['Bookings', 'Schedule'],
  calendar: ['Bookings', 'Calendar'],
  agreements: ['Documents', 'Agreements'],
  damage: ['Documents', 'Damage reports'],
  overdue: ['Bookings', 'Overdue'],
  finance: ['Money', 'Earnings'],
  payouts: ['Money', 'Payouts'],
  disputes: ['Money', 'Issues'],
  settlements: ['Account', 'Settlements'],
  help: ['Account', 'Help'],
  consultancy: ['Services', 'Consultancy'],
  testing: ['Services', 'Testing'],
  repair: ['Services', 'Repair'],
  aerial: ['Services', 'Aerial'],
  irrigation: ['Services', 'Irrigation'],
  selfpaced: ['Courses', 'Self-paced'],
  live: ['Courses', 'Live cohorts'],
  certifications: ['Courses', 'Certifications'],
}

export const BREADCRUMB_TITLES = new Proxy(baseCrumbs as Record<PageId, string[]>, {
  get(target, prop: string) {
    return target[prop as PageId] ?? ['Dashboard']
  },
})

export function getAllNavPaths(): Record<PageId, string> {
  const paths = {} as Record<PageId, string>
  const roles: Role[] = ['seller', 'buyer', 'rental', 'service', 'educator']
  for (const role of roles) {
    for (const section of getNavSections(role)) {
      for (const item of section.items) paths[item.id] = item.path
    }
  }
  paths.create = '/dashboard/create'
  paths.listings = '/dashboard/listings'
  paths.orders = '/dashboard/orders'
  paths.analytics = '/dashboard/analytics'
  paths.notifications = '/dashboard/notifications'
  paths.reviews = '/dashboard/reviews'
  paths.settlements = '/dashboard/wallet'
  paths.help = '/dashboard/help'
  paths.scheduling = '/dashboard/scheduling'
  paths.finance = '/dashboard/finance'
  paths.payouts = '/dashboard/payouts'
  paths.disputes = '/dashboard/disputes'
  return paths
}
