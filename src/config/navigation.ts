import type { PageId, Role } from '../types/roles'

export const ROLE_LABELS: Record<Role, string> = {
  seller: 'Seller',
  buyer: 'Buyer',
  rental: 'Rental Provider',
  service: 'Service Provider',
  educator: 'Educator',
}

export const ROLE_SHORT: Record<Role, string> = {
  seller: 'Seller',
  buyer: 'Buyer',
  rental: 'Rental',
  service: 'Service',
  educator: 'Educator',
}

export interface NavItem {
  id: PageId
  label: string
  path: string
  count?: number
}

export interface NavSection {
  title: string
  items: NavItem[]
}

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
    title: 'Money',
    items: [{ id: 'wallet', label: 'Settlements', path: '/dashboard/wallet' }],
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
    title: 'Money',
    items: [{ id: 'wallet', label: 'Wallet', path: '/dashboard/wallet' }],
  },
]

/**
 * Rental IA — operational groups only.
 * Messages / notifications / help live in the top bar; reviews & settings via Profile / account menu.
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
    items: [{ id: 'scheduling', label: 'Schedule', path: '/dashboard/scheduling' }],
  },
  {
    title: 'Reports & issues',
    items: [
      { id: 'damage', label: 'Reports', path: '/dashboard/damage' },
      { id: 'overdue', label: 'Overdue', path: '/dashboard/overdue' },
      { id: 'disputes', label: 'Issues', path: '/dashboard/disputes' },
    ],
  },
  {
    title: 'Documents',
    items: [{ id: 'agreements', label: 'Agreements', path: '/dashboard/agreements' }],
  },
  {
    title: 'Money',
    items: [
      { id: 'finance', label: 'Earnings', path: '/dashboard/finance' },
      { id: 'payouts', label: 'Payouts', path: '/dashboard/payouts' },
    ],
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
    title: 'Money',
    items: [{ id: 'wallet', label: 'Settlements', path: '/dashboard/wallet' }],
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
    title: 'Money',
    items: [{ id: 'wallet', label: 'Settlements', path: '/dashboard/wallet' }],
  },
]

export const SHARED_NAV: NavItem[] = [
  { id: 'messages', label: 'Messages', path: '/dashboard/messages', count: 3 },
  { id: 'wallet', label: 'Wallet', path: '/dashboard/wallet' },
  { id: 'reviews', label: 'Reviews', path: '/dashboard/reviews' },
]

export const ACCOUNT_NAV: NavItem[] = [
  { id: 'settings', label: 'Settings', path: '/dashboard/settings' },
  { id: 'help', label: 'Help', path: '/dashboard/help' },
]

export const FARM_INTEL_ITEMS: Record<'mandi' | 'weather' | 'schemes', NavItem> = {
  mandi: { id: 'mandi', label: 'Mandi Prices', path: '/dashboard/mandi' },
  weather: { id: 'weather', label: 'Weather', path: '/dashboard/weather' },
  schemes: { id: 'schemes', label: 'Schemes & Support', path: '/dashboard/schemes' },
}

export function getFarmIntelItems(role: Role): NavItem[] {
  if (role === 'educator') return []
  if (role === 'rental') return [FARM_INTEL_ITEMS.weather, FARM_INTEL_ITEMS.schemes]
  if (role === 'buyer') return [FARM_INTEL_ITEMS.mandi, FARM_INTEL_ITEMS.weather]
  return [FARM_INTEL_ITEMS.mandi, FARM_INTEL_ITEMS.weather, FARM_INTEL_ITEMS.schemes]
}

/** Account shortcuts — shown on Profile, not in the sidebar. */
export function getActionNavItems(role: Role): NavItem[] {
  return [
    { id: 'reviews', label: 'Reviews', path: '/dashboard/reviews' },
    ...getFarmIntelItems(role),
  ]
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

export function getWorkspaceItems(role: Role): NavItem[] {
  return getNavItems(role)
}

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

export const PRIMARY_CTA: Record<Role, { label: string; path: string; page: PageId }> = {
  seller: { label: '+ Create Listing', path: '/dashboard/create', page: 'create' },
  buyer: { label: 'Find Suppliers', path: '/dashboard/create', page: 'create' },
  rental: { label: '+ Add Equipment', path: '/dashboard/create', page: 'create' },
  service: { label: '+ Create Service', path: '/dashboard/create', page: 'create' },
  educator: { label: '+ Create Course', path: '/dashboard/create', page: 'create' },
}

export const CREATE_MENU: Record<Role, { label: string; page: PageId; path: string }[]> = {
  seller: [
    { label: 'New listing', page: 'create', path: '/dashboard/create' },
    { label: 'Respond to RFQ', page: 'quotes', path: '/dashboard/quotes' },
    { label: 'Price alert', page: 'mandi', path: '/dashboard/mandi' },
  ],
  buyer: [
    { label: 'New RFQ', page: 'rfqs', path: '/dashboard/rfqs' },
    { label: 'Quick reorder', page: 'orders', path: '/dashboard/orders' },
    { label: 'Price alert', page: 'mandi', path: '/dashboard/mandi' },
  ],
  rental: [
    { label: 'Add equipment', page: 'create', path: '/dashboard/create' },
    { label: 'Block dates', page: 'calendar', path: '/dashboard/calendar' },
    { label: 'Log maintenance', page: 'maintenance', path: '/dashboard/maintenance' },
  ],
  service: [
    { label: 'New service', page: 'create', path: '/dashboard/create' },
    { label: 'Manual appointment', page: 'appointments', path: '/dashboard/appointments' },
    { label: 'Field report', page: 'reports', path: '/dashboard/reports' },
  ],
  educator: [
    { label: 'New course', page: 'create', path: '/dashboard/create' },
    { label: 'Schedule live session', page: 'sessions', path: '/dashboard/sessions' },
    { label: 'New quiz', page: 'assessments', path: '/dashboard/assessments' },
  ],
}

export const MOBILE_TABS: PageId[] = ['dashboard', 'listings', 'orders', 'profile']

export const RENTAL_MOBILE_TABS: PageId[] = ['dashboard', 'equipment', 'scheduling', 'profile']

export const SERVICE_MOBILE_TABS: PageId[] = ['dashboard', 'consultancy', 'orders', 'profile']

export const EDUCATOR_MOBILE_TABS: PageId[] = ['dashboard', 'selfpaced', 'orders', 'profile']

export function getMobileTabs(role: Role): PageId[] {
  if (role === 'rental') return RENTAL_MOBILE_TABS
  if (role === 'service') return SERVICE_MOBILE_TABS
  if (role === 'educator') return EDUCATOR_MOBILE_TABS
  return MOBILE_TABS
}

const SHARED_PAGES: PageId[] = [
  'dashboard',
  'messages',
  'wallet',
  'reviews',
  'notifications',
  'profile',
  'settings',
  'help',
  'create',
  'analytics',
]

const PAGE_FAMILY: Partial<Record<PageId, PageId>> = {
  listings: 'listings',
  discover: 'listings',
  equipment: 'listings',
  services: 'listings',
  courses: 'listings',
  consultancy: 'listings',
  testing: 'listings',
  repair: 'listings',
  aerial: 'listings',
  irrigation: 'listings',
  selfpaced: 'listings',
  live: 'listings',
  certifications: 'listings',
  machinery: 'listings',
  labours: 'listings',
  drivers: 'listings',
  land: 'listings',
  warehouses: 'listings',
  orders: 'orders',
  bookings: 'orders',
  appointments: 'orders',
  learners: 'orders',
  quotes: 'quotes',
  rfqs: 'quotes',
  calendar: 'calendar',
  scheduling: 'calendar',
  insights: 'insights',
  analytics: 'insights',
  wallet: 'wallet',
  finance: 'wallet',
  payouts: 'wallet',
  settlements: 'wallet',
}

export function resolvePageForRole(page: PageId, role: Role): PageId {
  if (page === 'more') return 'dashboard'
  const farmIds = getFarmIntelItems(role).map((item) => item.id)
  if (farmIds.includes(page)) return page
  if (SHARED_PAGES.includes(page)) return page

  const workspace = getNavItems(role)
  if (workspace.some((item) => item.id === page)) return page

  const family = PAGE_FAMILY[page]
  if (family) {
    const match = workspace.find((item) => PAGE_FAMILY[item.id] === family)
    if (match) return match.id
  }

  return 'dashboard'
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
  quotes: 'Search RFQs matching your crops...',
  rfqs: 'Search RFQs by crop or status...',
  insights: 'Search insights...',
  suppliers: 'Search suppliers...',
  operators: 'Search operators...',
  maintenance: 'Search maintenance logs...',
  services: 'Search services...',
  appointments: 'Search appointments...',
  reports: 'Search field reports...',
  portfolio: 'Search case studies...',
  courses: 'Search courses...',
  learners: 'Search learners...',
  sessions: 'Search live sessions...',
  assessments: 'Search quizzes...',
  qna: 'Search questions...',
  mandi: 'Search crops and mandis...',
  weather: 'Search locations...',
  schemes: 'Search schemes...',
  discover: 'Search produce, sellers, or mandi prices...',
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
  wallet: ['Money', 'Settlements'],
  messages: ['Inbox', 'Messages'],
  notifications: ['Inbox', 'Notifications'],
  reviews: ['Profile', 'Reviews'],
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
  damage: ['Reports & issues', 'Reports'],
  overdue: ['Reports & issues', 'Overdue'],
  finance: ['Money', 'Earnings'],
  payouts: ['Money', 'Payouts'],
  disputes: ['Reports & issues', 'Issues'],
  settlements: ['Money', 'Settlements'],
  help: ['Help', 'Help Desk'],
  consultancy: ['Services', 'Consultancy'],
  testing: ['Services', 'Testing'],
  repair: ['Services', 'Repair'],
  aerial: ['Services', 'Aerial'],
  irrigation: ['Services', 'Irrigation'],
  selfpaced: ['Courses', 'Self-paced'],
  live: ['Courses', 'Live cohorts'],
  certifications: ['Courses', 'Certifications'],
  quotes: ['Quotes'],
  rfqs: ['RFQs'],
  insights: ['Insights'],
  suppliers: ['Suppliers'],
  operators: ['Operators'],
  maintenance: ['Maintenance'],
  services: ['Services'],
  appointments: ['Appointments'],
  reports: ['Field Reports'],
  portfolio: ['Portfolio'],
  courses: ['Courses'],
  learners: ['Learners'],
  sessions: ['Live Sessions'],
  assessments: ['Assessments'],
  qna: ['Q&A'],
  mandi: ['Farm Intel', 'Mandi Prices'],
  weather: ['Farm Intel', 'Weather'],
  schemes: ['Farm Intel', 'Schemes & Support'],
  discover: ['Discover'],
}

export const BREADCRUMB_TITLES = new Proxy(baseCrumbs as Record<PageId, string[]>, {
  get(target, prop: string) {
    return target[prop as PageId] ?? ['Dashboard']
  },
})

const EXTRA_PATHS: Partial<Record<PageId, string>> = {
  create: '/dashboard/create',
  listings: '/dashboard/listings',
  orders: '/dashboard/orders',
  analytics: '/dashboard/analytics',
  notifications: '/dashboard/notifications',
  reviews: '/dashboard/reviews',
  settlements: '/dashboard/wallet',
  help: '/dashboard/help',
  scheduling: '/dashboard/scheduling',
  finance: '/dashboard/finance',
  payouts: '/dashboard/payouts',
  disputes: '/dashboard/disputes',
  messages: '/dashboard/messages',
  profile: '/dashboard/profile',
  settings: '/dashboard/settings',
  discover: '/dashboard/discover',
  quotes: '/dashboard/quotes',
  rfqs: '/dashboard/rfqs',
  suppliers: '/dashboard/suppliers',
  insights: '/dashboard/insights',
  operators: '/dashboard/operators',
  maintenance: '/dashboard/maintenance',
  services: '/dashboard/services',
  appointments: '/dashboard/appointments',
  reports: '/dashboard/reports',
  portfolio: '/dashboard/portfolio',
  courses: '/dashboard/courses',
  learners: '/dashboard/learners',
  sessions: '/dashboard/sessions',
  assessments: '/dashboard/assessments',
  qna: '/dashboard/qna',
  mandi: '/dashboard/mandi',
  weather: '/dashboard/weather',
  schemes: '/dashboard/schemes',
}

export function getAllNavPaths(): Record<PageId, string> {
  const paths = { ...EXTRA_PATHS } as Record<PageId, string>
  const roles: Role[] = ['seller', 'buyer', 'rental', 'service', 'educator']
  for (const role of roles) {
    for (const item of getNavItems(role)) {
      paths[item.id] = item.path
    }
  }
  paths.dashboard = '/dashboard'
  return paths
}
