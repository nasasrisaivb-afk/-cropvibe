import type {
  AdminUser,
  User,
  KycApplication,
  Dispute,
  Listing,
  Transaction,
  Subscription,
  SubscriptionPlan,
  SystemNotification,
  ContentItem,
  ActivityItem,
  PlatformSettings,
  BroadcastResult,
  Permission,
  AdminRole,
  PermissionModule,
} from '@/lib/types'
import { ALL_USER_ROLES, INDIAN_STATES } from '@/lib/types'

export const DEMO_PASSWORD = 'Admin@123'

/** Inline SVG placeholder (no external image host needed) */
export function placeholderImage(w: number, h: number, label: string, fg = '#3EB0EF', bg = '#191D20'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="${bg}"/><rect x="12" y="12" width="${w - 24}" height="${h - 24}" rx="12" fill="none" stroke="${fg}" stroke-opacity="0.35" stroke-dasharray="6 6"/><text x="50%" y="50%" fill="${fg}" font-family="Inter, Arial, sans-serif" font-size="${Math.round(h / 12)}" font-weight="600" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(42)

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]!
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000 - rand() * 3600000).toISOString()
}

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3600000 - rand() * 600000).toISOString()
}

const FIRST = [
  'Harish', 'Priya', 'Mohit', 'Divya', 'Rajesh', 'Ananya', 'Vikram', 'Sneha',
  'Amit', 'Kavita', 'Suresh', 'Meera', 'Arjun', 'Pooja', 'Nikhil', 'Ritu',
  'Karan', 'Neha', 'Deepak', 'Shreya', 'Rahul', 'Isha', 'Sanjay', 'Aditi',
]
const LAST = [
  'Kumar', 'Sharma', 'Patel', 'Reddy', 'Singh', 'Nair', 'Iyer', 'Gupta',
  'Joshi', 'Desai', 'Mehta', 'Chopra', 'Verma', 'Rao', 'Malhotra', 'Banerjee',
]
const DISTRICTS: Record<string, string[]> = {
  MH: ['Pune', 'Nashik', 'Nagpur', 'Kolhapur'],
  KA: ['Bengaluru', 'Mysuru', 'Hubli', 'Belagavi'],
  TN: ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
  UP: ['Lucknow', 'Kanpur', 'Varanasi', 'Agra'],
  GJ: ['Ahmedabad', 'Surat', 'Rajkot', 'Vadodara'],
  RJ: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
  PB: ['Ludhiana', 'Amritsar', 'Patiala', 'Jalandhar'],
  HR: ['Gurugram', 'Faridabad', 'Karnal', 'Hisar'],
  AP: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati'],
  TS: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  KL: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur'],
  WB: ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri'],
  OR: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri'],
  MP: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior'],
  BR: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur'],
  JH: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
  CG: ['Raipur', 'Bilaspur', 'Durg', 'Korba'],
  AS: ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat'],
  UK: ['Dehradun', 'Haridwar', 'Nainital', 'Haldwani'],
  HP: ['Shimla', 'Kangra', 'Mandi', 'Solan'],
}

export const PERMISSION_MODULES: PermissionModule[] = [
  'dashboard', 'users', 'kyc', 'roles', 'marketplace', 'services',
  'operations', 'finance', 'trust', 'support', 'reports', 'settings',
]

const ROLE_SCOPES: Record<AdminRole, { modules: PermissionModule[]; actions: Permission['actions'] }[]> = {
  super_admin: [{ modules: PERMISSION_MODULES, actions: ['view', 'create', 'edit', 'delete'] }],
  auditor: [{ modules: PERMISSION_MODULES, actions: ['view'] }],
  ops_admin: [
    {
      modules: ['dashboard', 'users', 'kyc', 'marketplace', 'services', 'operations', 'trust', 'support', 'reports'],
      actions: ['view', 'create', 'edit'],
    },
  ],
  finance_admin: [
    { modules: ['dashboard', 'finance', 'reports'], actions: ['view', 'create', 'edit'] },
    { modules: ['users', 'marketplace', 'settings'], actions: ['view'] },
  ],
  support_agent: [
    { modules: ['support', 'trust'], actions: ['view', 'edit'] },
    { modules: ['dashboard', 'users', 'marketplace', 'operations'], actions: ['view'] },
  ],
}

