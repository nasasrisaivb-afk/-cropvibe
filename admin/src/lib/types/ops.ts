import type { BaseRecord } from '@/lib/resources/types'

/* ───────────────────────── Marketplace ───────────────────────── */

export interface Product extends BaseRecord {
  sku: string
  name: string
  category: string
  subCategory: string
  unit: 'kg' | 'quintal' | 'bag' | 'litre' | 'piece' | 'tonne'
  price: number
  mrp: number
  stock: number
  sellerId: string
  sellerName: string
  status: 'active' | 'out_of_stock' | 'draft' | 'blocked'
  rating: number
  orders30d: number
  state: string
  createdAt: string
}

export interface Category extends BaseRecord {
  name: string
  parent: string | null
  slug: string
  commission: number
  listings: number
  gmv30d: number
  requiresApproval: boolean
  status: 'active' | 'hidden'
  attributes: string[]
  updatedAt: string
}

export interface ListingApproval extends BaseRecord {
  listingTitle: string
  submission: 'new' | 'edit' | 'price_change' | 'relist'
  sellerId: string
  sellerName: string
  category: string
  price: number
  unit: string
  images: number
  risk: 'low' | 'medium' | 'high'
  riskSignals: string[]
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested'
  state: string
}

export interface Order extends BaseRecord {
  buyerId: string
  buyerName: string
  sellerId: string
  sellerName: string
  itemSummary: string
  items: number
  amount: number
  paymentMethod: 'UPI' | 'Card' | 'Net banking' | 'COD' | 'Wallet'
  paymentStatus: 'paid' | 'pending' | 'cod' | 'refunded' | 'failed'
  status: 'placed' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  placedAt: string
  eta: string
  district: string
  state: string
}

export interface SellerProfile extends BaseRecord {
  userId: string
  name: string
  storeName: string
  tier: 'gold' | 'silver' | 'bronze' | 'new'
  rating: number
  gmv30d: number
  orders30d: number
  fulfilmentRate: number
  cancellationRate: number
  activeListings: number
  status: 'active' | 'watchlist' | 'suspended' | 'onboarding'
  joinedAt: string
  state: string
}

/* ───────────────────────── Services ───────────────────────── */

export interface Machinery extends BaseRecord {
  name: string
  machineType: string
  ownerId: string
  ownerName: string
  regNo: string
  year: number
  hp: number
  condition: 'excellent' | 'good' | 'fair' | 'needs_service'
  lastInspection: string
  insuranceExpiry: string
  status: 'verified' | 'pending_inspection' | 'suspended' | 'retired'
  district: string
  state: string
}

export interface MachineryRental extends BaseRecord {
  machineName: string
  machineType: string
  ownerId: string
  ownerName: string
  rateType: 'per hour' | 'per day' | 'per acre'
  rate: number
  deposit: number
  availability: 'available' | 'booked' | 'maintenance'
  bookings30d: number
  utilisation: number
  rating: number
  status: 'live' | 'paused' | 'pending_review' | 'rejected'
  district: string
  state: string
}

export interface LaborService extends BaseRecord {
  leaderId: string
  leaderName: string
  crewSize: number
  skills: string[]
  dailyWage: number
  rating: number
  jobsCompleted: number
  availability: 'available' | 'engaged' | 'off_season'
  status: 'active' | 'pending_verification' | 'suspended'
  district: string
  state: string
}

export interface DriverService extends BaseRecord {
  userId: string
  name: string
  licenseNo: string
  licenseExpiry: string
  vehicleTypes: string[]
  experienceYears: number
  rating: number
  trips30d: number
  backgroundCheck: 'clear' | 'pending' | 'flagged'
  status: 'available' | 'on_trip' | 'offline' | 'suspended' | 'pending_verification'
  district: string
  state: string
}

export interface LogisticsPartner extends BaseRecord {
  name: string
  fleetSize: number
  vehicleTypes: string[]
  coverage: string[]
  onTimeRate: number
  activeShipments: number
  ratePerKm: number
  rating: number
  status: 'active' | 'onboarding' | 'suspended'
  contractEnd: string
}

