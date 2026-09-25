export type AdminRole =
  | 'super_admin'
  | 'ops_admin'
  | 'support_agent'
  | 'finance_admin'
  | 'auditor'

export interface Permission {
  module: string
  actions: string[]
}

export interface AdminUser {
  id: string
  email: string
  name: string
  phone?: string
  role: AdminRole
  permissions: Permission[]
  avatar?: string
  status: 'active' | 'inactive'
  lastLogin?: string
  mfa?: boolean
  createdAt: string
  updatedAt: string
  history?: { at: string; actor: string; action: string; note?: string }[]
}

export type UserRole =
  | 'buyer'
  | 'seller'
  | 'rental_provider'
  | 'driver'
  | 'labor_provider'
  | 'warehouse_owner'
  | 'expert'
  | 'logistics_partner'
  | 'soil_lab'

/** Console modules that permissions are granted on (see config/navigation.ts). */
export type PermissionModule =
  | 'dashboard'
  | 'users'
  | 'kyc'
  | 'roles'
  | 'marketplace'
  | 'services'
  | 'operations'
  | 'finance'
  | 'trust'
  | 'support'
  | 'reports'
  | 'settings'

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete'

export type KycStatus = 'approved' | 'pending' | 'rejected' | 'none'
export type AccountStatus = 'active' | 'suspended' | 'banned' | 'inactive'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  roles: UserRole[]
  kyc: KycStatus
  accountStatus: AccountStatus
  location: { state: string; district: string }
  joinedAt: string
  lastActiveAt?: string
  notes?: UserNote[]
  pan?: string
  aadhaarMasked?: string
  gst?: string
}

export interface UserNote {
  id: string
  text: string
  adminId: string
  adminName: string
  createdAt: string
}

export interface AuditEntry {
  timestamp: string
  action: string
  actor: string
  details?: string
}

export interface KycApplication {
  id: string
  userId: string
  userName: string
  userPhone: string
  userEmail: string
  userRole: UserRole
  location: { state: string; district: string }
  documentType: 'aadhaar' | 'pan' | 'gst' | 'digilocker'
  documentUrl: string
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'resubmit_requested'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
  resubmitReason?: string
  internalNotes?: string
  checklist: {
    matchesPlatformData: boolean
    addressVerified: boolean
    nameMismatch: boolean
    documentExpired: boolean
    manualNeeded: boolean
  }
  auditTrail: AuditEntry[]
}

export interface DisputeEvidence {
  id: string
  type: 'image' | 'document' | 'message'
  url: string
  label: string
  submittedBy: 'buyer' | 'seller'
  submittedAt: string
}

export interface DisputeMessage {
  id: string
  kind: 'external' | 'internal'
  author: string
  role: string
  body: string
  createdAt: string
}

export interface DisputeResolution {
  type: 'refund' | 'replacement' | 'mediation' | 'deny'
  amount?: number
  notes: string
  internalNotes?: string
  decidedBy: string
  decidedAt: string
}

export interface Dispute {
  id: string
  buyerId: string
  buyerName: string
  buyerPhone: string
  sellerId: string
  sellerName: string
  sellerPhone: string
  transactionId: string
  amount: number
  reason: string
  status: 'new' | 'under_investigation' | 'awaiting_response' | 'resolved' | 'escalated'
  evidence: DisputeEvidence[]
  messages: DisputeMessage[]
  resolution?: DisputeResolution
  createdAt: string
  resolvedAt?: string
  assignedTo?: string
  assignedToName?: string
  slaDeadline: string
  latestNote?: string
}

export interface Listing {
  id: string
  sellerId: string
  sellerName: string
  type: 'crop' | 'equipment_rental' | 'warehouse'
  title: string
  description: string
  images: string[]
  category: string
  subCategory: string
  status: 'pending_review' | 'active' | 'flagged' | 'removed' | 'archived'
  price?: number
  quantity?: number
  rentalPeriod?: string
  capacity?: number
  location: { state: string; district: string; gps?: { lat: number; lng: number } }
  views: number
  inquiries: number
  createdAt: string
  updatedAt: string
  flagReason?: string
  removalReason?: string
  internalNotes?: string
}