export function perms(role: AdminRole): Permission[] {
  return ROLE_SCOPES[role].flatMap((scope) =>
    scope.modules.map((module) => ({ module, actions: [...scope.actions] }))
  )
}

export const adminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    email: 'admin@cropvibe.com',
    name: 'Raj Kumar',
    phone: '9876543210',
    role: 'super_admin',
    permissions: perms('super_admin'),
    status: 'active',
    lastLogin: hoursAgo(1),
    createdAt: daysAgo(365),
    updatedAt: hoursAgo(1),
  },
  {
    id: 'admin-2',
    email: 'maya@cropvibe.com',
    name: 'Maya Singh',
    role: 'ops_admin',
    permissions: perms('ops_admin'),
    status: 'active',
    lastLogin: hoursAgo(5),
    createdAt: daysAgo(200),
    updatedAt: daysAgo(2),
  },
  {
    id: 'admin-3',
    email: 'arjun@cropvibe.com',
    name: 'Arjun Mehta',
    role: 'support_agent',
    permissions: perms('support_agent'),
    status: 'active',
    lastLogin: hoursAgo(12),
    createdAt: daysAgo(120),
    updatedAt: daysAgo(5),
  },
  {
    id: 'admin-4',
    email: 'finance@cropvibe.com',
    name: 'Neha Gupta',
    role: 'finance_admin',
    permissions: perms('finance_admin'),
    status: 'active',
    lastLogin: daysAgo(1),
    createdAt: daysAgo(90),
    updatedAt: daysAgo(1),
  },
  {
    id: 'admin-5',
    email: 'auditor@cropvibe.com',
    name: 'Suresh Iyer',
    role: 'auditor',
    permissions: perms('auditor'),
    status: 'active',
    lastLogin: daysAgo(3),
    createdAt: daysAgo(60),
    updatedAt: daysAgo(3),
  },
]

function phoneFor(i: number): string {
  const start = [6, 7, 8, 9][i % 4]!
  return `${start}${String(900000000 + i * 137).slice(0, 9)}`
}