export interface Warehouse extends BaseRecord {
  name: string
  ownerId: string
  ownerName: string
  storageType: 'Dry storage' | 'Cold storage' | 'Silo' | 'Open yard'
  capacityMt: number
  occupiedMt: number
  ratePerMtMonth: number
  wdraCertified: boolean
  lastAudit: string
  status: 'active' | 'pending_inspection' | 'full' | 'suspended'
  district: string
  state: string
}

export interface ExpertService extends BaseRecord {
  userId: string
  name: string
  specialization: string
  qualification: string
  languages: string[]
  fee: number
  consultations30d: number
  rating: number
  responseHours: number
  status: 'active' | 'pending_verification' | 'paused' | 'suspended'
  state: string
}

export interface SoilTest extends BaseRecord {
  farmerId: string
  farmerName: string
  village: string
  district: string
  state: string
  crop: string
  labName: string
  parameters: string[]
  fee: number
  requestedAt: string
  collectedAt?: string
  tatDays: number
  assignedExpert?: string
  status: 'requested' | 'sample_collected' | 'in_lab' | 'report_ready' | 'delivered' | 'cancelled'
}

/* ───────────────────────── Bookings & Operations ───────────────────────── */

export interface Booking extends BaseRecord {
  serviceType: 'Machinery rental' | 'Labor' | 'Driver' | 'Warehouse' | 'Expert' | 'Soil testing' | 'Logistics'
  serviceName: string
  customerId: string
  customerName: string
  providerName: string
  scheduledFor: string
  duration: string
  amount: number
  paymentStatus: 'paid' | 'pending' | 'refunded' | 'partially_paid'
  status: 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'disputed'
  district: string
  state: string
  createdAt: string
}

export interface Appointment extends BaseRecord {
  expertName: string
  farmerId: string
  farmerName: string
  topic: string
  mode: 'video' | 'phone' | 'field_visit'
  scheduledAt: string
  durationMin: number
  fee: number
  language: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed' | 'rescheduled'
}

export interface Delivery extends BaseRecord {
  orderId: string
  carrier: string
  driverName: string
  vehicleNo: string
  origin: string
  destination: string
  distanceKm: number
  weightKg: number
  pickedUpAt?: string
  eta: string
  progress: number
  podCaptured: boolean
  status: 'awaiting_pickup' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'delayed' | 'failed' | 'returned'
  lastPing: string
  /** Normalised 0–100 map coordinates for the schematic tracking view */
  from: { x: number; y: number }
  to: { x: number; y: number }
}

export interface Agreement extends BaseRecord {
  agreementType: 'Machinery rental' | 'Warehouse lease' | 'Labor contract' | 'Logistics contract' | 'Contract farming'
  partyA: string
  partyB: string
  startDate: string
  endDate: string
  value: number
  version: number
  signedByA: boolean
  signedByB: boolean
  status: 'draft' | 'pending_signature' | 'active' | 'expiring' | 'expired' | 'terminated'
}

/* ───────────────────────── Finance ───────────────────────── */

export interface Payment extends BaseRecord {
  reference: string
  payerId: string
  payerName: string
  amount: number
  fee: number
  method: 'UPI' | 'Card' | 'Net banking' | 'Wallet'
  gateway: 'Razorpay' | 'PayU' | 'Cashfree'
  gatewayRef: string
  status: 'captured' | 'authorized' | 'pending' | 'failed' | 'refunded'
  createdAt: string
  failureReason?: string
}

export interface Refund extends BaseRecord {
  paymentId: string
  orderId: string
  customerId: string
  customerName: string
  amount: number
  reason: string
  destination: 'Original source' | 'CropVibe wallet'
  requestedAt: string
  approvedBy?: string
  status: 'requested' | 'approved' | 'processing' | 'completed' | 'rejected'
}

export interface Settlement extends BaseRecord {
  gateway: 'Razorpay' | 'PayU' | 'Cashfree'
  periodStart: string
  periodEnd: string
  txnCount: number
  gross: number
  fees: number
  tax: number
  net: number
  expected: number
  utr?: string
  settledAt?: string
  status: 'scheduled' | 'settled' | 'mismatch' | 'reconciled'
}