export interface Transaction {
  id: string
  type: 'payment' | 'payout' | 'refund' | 'chargeback'
  fromUserId?: string
  fromName?: string
  toUserId?: string
  toName?: string
  amount: number
  currency: 'INR'
  status: 'pending' | 'completed' | 'failed' | 'reversed'
  gatewayReference?: string
  paymentMethod?: string
  createdAt: string
  completedAt?: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  monthlyPrice: number
  features: string[]
  activeSubscribers: number
  mrr: number
}

export interface Subscription {
  id: string
  userId: string
  userName: string
  planId: string
  planName: string
  monthlyPrice: number
  status: 'active' | 'paused' | 'cancelled' | 'expired' | 'expiring_soon'
  startDate: string
  renewalDate: string
  cancelledAt?: string
  reason?: string
}

export interface SystemNotification {
  id: string
  type: 'alert' | 'info' | 'warning' | 'error'
  title: string
  message: string
  relatedEntityId?: string
  relatedHref?: string
  read: boolean
  createdAt: string
  dismissedAt?: string
}

export interface BroadcastResult {
  id: string
  title: string
  body: string
  channels: string[]
  audience: string
  audienceCount: number
  sent: number
  delivered: number
  opened: number
  clicked: number
  createdAt: string
}

export interface ContentItem {
  id: string
  title: string
  type: 'banner' | 'play_store' | 'legal' | 'faq'
  status: 'draft' | 'published' | 'scheduled'
  body: string
  version: number
  scheduledAt?: string
  publishedAt?: string
  updatedAt: string
  updatedBy: string
}

export interface ActivityItem {
  id: string
  type: string
  description: string
  actorName: string
  href?: string
  createdAt: string
}

export interface OverviewKpis {
  totalUsers: number
  usersChangeMtd: number
  activeListings: number
  listingsChangeMtd: number
  pendingKyc: number
  urgentKyc: number
  activeSubscriptions: number
  monthlyGmv: number
  openDisputes: number
  userGrowth: { date: string; count: number }[]
  roleDistribution: { role: string; count: number }[]
  transactionVolume: { day: string; count: number; amount: number }[]
  regionalActivity: { state: string; activity: number; gmv: number }[]
  badgeCounts: {
    users: number
    kyc: number
    disputes: number
    listings: number
  }
}

export interface AnalyticsData {
  newUsers: number
  newUsersChange: number
  activeUsers: number
  activeUsersChange: number
  gmv: number
  gmvChange: number
  churnRate: number
  churnReasons: { reason: string; count: number }[]
  userAcquisition: { date: string; count: number; role: string }[]
  gmvTrend: { date: string; amount: number }[]
  regional: { state: string; users: number; gmv: number; churn: number }[]
  topListings: { id: string; title: string; views: number; type: string }[]
}

export interface PlatformSettings {
  commissionRates: {
    crop: number
    rental: number
    warehouse: number
    logistics: number
  }
  kycRequirements: {
    aadhaar: boolean
    pan: boolean
    gst: boolean
  }
  disputeSlaHours: number
  featureFlags: { key: string; label: string; enabled: boolean; description: string }[]
  supportEmail: string
  supportPhone: string
  appName: string
  appVersion: string
  notificationTemplates: {
    id: string
    name: string
    channel: 'email' | 'sms' | 'push'
    subject: string
    body: string
  }[]
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  buyer: 'Buyer',
  seller: 'Seller',
  rental_provider: 'Rental Owner',
  driver: 'Driver',
  labor_provider: 'Labor',
  warehouse_owner: 'Warehouse Owner',
  expert: 'Expert',
  logistics_partner: 'Logistics Partner',
  soil_lab: 'Soil Lab',
}

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  ops_admin: 'Ops Admin',
  support_agent: 'Support Agent',
  finance_admin: 'Finance Admin',
  auditor: 'Auditor',
}

export const ALL_USER_ROLES = Object.keys(USER_ROLE_LABELS) as UserRole[]

export const INDIAN_STATES = [
  'MH', 'KA', 'TN', 'UP', 'GJ', 'RJ', 'PB', 'HR', 'AP', 'TS',
  'KL', 'WB', 'OR', 'MP', 'BR', 'JH', 'CG', 'AS', 'UK', 'HP',
] as const