export const users: User[] = Array.from({ length: 120 }, (_, i) => {
  const first = FIRST[i % FIRST.length]!
  const last = LAST[i % LAST.length]!
  const state = INDIAN_STATES[i % INDIAN_STATES.length]!
  const district = pick(DISTRICTS[state] ?? ['Central'])
  const role = ALL_USER_ROLES[i % ALL_USER_ROLES.length]!
  const kycPool = ['approved', 'pending', 'rejected', 'none', 'approved', 'approved'] as const
  const statusPool = ['active', 'active', 'active', 'suspended', 'inactive', 'banned'] as const
  return {
    id: `user-${i + 1}`,
    firstName: first,
    lastName: last,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@crop.in`,
    phone: phoneFor(i),
    roles: [role, ...(i % 7 === 0 ? [ALL_USER_ROLES[(i + 3) % ALL_USER_ROLES.length]!] : [])],
    kyc: kycPool[i % kycPool.length]!,
    accountStatus: statusPool[i % statusPool.length]!,
    location: { state, district },
    joinedAt: daysAgo(30 + (i % 300)),
    lastActiveAt: hoursAgo(i % 72),
    notes: [],
    pan: i % 3 === 0 ? `ABCDE${1000 + i}F` : undefined,
    aadhaarMasked: `XXXX-XXXX-${1000 + (i % 9000)}`,
    gst: role === 'seller' || role === 'warehouse_owner' ? `27AABCU${9600 + i}D1ZM` : undefined,
  }
})

const DOC_TYPES = ['aadhaar', 'pan', 'gst', 'digilocker'] as const
const KYC_STATUSES = ['pending', 'in_review', 'approved', 'rejected', 'resubmit_requested'] as const

export const kycApplications: KycApplication[] = Array.from({ length: 55 }, (_, i) => {
  const user = users[i % users.length]!
  const status = KYC_STATUSES[i % KYC_STATUSES.length]!
  const submittedAt =
    status === 'pending' || status === 'in_review'
      ? hoursAgo(i % 3 === 0 ? 60 + (i % 20) : 4 + (i % 40))
      : daysAgo(2 + (i % 20))
  return {
    id: `kyc-${i + 1}`,
    userId: user.id,
    userName: `${user.firstName} ${user.lastName}`,
    userPhone: user.phone,
    userEmail: user.email,
    userRole: user.roles[0]!,
    location: user.location,
    documentType: DOC_TYPES[i % DOC_TYPES.length]!,
    documentUrl: placeholderImage(800, 500, `${DOC_TYPES[i % DOC_TYPES.length]!.toUpperCase()} · ${user.firstName} ${user.lastName}`),
    status,
    submittedAt,
    reviewedAt: status === 'approved' || status === 'rejected' ? daysAgo(1) : undefined,
    reviewedBy: status === 'approved' || status === 'rejected' ? 'admin-1' : undefined,
    rejectionReason: status === 'rejected' ? 'Illegible document' : undefined,
    resubmitReason: status === 'resubmit_requested' ? 'Poor photo quality' : undefined,
    checklist: {
      matchesPlatformData: i % 4 !== 0,
      addressVerified: i % 3 !== 0,
      nameMismatch: i % 5 === 0,
      documentExpired: i % 11 === 0,
      manualNeeded: i % 7 === 0,
    },
    auditTrail: [
      {
        timestamp: submittedAt,
        action: 'submitted',
        actor: user.id,
        details: 'Document uploaded',
      },
      ...(status !== 'pending'
        ? [
            {
              timestamp: hoursAgo(2),
              action: 'started_review',
              actor: 'admin-2',
              details: 'Review started',
            },
          ]
        : []),
    ],
  }
})

const DISPUTE_REASONS = [
  'Defective Product',
  'Short Quantity',
  'Late Delivery',
  'Wrong Item',
  'Payment Issue',
  'Quality Mismatch',
]
const DISPUTE_STATUSES = ['new', 'under_investigation', 'awaiting_response', 'resolved', 'escalated'] as const

export const disputes: Dispute[] = Array.from({ length: 32 }, (_, i) => {
  const buyer = users[i % users.length]!
  const seller = users[(i + 17) % users.length]!
  const status = DISPUTE_STATUSES[i % DISPUTE_STATUSES.length]!
  const createdAt = daysAgo(1 + (i % 14))
  return {
    id: `D-${1040 + i}`,
    buyerId: buyer.id,
    buyerName: `${buyer.firstName} ${buyer.lastName}`,
    buyerPhone: buyer.phone,
    sellerId: seller.id,
    sellerName: `${seller.firstName} ${seller.lastName}`,
    sellerPhone: seller.phone,
    transactionId: `TXN-2024-${String(1000 + i).padStart(6, '0')}`,
    amount: Math.round((2000 + rand() * 48000) / 100) * 100,
    reason: DISPUTE_REASONS[i % DISPUTE_REASONS.length]!,
    status,
    evidence: [
      {
        id: `ev-${i}-1`,
        type: 'image',
        url: placeholderImage(400, 300, 'tractor_front_damage.jpg', '#E5EFF5'),
        label: 'Product photo',
        submittedBy: 'buyer',
        submittedAt: createdAt,
      },
      {
        id: `ev-${i}-2`,
        type: 'message',
        url: '#',
        label: 'Chat excerpt',
        submittedBy: 'seller',
        submittedAt: hoursAgo(20),
      },
    ],
    messages: [
      {
        id: `msg-${i}-1`,
        kind: 'external',
        author: `${buyer.firstName} ${buyer.lastName}`,
        role: 'Buyer',
        body: 'Received defective item, please refund',
        createdAt,
      },
      {
        id: `msg-${i}-2`,
        kind: 'external',
        author: `${seller.firstName} ${seller.lastName}`,
        role: 'Seller',
        body: 'Product was shipped in good condition. Sharing packing photo.',
        createdAt: hoursAgo(30),
      },
      {
        id: `msg-${i}-3`,
        kind: 'internal',
        author: 'Maya Singh',
        role: 'Ops Admin',
        body: 'Started investigation. Requesting more images.',
        createdAt: hoursAgo(18),
      },
    ],
    createdAt,
    resolvedAt: status === 'resolved' ? daysAgo(0.5) : undefined,
    assignedTo: i % 2 === 0 ? 'admin-2' : 'admin-1',
    assignedToName: i % 2 === 0 ? 'Maya Singh' : 'Raj Kumar',
    slaDeadline: new Date(new Date(createdAt).getTime() + 7 * 86400000).toISOString(),
    latestNote: status === 'awaiting_response' ? 'Waiting for seller response' : undefined,
    resolution:
      status === 'resolved'
        ? {
            type: 'refund',
            amount: Math.round((1000 + rand() * 5000) / 100) * 100,
            notes: 'Full refund approved based on evidence',
            decidedBy: 'admin-1',
            decidedAt: daysAgo(0.5),
          }
        : undefined,
  }
})

const CROP_TITLES = [
  'Wheat Grain Premium', 'Basmati Rice 25kg', 'Organic Turmeric', 'Soybean Bulk',
  'Cotton Lint Grade A', 'Maize Feed Grade', 'Onion Red Fresh', 'Potato Seed Grade',
]
const EQUIP_TITLES = [
  'Tractor Rental John Deere', 'Harvester Seasonal', 'Rotavator Hire', 'Drip Kit Rental',
  'Sprayer Boom', 'Thresher Machine',
]
const WH_TITLES = [
  'Cold Storage 500MT', 'Warehouse Near Highway', 'Grain Silo Space', 'Climate Controlled Unit',
]

export const listings: Listing[] = Array.from({ length: 60 }, (_, i) => {
  const seller = users[i % users.length]!
  const type = (['crop', 'equipment_rental', 'warehouse'] as const)[i % 3]!
  const titles = type === 'crop' ? CROP_TITLES : type === 'equipment_rental' ? EQUIP_TITLES : WH_TITLES
  const statuses = ['pending_review', 'active', 'active', 'active', 'flagged', 'archived', 'removed'] as const
  const state = seller.location.state
  return {
    id: `listing-${i + 1}`,
    sellerId: seller.id,
    sellerName: `${seller.firstName} ${seller.lastName}`,
    type,
    title: titles[i % titles.length]!,
    description: `Quality ${titles[i % titles.length]} available for marketplace buyers. Verified seller listing.`,
    images: [
      placeholderImage(600, 400, titles[i % titles.length]!),
      placeholderImage(600, 400, 'Detail photo', '#A9BAC2'),
    ],
    category: type === 'crop' ? 'Produce' : type === 'equipment_rental' ? 'Machinery' : 'Storage',
    subCategory: type === 'crop' ? 'Grains' : type === 'equipment_rental' ? 'Tractors' : 'Cold Chain',
    status: statuses[i % statuses.length]!,
    price: Math.round((5000 + rand() * 95000) / 100) * 100,
    quantity: type === 'crop' ? 50 + (i % 200) : undefined,
    rentalPeriod: type === 'equipment_rental' ? 'per day' : undefined,
    capacity: type === 'warehouse' ? 100 + i * 10 : undefined,
    location: {
      state,
      district: seller.location.district,
      gps: { lat: 18 + rand() * 10, lng: 72 + rand() * 10 },
    },
    views: 20 + Math.floor(rand() * 800),
    inquiries: Math.floor(rand() * 40),
    createdAt: daysAgo(1 + (i % 60)),
    updatedAt: hoursAgo(i % 48),
  }
})

export const transactions: Transaction[] = Array.from({ length: 220 }, (_, i) => {
  const from = users[i % users.length]!
  const to = users[(i + 11) % users.length]!
  const type = (['payment', 'payout', 'refund', 'chargeback'] as const)[i % 4]!
  const status = (['completed', 'completed', 'completed', 'pending', 'failed', 'reversed'] as const)[i % 6]!
  const createdAt = daysAgo(i % 45)
  return {
    id: `TXN-${String(100000 + i)}`,
    type,
    fromUserId: from.id,
    fromName: `${from.firstName} ${from.lastName}`,
    toUserId: to.id,
    toName: `${to.firstName} ${to.lastName}`,
    amount: Math.round((500 + rand() * 49500) / 50) * 50,
    currency: 'INR',
    status,
    gatewayReference: `rzp_${100000 + i}`,
    paymentMethod: pick(['UPI', 'Card', 'Wallet', 'NetBanking']),
    createdAt,
    completedAt: status === 'completed' ? createdAt : undefined,
  }
})

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-basic',
    name: 'Basic',
    monthlyPrice: 499,
    features: ['5 listings', 'Basic analytics', 'Email support'],
    activeSubscribers: 0,
    mrr: 0,
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    monthlyPrice: 999,
    features: ['25 listings', 'Priority KYC', 'SMS alerts', 'Advanced analytics'],
    activeSubscribers: 0,
    mrr: 0,
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    monthlyPrice: 2499,
    features: ['Unlimited listings', 'Dedicated manager', 'API access', 'Custom SLA'],
    activeSubscribers: 0,
    mrr: 0,
  },
  {
    id: 'plan-growth',
    name: 'Growth',
    monthlyPrice: 1499,
    features: ['50 listings', 'Featured placement', 'Broadcast credits'],
    activeSubscribers: 0,
    mrr: 0,
  },
]

export const subscriptions: Subscription[] = Array.from({ length: 42 }, (_, i) => {
  const user = users[i % users.length]!
  const plan = subscriptionPlans[i % subscriptionPlans.length]!
  const status = (['active', 'active', 'active', 'expiring_soon', 'cancelled', 'expired', 'paused'] as const)[
    i % 7
  ]!
  return {
    id: `sub-${i + 1}`,
    userId: user.id,
    userName: `${user.firstName} ${user.lastName}`,
    planId: plan.id,
    planName: plan.name,
    monthlyPrice: plan.monthlyPrice,
    status,
    startDate: daysAgo(60 + (i % 120)),
    renewalDate: daysAgo(-(10 + (i % 20))),
    cancelledAt: status === 'cancelled' ? daysAgo(5) : undefined,
    reason: status === 'cancelled' ? pick(['Too expensive', 'Not using enough', 'Switched plan']) : undefined,
  }
})

subscriptionPlans.forEach((plan) => {
  const active = subscriptions.filter((s) => s.planId === plan.id && (s.status === 'active' || s.status === 'expiring_soon'))
  plan.activeSubscribers = active.length
  plan.mrr = active.length * plan.monthlyPrice
})

export const notifications: SystemNotification[] = [
  {
    id: 'notif-1',
    type: 'alert',
    title: '5 KYC applications overdue SLA',
    message: 'Review pending KYC queue — several applications exceed 48h.',
    relatedHref: '/kyc?status=pending',
    read: false,
    createdAt: hoursAgo(1),
  },
  {
    id: 'notif-2',
    type: 'warning',
    title: 'New dispute opened',
    message: 'Dispute D-1042 for ₹5,000 requires assignment.',
    relatedEntityId: 'D-1042',
    relatedHref: '/disputes/D-1042',
    read: false,
    createdAt: hoursAgo(2),
  },
  {
    id: 'notif-3',
    type: 'error',
    title: 'Payment failed',
    message: 'Transaction TXN-100045 failed at gateway.',
    relatedHref: '/transactions',
    read: false,
    createdAt: hoursAgo(4),
  },
  {
    id: 'notif-4',
    type: 'info',
    title: 'Subscription ending in 3 days',
    message: 'Pro plan for Harish Kumar renews soon.',
    relatedHref: '/subscriptions',
    read: true,
    createdAt: hoursAgo(8),
  },
  {
    id: 'notif-5',
    type: 'warning',
    title: 'Listing flagged',
    message: 'A warehouse listing was flagged for review.',
    relatedHref: '/listings?status=flagged',
    read: true,
    createdAt: daysAgo(1),
  },
  {
    id: 'notif-6',
    type: 'alert',
    title: 'User flagged for suspicious activity',
    message: 'Multiple failed payouts from same account.',
    relatedHref: '/users',
    read: false,
    createdAt: hoursAgo(6),
  },
  {
    id: 'notif-7',
    type: 'info',
    title: 'Weekly GMV report ready',
    message: 'Analytics for last 7 days is available.',
    relatedHref: '/analytics',
    read: true,
    createdAt: daysAgo(2),
  },
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `notif-${8 + i}`,
    type: (['info', 'alert', 'warning'] as const)[i % 3]!,
    title: `System notice #${i + 1}`,
    message: `Automated platform alert regarding operational item ${i + 1}.`,
    relatedHref: '/',
    read: i % 2 === 0,
    createdAt: hoursAgo(10 + i * 3),
  })),
]

