import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Tractor,
  CalendarClock,
  Wallet,
  ShieldAlert,
  LifeBuoy,
  FileBarChart,
  Settings,
} from 'lucide-react'
import type { PermissionModule } from '@/lib/types'

/**
 * CropVibe Admin — information architecture.
 *
 * One tree drives the sidebar, breadcrumbs, page titles, the ⌘K command palette
 * and RBAC filtering, so a page only has to be added here once.
 */

export type NavBadgeKey =
  | 'pendingActions'
  | 'alerts'
  | 'kyc'
  | 'listingApprovals'
  | 'orders'
  | 'disputes'
  | 'financialDisputes'
  | 'refunds'
  | 'payouts'
  | 'moderation'
  | 'support'
  | 'bookings'
  | 'deliveries'

export interface NavLeaf {
  label: string
  href: string
  description: string
  badge?: NavBadgeKey
  /** Badge tone — urgent items use the error tone, everything else stays neutral */
  urgent?: boolean
  keywords?: string[]
  /** Overrides the module permission for this page (e.g. KYC, role management) */
  permission?: PermissionModule
}

export interface NavModule {
  id: string
  label: string
  icon: LucideIcon
  permission: PermissionModule
  children: NavLeaf[]
}

export interface NavSection {
  title: string
  modules: NavModule[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    modules: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        permission: 'dashboard',
        children: [
          { label: 'Overview', href: '/', description: 'Health of the CropVibe marketplace at a glance' },
          {
            label: 'Platform activity',
            href: '/dashboard/activity',
            description: 'Live feed of what is happening across every module',
          },
          { label: 'Revenue', href: '/dashboard/revenue', description: 'Take rate, GMV and revenue by stream' },
          {
            label: 'Transactions',
            href: '/dashboard/transactions',
            description: 'Payment volume, success rate and failures in real time',
          },
          {
            label: 'Alerts',
            href: '/dashboard/alerts',
            description: 'System, fraud and SLA alerts that need an owner',
            badge: 'alerts',
            urgent: true,
          },
          {
            label: 'Pending actions',
            href: '/dashboard/pending-actions',
            description: 'Everything waiting on an admin, across all modules',
            badge: 'pendingActions',
            keywords: ['queue', 'inbox', 'todo'],
          },
        ],
      },
    ],
  },
  {
    title: 'Operations',
    modules: [
      {
        id: 'users',
        label: 'Users & Roles',
        icon: Users,
        permission: 'users',
        children: [
          { label: 'All users', href: '/users', description: 'Every account on CropVibe' },
          { label: 'Buyers', href: '/users/buyers', description: 'Farmers, traders and FPOs who purchase' },
          { label: 'Sellers', href: '/users/sellers', description: 'Accounts that list produce and inputs' },
          { label: 'Rental owners', href: '/users/rental-owners', description: 'Owners renting out machinery' },
          { label: 'Drivers', href: '/users/drivers', description: 'Drivers available for hire and logistics' },
          { label: 'Labor', href: '/users/labor', description: 'Farm labor providers and crews' },
          {
            label: 'Warehouse owners',
            href: '/users/warehouse-owners',
            description: 'Storage and cold-chain operators',
          },
          { label: 'Experts', href: '/users/experts', description: 'Agronomists, vets and soil experts' },
          { label: 'Admins', href: '/users/admins', description: 'CropVibe staff with console access' },
          {
            label: 'Role management',
            href: '/roles-permissions',
            description: 'Roles, permissions and access matrix',
            permission: 'roles',
            keywords: ['rbac', 'permissions', 'access'],
          },
          {
            label: 'KYC verification',
            href: '/kyc',
            description: 'Review identity and business documents',
            badge: 'kyc',
            urgent: true,
            permission: 'kyc',
            keywords: ['aadhaar', 'pan', 'gst', 'verify'],
          },
        ],
      },
      {
        id: 'marketplace',
        label: 'Marketplace',
        icon: ShoppingBag,
        permission: 'marketplace',
        children: [
          { label: 'Products', href: '/marketplace/products', description: 'Catalogue of sellable products (SKUs)' },
          {
            label: 'Categories',
            href: '/marketplace/categories',
            description: 'Category tree, commission and listing rules',
          },
          { label: 'Listings', href: '/listings', description: 'All live, flagged and archived listings' },
          {
            label: 'Listing approvals',
            href: '/marketplace/approvals',
            description: 'New and edited listings waiting for review',
            badge: 'listingApprovals',
          },
          {
            label: 'Orders',
            href: '/marketplace/orders',
            description: 'Marketplace orders from checkout to delivery',
            badge: 'orders',
          },
          { label: 'Sellers', href: '/marketplace/sellers', description: 'Seller performance, ratings and tiers' },
          {
            label: 'Marketplace reports',
            href: '/marketplace/reports',
            description: 'GMV, conversion and category performance',
          },
        ],
      },
      {
        id: 'services',
        label: 'Services',
        icon: Tractor,
        permission: 'services',
        children: [
          { label: 'Machinery', href: '/services/machinery', description: 'Registered machinery and equipment' },
          {
            label: 'Machinery rental',
            href: '/services/machinery-rental',
            description: 'Rental offers, rates and availability',
          },
          { label: 'Labor', href: '/services/labor', description: 'Labor services and crew offers' },
          { label: 'Drivers', href: '/services/drivers', description: 'Driver-for-hire services' },
          { label: 'Logistics', href: '/services/logistics', description: 'Transport and freight partners' },
          { label: 'Warehouses', href: '/services/warehouses', description: 'Storage capacity and occupancy' },
          { label: 'Experts', href: '/services/experts', description: 'Advisory and consultation services' },
          {
            label: 'Soil testing',
            href: '/services/soil-testing',
            description: 'Soil test requests, labs and reports',
          },
        ],
      },
      {
        id: 'operations',
        label: 'Bookings & Ops',
        icon: CalendarClock,
        permission: 'operations',
        children: [
          {
            label: 'Bookings',
            href: '/operations/bookings',
            description: 'Service and rental bookings',
            badge: 'bookings',
          },
          {
            label: 'Appointments',
            href: '/operations/appointments',
            description: 'Expert consultations and field visits',
          },
          {
            label: 'Deliveries',
            href: '/operations/deliveries',
            description: 'Shipments from pickup to proof of delivery',
            badge: 'deliveries',
          },
          { label: 'Tracking', href: '/operations/tracking', description: 'Live position of trips and vehicles' },
          {
            label: 'Agreements',
            href: '/operations/agreements',
            description: 'Rental, lease and service agreements',
          },
          { label: 'Reports', href: '/operations/reports', description: 'Fulfilment SLAs and utilisation' },
        ],
      },
    ],
  },
  {
    title: 'Money & Trust',
    modules: [
      {
        id: 'finance',
        label: 'Finance',
        icon: Wallet,
        permission: 'finance',
        children: [
          { label: 'Revenue', href: '/finance/revenue', description: 'Commission and fee revenue ledger' },
          { label: 'Transactions', href: '/transactions', description: 'Every money movement on the platform' },
          { label: 'Payments', href: '/finance/payments', description: 'Incoming payments from buyers' },
          {
            label: 'Refunds',
            href: '/finance/refunds',
            description: 'Refund requests and approvals',
            badge: 'refunds',
          },
          {
            label: 'Settlements',
            href: '/finance/settlements',
            description: 'Gateway settlements and reconciliation',
          },
          {
            label: 'Payouts',
            href: '/finance/payouts',
            description: 'Payouts to sellers and service providers',
            badge: 'payouts',
          },
          { label: 'Invoices', href: '/finance/invoices', description: 'Invoices issued to users and partners' },
          { label: 'Subscriptions', href: '/subscriptions', description: 'Plans, subscribers and renewals' },
          {
            label: 'Financial disputes',
            href: '/finance/disputes',
            description: 'Chargebacks and payment disputes',
            badge: 'financialDisputes',
            urgent: true,
          },
        ],
      },
      {
        id: 'trust',
        label: 'Trust & Safety',
        icon: ShieldAlert,
        permission: 'trust',
        children: [
          {
            label: 'Disputes & issues',
            href: '/disputes',
            description: 'Order and service disputes between users',
            badge: 'disputes',
            urgent: true,
          },
          {
            label: 'Content moderation',
            href: '/moderation',
            description: 'Reported listings, reviews, profiles and messages',
            badge: 'moderation',
          },
          { label: 'Audit log', href: '/audit-log', description: 'Every admin action, who did it and when' },
        ],
      },
      {
        id: 'support',
        label: 'Support & Comms',
        icon: LifeBuoy,
        permission: 'support',
        children: [
          {
            label: 'Support requests',
            href: '/support',
            description: 'Tickets from users across channels',
            badge: 'support',
          },
          { label: 'Notifications', href: '/notifications', description: 'System inbox and broadcasts to users' },
          { label: 'Content (CMS)', href: '/content', description: 'Banners, FAQs, legal pages and app copy' },
        ],
      },
    ],
  },
  {
    title: 'Platform',
    modules: [
      {
        id: 'insights',
        label: 'Reports & Insights',
        icon: FileBarChart,
        permission: 'reports',
        children: [
          { label: 'Reports', href: '/reports', description: 'Scheduled and on-demand reports' },
          { label: 'Analytics', href: '/analytics', description: 'Acquisition, GMV and churn analytics' },
          {
            label: 'Platform performance',
            href: '/performance',
            description: 'Uptime, latency, errors and app health',
          },
        ],
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        permission: 'settings',
        children: [
          { label: 'Platform settings', href: '/settings', description: 'Commission, KYC rules, SLAs and flags' },
          {
            label: 'Integrations',
            href: '/settings/integrations',
            description: 'Payment, logistics and partner connections',
          },
        ],
      },
    ],
  },
]

export const NAV_MODULES = NAV_SECTIONS.flatMap((s) => s.modules)

export const NAV_LEAVES = NAV_MODULES.flatMap((m) =>
  m.children.map((leaf) => ({ ...leaf, module: m }))
)

export type NavMatch = { module: NavModule; leaf: NavLeaf; isDetail: boolean }

/** Longest-prefix match of the current path against every nav leaf. */
export function matchNav(pathname: string): NavMatch | null {
  let best: (typeof NAV_LEAVES)[number] | null = null
  for (const leaf of NAV_LEAVES) {
    const hit =
      leaf.href === '/'
        ? pathname === '/'
        : pathname === leaf.href || pathname.startsWith(`${leaf.href}/`)
    if (hit && (!best || leaf.href.length > best.href.length)) best = leaf
  }
  if (!best) return null
  return { module: best.module, leaf: best, isDetail: pathname !== best.href }
}

export function leafPermission(match: NavMatch): PermissionModule {
  return match.leaf.permission ?? match.module.permission
}