export interface Payout extends BaseRecord {
  beneficiaryId: string
  beneficiaryName: string
  beneficiaryRole: string
  amount: number
  orders: number
  bankMasked: string
  ifsc: string
  cycle: string
  scheduledFor: string
  holdReason?: string
  status: 'scheduled' | 'pending_approval' | 'processing' | 'paid' | 'failed' | 'on_hold'
}

export interface Invoice extends BaseRecord {
  billedTo: string
  billedToId: string
  invoiceType: 'Commission' | 'Subscription' | 'Service fee' | 'Logistics' | 'Advertising'
  amount: number
  gst: number
  total: number
  issuedAt: string
  dueAt: string
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'void'
}

export interface FinancialDispute extends BaseRecord {
  paymentId: string
  customerName: string
  amount: number
  disputeType: 'Chargeback' | 'Duplicate charge' | 'Payment not received' | 'Settlement shortfall' | 'Payout failed'
  gateway: string
  raisedAt: string
  respondBy: string
  evidence: number
  status: 'open' | 'evidence_submitted' | 'won' | 'lost' | 'accepted'
}

export interface RevenueEntry extends BaseRecord {
  stream: string
  reference: string
  counterparty: string
  gross: number
  amount: number
  date: string
  status: 'recognized' | 'deferred' | 'reversed'
}

/* ───────────────────────── Trust, support, platform ───────────────────────── */

export interface ModerationReport extends BaseRecord {
  contentType: 'listing' | 'review' | 'profile' | 'message' | 'image'
  content: string
  reportedUserId: string
  reportedUserName: string
  reporterName: string
  reason: string
  reports: number
  aiScore: number
  severity: 'low' | 'medium' | 'high'
  createdAt: string
  status: 'open' | 'removed' | 'dismissed' | 'escalated' | 'warned'
}

export interface TicketMessage {
  id: string
  from: 'user' | 'agent' | 'internal'
  author: string
  body: string
  at: string
}

export interface SupportTicket extends BaseRecord {
  subject: string
  requesterId: string
  requesterName: string
  requesterRole: string
  channel: 'App' | 'WhatsApp' | 'Phone' | 'Email'
  category: 'Payments' | 'Orders' | 'KYC' | 'Account' | 'Bookings' | 'Technical' | 'Other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  language: string
  assignee?: string
  createdAt: string
  updatedAt: string
  slaDueAt: string
  csat?: number
  messages: TicketMessage[]
  status: 'open' | 'in_progress' | 'pending_user' | 'resolved' | 'closed'
}

export interface PlatformAlert extends BaseRecord {
  title: string
  description: string
  category: 'Fraud' | 'System' | 'SLA' | 'Finance' | 'Compliance' | 'Operations'
  severity: 'critical' | 'high' | 'medium' | 'low'
  source: string
  href?: string
  owner?: string
  createdAt: string
  status: 'open' | 'acknowledged' | 'resolved' | 'snoozed'
}

export interface ReportDefinition extends BaseRecord {
  name: string
  area: string
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'On demand'
  format: 'CSV' | 'XLSX' | 'PDF'
  recipients: string[]
  owner: string
  lastRunAt?: string
  nextRunAt?: string
  lastRows?: number
  status: 'active' | 'paused' | 'failed'
}

export interface Integration extends BaseRecord {
  name: string
  category: 'Payments' | 'Logistics' | 'Messaging' | 'Identity' | 'Accounting' | 'Maps'
  partner: string
  protocol: 'REST' | 'SFTP' | 'Webhook' | 'SOAP'
  direction: 'INBOUND' | 'OUTBOUND' | 'BOTH'
  endpoint: string
  port?: number
  username?: string
  filePattern?: string
  encryption: 'AES-256' | 'TLS 1.3' | 'PGP'
  certificateExpiry?: string
  lastSyncAt: string
  successRate: number
  createdAt: string
  updatedAt: string
  status: 'active' | 'degraded' | 'disconnected' | 'paused'
}