export const broadcasts: BroadcastResult[] = [
  {
    id: 'bc-1',
    title: 'Monsoon storage tips',
    body: 'Protect your produce — use verified warehouses this season.',
    channels: ['push', 'in_app'],
    audience: 'Sellers in MH, KA',
    audienceCount: 412,
    sent: 412,
    delivered: 398,
    opened: 156,
    clicked: 42,
    createdAt: daysAgo(3),
  },
]

export const contentItems: ContentItem[] = [
  {
    id: 'content-1',
    title: 'Home Hero Banner — Kharif',
    type: 'banner',
    status: 'published',
    body: '<p>Sell smarter this Kharif. Verified buyers across India.</p>',
    version: 3,
    publishedAt: daysAgo(10),
    updatedAt: daysAgo(2),
    updatedBy: 'Raj Kumar',
  },
  {
    id: 'content-2',
    title: 'Terms of Service',
    type: 'legal',
    status: 'published',
    body: '<h2>Terms</h2><p>Platform usage terms for CropVibe marketplace participants...</p>',
    version: 5,
    publishedAt: daysAgo(40),
    updatedAt: daysAgo(15),
    updatedBy: 'Maya Singh',
  },
  {
    id: 'content-3',
    title: 'Privacy Policy',
    type: 'legal',
    status: 'published',
    body: '<h2>Privacy</h2><p>We process KYC data as required by regulations...</p>',
    version: 4,
    publishedAt: daysAgo(40),
    updatedAt: daysAgo(20),
    updatedBy: 'Maya Singh',
  },
  {
    id: 'content-4',
    title: 'Play Store Short Description',
    type: 'play_store',
    status: 'draft',
    body: 'CropVibe — Views Become Value. Agri marketplace for India.',
    version: 1,
    updatedAt: daysAgo(1),
    updatedBy: 'Raj Kumar',
  },
  {
    id: 'content-5',
    title: 'Return Policy',
    type: 'legal',
    status: 'published',
    body: '<p>Returns and dispute windows for crop and rental orders...</p>',
    version: 2,
    publishedAt: daysAgo(25),
    updatedAt: daysAgo(25),
    updatedBy: 'Neha Gupta',
  },
  {
    id: 'content-6',
    title: 'FAQ — KYC',
    type: 'faq',
    status: 'published',
    body: '<p><strong>What documents are needed?</strong> Aadhaar, PAN, GST where applicable.</p>',
    version: 2,
    publishedAt: daysAgo(8),
    updatedAt: daysAgo(8),
    updatedBy: 'Arjun Mehta',
  },
  {
    id: 'content-7',
    title: 'Promo Banner — Equipment Rentals',
    type: 'banner',
    status: 'scheduled',
    body: '<p>Rent tractors and harvesters near you.</p>',
    version: 1,
    scheduledAt: daysAgo(-5),
    updatedAt: hoursAgo(6),
    updatedBy: 'Raj Kumar',
  },
  {
    id: 'content-8',
    title: 'Help — Disputes',
    type: 'faq',
    status: 'draft',
    body: '<p>How to raise and track a dispute from the app...</p>',
    version: 1,
    updatedAt: hoursAgo(12),
    updatedBy: 'Arjun Mehta',
  },
]

export let activities: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'kyc_approved',
    description: 'Harish Kumar (Seller) completed KYC verification',
    actorName: 'Raj Kumar',
    href: '/kyc',
    createdAt: hoursAgo(0.05),
  },
  {
    id: 'act-2',
    type: 'dispute_resolved',
    description: 'Dispute #D-1042 marked as resolved',
    actorName: 'Maya Singh',
    href: '/disputes/D-1042',
    createdAt: hoursAgo(0.25),
  },
  {
    id: 'act-3',
    type: 'listing_created',
    description: 'New listing from AgroWorks (Equipment)',
    actorName: 'System',
    href: '/listings',
    createdAt: hoursAgo(0.4),
  },
  {
    id: 'act-4',
    type: 'user_suspended',
    description: 'User Mohit Sharma suspended for policy violation',
    actorName: 'Raj Kumar',
    href: '/users',
    createdAt: hoursAgo(1),
  },
  {
    id: 'act-5',
    type: 'payment',
    description: 'Payment TXN-100012 completed — ₹12,500',
    actorName: 'System',
    href: '/transactions',
    createdAt: hoursAgo(2),
  },
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `act-${6 + i}`,
    type: pick(['kyc_approved', 'listing_created', 'dispute_opened', 'subscription_changed']),
    description: `${pick(FIRST)} ${pick(LAST)} — ${pick(['updated profile', 'submitted KYC', 'created listing', 'opened dispute'])}`,
    actorName: pick(['System', 'Raj Kumar', 'Maya Singh']),
    href: pick(['/users', '/kyc', '/listings', '/disputes']),
    createdAt: hoursAgo(3 + i * 2),
  })),
]

export const platformSettings: PlatformSettings = {
  commissionRates: {
    crop: 5,
    rental: 8,
    warehouse: 6,
    logistics: 10,
  },
  kycRequirements: {
    aadhaar: true,
    pan: true,
    gst: false,
  },
  disputeSlaHours: 168,
  featureFlags: [
    {
      key: 'equipment_rental',
      label: 'Allow equipment rental',
      enabled: true,
      description: 'Enable equipment rental marketplace',
    },
    {
      key: 'warehouse_matching',
      label: 'Beta: warehouse matching',
      enabled: false,
      description: 'AI matching for warehouse capacity',
    },
    {
      key: 'new_onboarding',
      label: 'New onboarding flow',
      enabled: true,
      description: 'Show redesigned onboarding to 10% of users',
    },
    {
      key: 'bulk_broadcast',
      label: 'Bulk notifications',
      enabled: true,
      description: 'Allow admins to send broadcast campaigns',
    },
  ],
  supportEmail: 'support@cropvibe.com',
  supportPhone: '18001234567',
  appName: 'CropVibe',
  appVersion: '1.4.2',
  notificationTemplates: [
    {
      id: 'tpl-1',
      name: 'KYC Approved',
      channel: 'email',
      subject: 'Your KYC is approved',
      body: 'Hi {{userName}}, your KYC verification is complete. You can now list products.',
    },
    {
      id: 'tpl-2',
      name: 'Dispute Resolved',
      channel: 'push',
      subject: 'Dispute update',
      body: 'Dispute {{disputeId}} resolved: {{resolution}}. Amount: {{amount}}',
    },
    {
      id: 'tpl-3',
      name: 'Payment Failed',
      channel: 'sms',
      subject: 'Payment failed',
      body: 'Hi {{userName}}, payment of {{amount}} failed. Retry: {{link}}',
    },
  ],
}

export function pushActivity(item: Omit<ActivityItem, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) {
  activities = [
    {
      id: item.id ?? `act-${Date.now()}`,
      createdAt: item.createdAt ?? new Date().toISOString(),
      type: item.type,
      description: item.description,
      actorName: item.actorName,
      href: item.href,
    },
    ...activities,
  ].slice(0, 50)
}
