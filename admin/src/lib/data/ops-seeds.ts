import { users, adminUsers, listings, transactions, subscriptions, disputes, contentItems, kycApplications } from '@/lib/data/seeds'
import { registerCollection, recordAudit, auditLog, hydrateAuditLog, type HistoryEntry } from '@/lib/data/store'
import type { User, UserRole } from '@/lib/types'
import type {
  Product,
  Category,
  ListingApproval,
  Order,
  SellerProfile,
  Machinery,
  MachineryRental,
  LaborService,
  DriverService,
  LogisticsPartner,
  Warehouse,
  ExpertService,
  SoilTest,
  Booking,
  Appointment,
  Delivery,
  Agreement,
  Payment,
  Refund,
  Settlement,
  Payout,
  Invoice,
  FinancialDispute,
  RevenueEntry,
  ModerationReport,
  SupportTicket,
  PlatformAlert,
  ReportDefinition,
  Integration,
} from '@/lib/types/ops'

/* Deterministic generator so every reload shows the same demo data */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(2026)
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]!
const int = (min: number, max: number) => Math.floor(min + rand() * (max - min + 1))
const round = (n: number, step = 10) => Math.round(n / step) * step
const HOUR = 3600000
const DAY = 86400000
const ago = (ms: number) => new Date(Date.now() - ms).toISOString()
const ahead = (ms: number) => new Date(Date.now() + ms).toISOString()
const fullName = (u: User) => `${u.firstName} ${u.lastName}`

function byRole(role: UserRole): User[] {
  const list = users.filter((u) => u.roles.includes(role))
  return list.length ? list : users
}

const created = (at: string, note?: string): HistoryEntry[] => [
  { at, actor: 'System', action: 'Created', note },
]

const buyers = byRole('buyer')
const sellers = byRole('seller')
const rentalOwners = byRole('rental_provider')
const drivers = byRole('driver')
const labor = byRole('labor_provider')
const warehouseOwners = byRole('warehouse_owner')
const experts = byRole('expert')

/* ───────────────────────── Marketplace ───────────────────────── */

const CATALOG: { name: string; category: string; sub: string; unit: Product['unit']; price: [number, number] }[] = [
  { name: 'Sharbati Wheat', category: 'Grains & Cereals', sub: 'Wheat', unit: 'quintal', price: [2400, 3200] },
  { name: 'Basmati Rice 1121', category: 'Grains & Cereals', sub: 'Rice', unit: 'quintal', price: [7200, 9800] },
  { name: 'Yellow Maize', category: 'Grains & Cereals', sub: 'Maize', unit: 'quintal', price: [1900, 2400] },
  { name: 'Tur Dal (Arhar)', category: 'Pulses', sub: 'Tur', unit: 'quintal', price: [8800, 11200] },
  { name: 'Kabuli Chana', category: 'Pulses', sub: 'Chickpea', unit: 'quintal', price: [6400, 8200] },
  { name: 'Nashik Red Onion', category: 'Vegetables', sub: 'Onion', unit: 'quintal', price: [1400, 2600] },
  { name: 'Kufri Jyoti Potato', category: 'Vegetables', sub: 'Potato', unit: 'quintal', price: [1100, 1800] },
  { name: 'Alphonso Mango', category: 'Fruits', sub: 'Mango', unit: 'kg', price: [180, 420] },
  { name: 'Cavendish Banana', category: 'Fruits', sub: 'Banana', unit: 'kg', price: [22, 38] },
  { name: 'Erode Turmeric Finger', category: 'Spices', sub: 'Turmeric', unit: 'quintal', price: [9800, 14500] },
  { name: 'Guntur Red Chilli', category: 'Spices', sub: 'Chilli', unit: 'quintal', price: [16000, 22000] },
  { name: 'Hybrid Cotton Seed BG-II', category: 'Seeds', sub: 'Cotton', unit: 'bag', price: [780, 950] },
  { name: 'Paddy Seed PR-126', category: 'Seeds', sub: 'Paddy', unit: 'bag', price: [950, 1250] },
  { name: 'Urea 45kg', category: 'Fertilizers', sub: 'Nitrogen', unit: 'bag', price: [266, 300] },
  { name: 'DAP 50kg', category: 'Fertilizers', sub: 'Phosphate', unit: 'bag', price: [1350, 1450] },
  { name: 'Vermicompost', category: 'Fertilizers', sub: 'Organic', unit: 'bag', price: [320, 480] },
  { name: 'Neem Oil 1500 ppm', category: 'Crop Protection', sub: 'Bio-pesticide', unit: 'litre', price: [380, 560] },
  { name: 'Drip Lateral 16mm (400m)', category: 'Irrigation', sub: 'Drip', unit: 'piece', price: [2400, 3600] },
  { name: 'Battery Knapsack Sprayer', category: 'Tools & Equipment', sub: 'Sprayers', unit: 'piece', price: [2800, 4200] },
  { name: 'A2 Desi Cow Ghee', category: 'Dairy & Livestock', sub: 'Dairy', unit: 'kg', price: [900, 1400] },
]

export const products: Product[] = registerCollection(
  'products',
  Array.from({ length: 84 }, (_, i) => {
    const c = CATALOG[i % CATALOG.length]!
    const s = sellers[i % sellers.length]!
    const price = round(int(c.price[0], c.price[1]), c.price[1] > 1000 ? 50 : 1)
    const stock = i % 9 === 0 ? 0 : int(4, 900)
    const createdAt = ago(int(2, 240) * DAY)
    return {
      id: `PRD-${1001 + i}`,
      sku: `CV-${c.sub.slice(0, 3).toUpperCase()}-${String(4000 + i * 7)}`,
      name: c.name,
      category: c.category,
      subCategory: c.sub,
      unit: c.unit,
      price,
      mrp: Math.round(price * (1.05 + rand() * 0.15)),
      stock,
      sellerId: s.id,
      sellerName: fullName(s),
      status: stock === 0 ? 'out_of_stock' : i % 17 === 0 ? 'blocked' : i % 11 === 0 ? 'draft' : 'active',
      rating: Math.round((3.4 + rand() * 1.6) * 10) / 10,
      orders30d: int(0, 140),
      state: s.location.state,
      createdAt,
      history: created(createdAt, 'Product added by seller'),
    }
  })
)

const CATEGORY_TREE: [string, string[], number, string[]][] = [
  ['Grains & Cereals', ['Wheat', 'Rice', 'Maize', 'Millets'], 2.5, ['Variety', 'Moisture %', 'Grade']],
  ['Pulses', ['Tur', 'Chickpea', 'Moong', 'Urad'], 2.5, ['Variety', 'Grade']],
  ['Vegetables', ['Onion', 'Potato', 'Tomato', 'Leafy greens'], 4, ['Size', 'Harvest date']],
  ['Fruits', ['Mango', 'Banana', 'Grapes', 'Pomegranate'], 5, ['Variety', 'Ripeness']],
  ['Spices', ['Turmeric', 'Chilli', 'Cumin', 'Cardamom'], 3.5, ['Curcumin %', 'Grade']],
  ['Seeds', ['Cotton', 'Paddy', 'Vegetable seeds'], 6, ['Germination %', 'Lot no.', 'Expiry']],
  ['Fertilizers', ['Nitrogen', 'Phosphate', 'Organic'], 3, ['NPK ratio', 'Batch']],
  ['Crop Protection', ['Bio-pesticide', 'Fungicide', 'Herbicide'], 6, ['CIB registration', 'Expiry']],
  ['Irrigation', ['Drip', 'Sprinkler', 'Pumps'], 7, ['Brand', 'Warranty']],
  ['Tools & Equipment', ['Sprayers', 'Hand tools'], 7, ['Brand', 'Warranty']],
  ['Dairy & Livestock', ['Dairy', 'Feed', 'Poultry'], 5, ['FSSAI licence']],
]

export const categories: Category[] = registerCollection(
  'categories',
  CATEGORY_TREE.flatMap(([name, subs, commission, attributes], i) => {
    const parentId = `CAT-${100 + i * 10}`
    const updatedAt = ago(int(1, 60) * DAY)
    const parent: Category = {
      id: parentId,
      name,
      parent: null,
      slug: name.toLowerCase().replace(/[^a-z]+/g, '-'),
      commission,
      listings: int(120, 2400),
      gmv30d: int(8, 90) * 100000,
      requiresApproval: ['Seeds', 'Crop Protection', 'Dairy & Livestock'].includes(name),
      status: 'active',
      attributes,
      updatedAt,
      history: created(updatedAt),
    }
    const children: Category[] = subs.map((sub, j) => ({
      id: `CAT-${100 + i * 10 + j + 1}`,
      name: sub,
      parent: name,
      slug: `${parent.slug}/${sub.toLowerCase().replace(/[^a-z]+/g, '-')}`,
      commission,
      listings: int(20, 700),
      gmv30d: int(1, 30) * 100000,
      requiresApproval: parent.requiresApproval,
      status: i === 9 && j === 1 ? 'hidden' : 'active',
      attributes,
      updatedAt,
      history: created(updatedAt),
    }))
    return [parent, ...children]
  })
)

const RISK_SIGNALS = [
  'Price 38% below mandi average',
  'New seller (< 7 days)',
  'Duplicate images found on 3 listings',
  'Contact number in description',
  'Restricted category — licence required',
  'Title mismatch with category',
  'Bulk upload from new device',
]

export const listingApprovals: ListingApproval[] = registerCollection(
  'listingApprovals',
  Array.from({ length: 36 }, (_, i) => {
    const c = CATALOG[(i * 3) % CATALOG.length]!
    const s = sellers[(i * 5) % sellers.length]!
    const risk = (['low', 'low', 'medium', 'high'] as const)[i % 4]!
    const status = (['pending', 'pending', 'pending', 'approved', 'rejected', 'changes_requested'] as const)[i % 6]!
    const submittedAt = ago((status === 'pending' ? int(1, 52) : int(60, 200)) * HOUR)
    return {
      id: `LA-${2001 + i}`,
      listingTitle: `${c.name} — ${pick(['Grade A', 'Farm fresh', 'Bulk lot', 'Certified organic', 'Export quality'])}`,
      submission: (['new', 'new', 'edit', 'price_change', 'relist'] as const)[i % 5]!,
      sellerId: s.id,
      sellerName: fullName(s),
      category: c.category,
      price: round(int(c.price[0], c.price[1]), 10),
      unit: c.unit,
      images: int(1, 8),
      risk,
      riskSignals: risk === 'low' ? [] : RISK_SIGNALS.filter((_, j) => (i + j) % (risk === 'high' ? 2 : 4) === 0).slice(0, risk === 'high' ? 3 : 1),
      submittedAt,
      status,
      state: s.location.state,
      history: created(submittedAt, 'Submitted for review'),
    }
  })
)

export const orders: Order[] = registerCollection(
  'orders',
  Array.from({ length: 140 }, (_, i) => {
    const b = buyers[i % buyers.length]!
    const s = sellers[(i * 3) % sellers.length]!
    const c = CATALOG[i % CATALOG.length]!
    const status = (['placed', 'confirmed', 'packed', 'shipped', 'shipped', 'delivered', 'delivered', 'delivered', 'cancelled', 'returned'] as const)[i % 10]!
    const method = (['UPI', 'UPI', 'Card', 'Net banking', 'COD', 'Wallet'] as const)[i % 6]!
    const qty = int(1, 40)
    const placedAt = ago(int(1, 30 * 24) * HOUR)
    const paymentStatus: Order['paymentStatus'] =
      status === 'cancelled' || status === 'returned'
        ? 'refunded'
        : method === 'COD'
          ? status === 'delivered' ? 'paid' : 'cod'
          : i % 23 === 0 ? 'failed' : i % 13 === 0 ? 'pending' : 'paid'
    return {
      id: `ORD-${50001 + i}`,
      buyerId: b.id,
      buyerName: fullName(b),
      sellerId: s.id,
      sellerName: fullName(s),
      itemSummary: `${c.name} × ${qty} ${c.unit}`,
      items: int(1, 4),
      amount: round(qty * int(c.price[0], c.price[1]) * (c.unit === 'quintal' ? 0.2 : 1), 10),
      paymentMethod: method,
      paymentStatus,
      status,
      placedAt,
      eta: new Date(new Date(placedAt).getTime() + int(2, 6) * DAY).toISOString(),
      district: b.location.district,
      state: b.location.state,
      history: [
        { at: placedAt, actor: fullName(b), action: 'Placed order' },
        ...(status !== 'placed' ? [{ at: new Date(new Date(placedAt).getTime() + 2 * HOUR).toISOString(), actor: fullName(s), action: 'Confirmed order' }] : []),
      ],
    }
  })
)

export const sellerProfiles: SellerProfile[] = registerCollection(
  'sellerProfiles',
  sellers.slice(0, 40).map((s, i) => {
    const joinedAt = s.joinedAt
    const fulfilment = Math.round((82 + rand() * 17.5) * 10) / 10
    const cancellation = Math.round((0.5 + rand() * 9) * 10) / 10
    return {
      id: `SLR-${3001 + i}`,
      userId: s.id,
      name: fullName(s),
      storeName: `${s.lastName} ${pick(['Agro', 'Farms', 'Krishi Kendra', 'Traders', 'Organics', 'FPO'])}`,
      tier: fulfilment > 97 ? 'gold' : fulfilment > 92 ? 'silver' : i % 6 === 0 ? 'new' : 'bronze',
      rating: Math.round((3.2 + rand() * 1.8) * 10) / 10,
      gmv30d: int(40, 1800) * 1000,
      orders30d: int(4, 320),
      fulfilmentRate: fulfilment,
      cancellationRate: cancellation,
      activeListings: int(2, 64),
      status: cancellation > 8 ? 'watchlist' : s.accountStatus === 'suspended' ? 'suspended' : i % 9 === 0 ? 'onboarding' : 'active',
      joinedAt,
      state: s.location.state,
      history: created(joinedAt, 'Seller store created'),
    }
  })
)

/* ───────────────────────── Services ───────────────────────── */

const MACHINES = [
  { name: 'Mahindra 575 DI XP Plus', type: 'Tractor', hp: 47 },
  { name: 'Swaraj 744 FE', type: 'Tractor', hp: 48 },
  { name: 'John Deere 5050D', type: 'Tractor', hp: 50 },
  { name: 'Sonalika DI 745 III', type: 'Tractor', hp: 50 },
  { name: 'Kartar 4000 Combine', type: 'Harvester', hp: 101 },
  { name: 'Preet 987 Combine', type: 'Harvester', hp: 110 },
  { name: 'Shaktiman Rotavator 7ft', type: 'Rotavator', hp: 45 },
  { name: 'Aspee Boom Sprayer', type: 'Sprayer', hp: 35 },
  { name: 'Fieldking Zero Till Drill', type: 'Seed drill', hp: 40 },
  { name: 'Dasmesh Multi-crop Thresher', type: 'Thresher', hp: 35 },
  { name: 'Kubota NSP-4W Transplanter', type: 'Transplanter', hp: 21 },
  { name: 'DJI Agras T30 Drone', type: 'Drone', hp: 0 },
]

export const machinery: Machinery[] = registerCollection(
  'machinery',
  Array.from({ length: 48 }, (_, i) => {
    const m = MACHINES[i % MACHINES.length]!
    const o = rentalOwners[i % rentalOwners.length]!
    const inspected = ago(int(10, 400) * DAY)
    return {
      id: `MCH-${7001 + i}`,
      name: m.name,
      machineType: m.type,
      ownerId: o.id,
      ownerName: fullName(o),
      regNo: m.type === 'Drone' ? `UIN-${int(10000, 99999)}` : `${o.location.state}-${int(10, 99)}-${pick(['AB', 'CK', 'TR', 'KL'])}-${int(1000, 9999)}`,
      year: int(2012, 2025),
      hp: m.hp,
      condition: (['excellent', 'good', 'good', 'fair', 'needs_service'] as const)[i % 5]!,
      lastInspection: inspected,
      insuranceExpiry: i % 8 === 0 ? ago(int(2, 40) * DAY) : ahead(int(20, 330) * DAY),
      status: (['verified', 'verified', 'verified', 'pending_inspection', 'suspended', 'verified', 'retired'] as const)[i % 7]!,
      district: o.location.district,
      state: o.location.state,
      history: created(inspected, 'Registered by owner'),
    }
  })
)

export const machineryRentals: MachineryRental[] = registerCollection(
  'machineryRentals',
  Array.from({ length: 44 }, (_, i) => {
    const m = MACHINES[(i * 5) % MACHINES.length]!
    const o = rentalOwners[(i * 3) % rentalOwners.length]!
    const rateType = m.type === 'Harvester' || m.type === 'Drone' ? 'per acre' : m.type === 'Tractor' ? 'per hour' : 'per day'
    const createdAt = ago(int(5, 200) * DAY)
    return {
      id: `RNT-${6001 + i}`,
      machineName: m.name,
      machineType: m.type,
      ownerId: o.id,
      ownerName: fullName(o),
      rateType,
      rate: rateType === 'per hour' ? int(7, 14) * 100 : rateType === 'per acre' ? int(9, 28) * 100 : int(15, 40) * 100,
      deposit: int(2, 20) * 1000,
      availability: (['available', 'booked', 'available', 'maintenance'] as const)[i % 4]!,
      bookings30d: int(0, 36),
      utilisation: int(8, 94),
      rating: Math.round((3.5 + rand() * 1.5) * 10) / 10,
      status: (['live', 'live', 'live', 'pending_review', 'paused', 'rejected'] as const)[i % 6]!,
      district: o.location.district,
      state: o.location.state,
      history: created(createdAt, 'Rental offer published'),
    }
  })
)

const LABOR_SKILLS = ['Sowing', 'Transplanting', 'Weeding', 'Spraying', 'Harvesting', 'Threshing', 'Loading', 'Pruning']

export const laborServices: LaborService[] = registerCollection(
  'laborServices',
  Array.from({ length: 38 }, (_, i) => {
    const l = labor[i % labor.length]!
    const createdAt = ago(int(5, 300) * DAY)
    return {
      id: `LAB-${8001 + i}`,
      leaderId: l.id,
      leaderName: fullName(l),
      crewSize: int(3, 28),
      skills: LABOR_SKILLS.filter((_, j) => (i + j) % 3 === 0).slice(0, 4),
      dailyWage: int(35, 80) * 10,
      rating: Math.round((3.4 + rand() * 1.6) * 10) / 10,
      jobsCompleted: int(0, 240),
      availability: (['available', 'engaged', 'available', 'off_season'] as const)[i % 4]!,
      status: (['active', 'active', 'active', 'pending_verification', 'suspended'] as const)[i % 5]!,
      district: l.location.district,
      state: l.location.state,
      history: created(createdAt),
    }
  })
)

export const driverServices: DriverService[] = registerCollection(
  'driverServices',
  Array.from({ length: 42 }, (_, i) => {
    const d = drivers[i % drivers.length]!
    const createdAt = ago(int(5, 300) * DAY)
    return {
      id: `DRV-${4001 + i}`,
      userId: d.id,
      name: fullName(d),
      licenseNo: `${d.location.state}${int(10, 99)}${int(2008, 2022)}${int(1000000, 9999999)}`,
      licenseExpiry: i % 9 === 0 ? ago(int(3, 60) * DAY) : ahead(int(60, 2400) * DAY),
      vehicleTypes: [['Tractor'], ['Tractor', 'Pickup'], ['Truck'], ['Pickup'], ['Truck', 'Tractor']][i % 5]!,
      experienceYears: int(1, 22),
      rating: Math.round((3.6 + rand() * 1.4) * 10) / 10,
      trips30d: int(0, 60),
      backgroundCheck: (['clear', 'clear', 'clear', 'pending', 'flagged'] as const)[i % 5]!,
      status: (['available', 'on_trip', 'available', 'offline', 'pending_verification', 'on_trip', 'suspended'] as const)[i % 7]!,
      district: d.location.district,
      state: d.location.state,
      history: created(createdAt),
    }
  })
)

const LOGI_NAMES = [
  'Kisan Freight Co.', 'Mandi Express Logistics', 'AgriMove Carriers', 'Deccan Cold Chain',
  'Punjab Roadlines', 'GreenRoute Transport', 'Sahyadri Haulers', 'Ganga Agro Movers',
  'Coastal Reefer Lines', 'Bharat Krishi Logistics', 'Vidarbha Transport Co.', 'Delta Farm Freight',
]

export const logisticsPartners: LogisticsPartner[] = registerCollection(
  'logisticsPartners',
  LOGI_NAMES.map((name, i) => {
    const createdAt = ago(int(60, 500) * DAY)
    return {
      id: `LOG-${9101 + i}`,
      name,
      fleetSize: int(6, 180),
      vehicleTypes: [['Truck', 'Mini truck'], ['Reefer', 'Truck'], ['Pickup', 'Mini truck'], ['Tanker', 'Truck']][i % 4]!,
      coverage: [['MH', 'KA', 'GJ'], ['PB', 'HR', 'UP', 'RJ'], ['TN', 'KL', 'AP'], ['WB', 'OR', 'BR', 'JH'], ['TS', 'AP', 'KA']][i % 5]!,
      onTimeRate: Math.round((78 + rand() * 21) * 10) / 10,
      activeShipments: int(0, 64),
      ratePerKm: int(22, 58),
      rating: Math.round((3.6 + rand() * 1.4) * 10) / 10,
      status: (['active', 'active', 'active', 'onboarding', 'suspended'] as const)[i % 5]!,
      contractEnd: ahead(int(-20, 400) * DAY),
      history: created(createdAt, 'Partner onboarded'),
    }
  })
)

export const warehouses: Warehouse[] = registerCollection(
  'warehouses',
  Array.from({ length: 30 }, (_, i) => {
    const o = warehouseOwners[i % warehouseOwners.length]!
    const type = (['Dry storage', 'Cold storage', 'Silo', 'Dry storage', 'Open yard'] as const)[i % 5]!
    const capacity = type === 'Silo' ? int(20, 60) * 100 : type === 'Cold storage' ? int(5, 30) * 100 : int(10, 80) * 100
    const occupied = Math.min(capacity, Math.round(capacity * (0.2 + rand() * 0.85)))
    const lastAudit = ago(int(10, 380) * DAY)
    return {
      id: `WH-${5101 + i}`,
      name: `${o.location.district} ${type === 'Cold storage' ? 'Cold Hub' : type === 'Silo' ? 'Grain Silo' : 'Agri Warehouse'} ${i + 1}`,
      ownerId: o.id,
      ownerName: fullName(o),
      storageType: type,
      capacityMt: capacity,
      occupiedMt: occupied,
      ratePerMtMonth: type === 'Cold storage' ? int(40, 90) * 10 : int(8, 25) * 10,
      wdraCertified: i % 3 !== 1,
      lastAudit,
      status: occupied >= capacity * 0.98 ? 'full' : (['active', 'active', 'pending_inspection', 'active', 'suspended'] as const)[i % 5]!,
      district: o.location.district,
      state: o.location.state,
      history: created(lastAudit, 'Warehouse listed'),
    }
  })
)

const SPECIALIZATIONS = [
  ['Agronomy', 'M.Sc. Agronomy'],
  ['Soil science', 'Ph.D. Soil Science'],
  ['Plant protection', 'M.Sc. Entomology'],
  ['Veterinary', 'B.V.Sc & A.H.'],
  ['Horticulture', 'M.Sc. Horticulture'],
  ['Irrigation', 'B.Tech Agri Engineering'],
  ['Organic farming', 'NPOF certified trainer'],
] as const

export const expertServices: ExpertService[] = registerCollection(
  'expertServices',
  Array.from({ length: 28 }, (_, i) => {
    const e = experts[i % experts.length]!
    const [spec, qual] = SPECIALIZATIONS[i % SPECIALIZATIONS.length]!
    const createdAt = ago(int(10, 400) * DAY)
    return {
      id: `EXP-${2101 + i}`,
      userId: e.id,
      name: `Dr. ${fullName(e)}`,
      specialization: spec,
      qualification: qual,
      languages: [['Hindi', 'English'], ['Marathi', 'Hindi'], ['Telugu', 'English'], ['Tamil', 'English'], ['Kannada', 'Hindi'], ['Punjabi', 'Hindi']][i % 6]!,
      fee: int(2, 12) * 100,
      consultations30d: int(0, 90),
      rating: Math.round((3.8 + rand() * 1.2) * 10) / 10,
      responseHours: int(1, 30),
      status: (['active', 'active', 'active', 'pending_verification', 'paused', 'suspended'] as const)[i % 6]!,
      state: e.location.state,
      history: created(createdAt, 'Expert profile created'),
    }
  })
)

const LABS = ['KVK Soil Lab, Baramati', 'ICAR-IISS Partner Lab', 'AgroTest Labs Nagpur', 'Krishi Vigyan Soil Unit', 'GreenSoil Diagnostics']
const CROPS = ['Wheat', 'Paddy', 'Cotton', 'Soybean', 'Sugarcane', 'Tomato', 'Onion', 'Chilli', 'Groundnut']

export const soilTests: SoilTest[] = registerCollection(
  'soilTests',
  Array.from({ length: 46 }, (_, i) => {
    const f = buyers[(i * 7) % buyers.length]!
    const status = (['requested', 'sample_collected', 'in_lab', 'in_lab', 'report_ready', 'delivered', 'delivered', 'cancelled'] as const)[i % 8]!
    const requestedAt = ago(int(1, 40) * DAY)
    return {
      id: `SOIL-${6601 + i}`,
      farmerId: f.id,
      farmerName: fullName(f),
      village: pick(['Kharadi', 'Rampur', 'Shivpur', 'Nandgaon', 'Kalyanpur', 'Devgad', 'Sonpur']),
      district: f.location.district,
      state: f.location.state,
      crop: CROPS[i % CROPS.length]!,
      labName: LABS[i % LABS.length]!,
      parameters: i % 3 === 0 ? ['N', 'P', 'K', 'pH', 'EC', 'OC', 'Zn', 'Fe', 'B'] : ['N', 'P', 'K', 'pH', 'EC', 'OC'],
      fee: i % 3 === 0 ? 650 : 350,
      requestedAt,
      collectedAt: status === 'requested' || status === 'cancelled' ? undefined : new Date(new Date(requestedAt).getTime() + DAY).toISOString(),
      tatDays: int(3, 12),
      assignedExpert: status === 'report_ready' || status === 'delivered' ? expertServices[i % expertServices.length]!.name : undefined,
      status,
      history: created(requestedAt, 'Test requested from app'),
    }
  })
)

/* ───────────────────────── Bookings & Operations ───────────────────────── */

const BOOKABLE: { type: Booking['serviceType']; names: string[]; amount: [number, number]; duration: string[] }[] = [
  { type: 'Machinery rental', names: MACHINES.map((m) => m.name), amount: [1200, 18000], duration: ['6 hrs', '1 day', '3 days', '12 acres'] },
  { type: 'Labor', names: ['Harvest crew (12)', 'Weeding crew (6)', 'Transplanting crew (15)'], amount: [2400, 16000], duration: ['1 day', '3 days', '5 days'] },
  { type: 'Driver', names: ['Tractor driver', 'Truck driver (10T)', 'Pickup driver'], amount: [800, 4500], duration: ['1 day', '2 days', 'Trip'] },
  { type: 'Warehouse', names: ['Cold storage — 20 MT', 'Dry storage — 50 MT', 'Silo — 100 MT'], amount: [6000, 60000], duration: ['1 month', '3 months', '6 months'] },
  { type: 'Expert', names: ['Crop advisory call', 'Field visit — pest scouting', 'Dairy herd check'], amount: [200, 1500], duration: ['30 min', '1 hr', 'Half day'] },
  { type: 'Soil testing', names: ['Standard NPK test', 'Advanced micronutrient test'], amount: [350, 650], duration: ['5 days', '7 days'] },
  { type: 'Logistics', names: ['Farm to mandi — 14 ft truck', 'Reefer — Nashik to Mumbai', 'Pickup — local'], amount: [1800, 28000], duration: ['Trip'] },
]

export const bookings: Booking[] = registerCollection(
  'bookings',
  Array.from({ length: 96 }, (_, i) => {
    const kind = BOOKABLE[i % BOOKABLE.length]!
    const c = buyers[(i * 3) % buyers.length]!
    const providerPool = kind.type === 'Machinery rental' ? rentalOwners : kind.type === 'Labor' ? labor : kind.type === 'Driver' ? drivers : kind.type === 'Warehouse' ? warehouseOwners : kind.type === 'Expert' ? experts : sellers
    const p = providerPool[(i * 5) % providerPool.length]!
    const status = (['requested', 'confirmed', 'confirmed', 'in_progress', 'completed', 'completed', 'completed', 'cancelled', 'no_show', 'disputed'] as const)[i % 10]!
    const createdAt = ago(int(1, 25) * DAY)
    const scheduledFor = status === 'completed' || status === 'cancelled' || status === 'no_show' || status === 'disputed' ? ago(int(1, 20) * DAY) : ahead(int(-1, 12) * DAY + int(0, 20) * HOUR)
    return {
      id: `BKG-${70001 + i}`,
      serviceType: kind.type,
      serviceName: kind.names[i % kind.names.length]!,
      customerId: c.id,
      customerName: fullName(c),
      providerName: fullName(p),
      scheduledFor,
      duration: kind.duration[i % kind.duration.length]!,
      amount: round(int(kind.amount[0], kind.amount[1]), 50),
      paymentStatus: status === 'cancelled' ? 'refunded' : status === 'requested' ? 'pending' : i % 7 === 0 ? 'partially_paid' : 'paid',
      status,
      district: c.location.district,
      state: c.location.state,
      createdAt,
      history: created(createdAt, 'Booked from app'),
    }
  })
)

const TOPICS = [
  'Yellowing leaves in paddy', 'Pink bollworm in cotton', 'Drip scheduling for onion', 'Soil report interpretation',
  'Lumpy skin symptoms in cattle', 'Fertilizer plan for wheat', 'Organic certification process', 'Fruit drop in mango',
]

export const appointments: Appointment[] = registerCollection(
  'appointments',
  Array.from({ length: 52 }, (_, i) => {
    const e = expertServices[i % expertServices.length]!
    const f = buyers[(i * 11) % buyers.length]!
    const status = (['scheduled', 'scheduled', 'completed', 'completed', 'cancelled', 'missed', 'rescheduled'] as const)[i % 7]!
    const scheduledAt = status === 'scheduled' || status === 'rescheduled' ? ahead(int(1, 200) * HOUR) : ago(int(2, 400) * HOUR)
    return {
      id: `APT-${31001 + i}`,
      expertName: e.name,
      farmerId: f.id,
      farmerName: fullName(f),
      topic: TOPICS[i % TOPICS.length]!,
      mode: (['video', 'phone', 'field_visit', 'video'] as const)[i % 4]!,
      scheduledAt,
      durationMin: [30, 45, 60, 120][i % 4]!,
      fee: e.fee,
      language: e.languages[0]!,
      status,
      history: created(ago(int(1, 10) * DAY), 'Appointment requested'),
    }
  })
)

const CITIES: { name: string; x: number; y: number }[] = [
  { name: 'Nashik', x: 20.0, y: 58.6 },
  { name: 'Mumbai APMC', x: 16.8, y: 61.8 },
  { name: 'Pune', x: 20.2, y: 63.7 },
  { name: 'Nagpur', x: 38.2, y: 54.7 },
  { name: 'Indore', x: 27.1, y: 49.2 },
  { name: 'Ahmedabad', x: 15.8, y: 48.2 },
  { name: 'Jaipur', x: 26.9, y: 34.8 },
  { name: 'Delhi Azadpur', x: 31.7, y: 28.6 },
  { name: 'Ludhiana', x: 27.1, y: 21.0 },
  { name: 'Lucknow', x: 44.7, y: 35.0 },
  { name: 'Patna', x: 59.1, y: 39.3 },
  { name: 'Kolkata', x: 70.2, y: 49.8 },
  { name: 'Hyderabad', x: 36.1, y: 67.6 },
  { name: 'Guntur', x: 42.9, y: 71.4 },
  { name: 'Bengaluru', x: 33.1, y: 82.9 },
  { name: 'Chennai', x: 42.3, y: 82.5 },
  { name: 'Coimbatore', x: 30.9, y: 89.7 },
  { name: 'Kochi', x: 28.5, y: 93.3 },
]
const CARRIERS = ['Kisan Freight Co.', 'Mandi Express Logistics', 'AgriMove Carriers', 'Deccan Cold Chain', 'CropVibe Fleet']

export const deliveries: Delivery[] = registerCollection(
  'deliveries',
  Array.from({ length: 64 }, (_, i) => {
    const o = orders[i % orders.length]!
    const from = CITIES[i % CITIES.length]!
    const to = CITIES[(i * 7 + 3) % CITIES.length]!
    const d = drivers[(i * 3) % drivers.length]!
    const status = (['awaiting_pickup', 'in_transit', 'in_transit', 'in_transit', 'out_for_delivery', 'delivered', 'delivered', 'delayed', 'failed', 'returned'] as const)[i % 10]!
    const progress = status === 'awaiting_pickup' ? 0 : status === 'delivered' || status === 'returned' ? 100 : status === 'out_for_delivery' ? int(85, 97) : status === 'failed' ? int(88, 99) : int(12, 80)
    // 1 map unit ≈ 0.29° ≈ 32 km, plus a road-winding allowance
    const dist = Math.round(Math.hypot(to.x - from.x, to.y - from.y) * 32 * 1.2) + 20
    const pickedUpAt = status === 'awaiting_pickup' ? undefined : ago(int(4, 70) * HOUR)
    return {
      id: `DLV-${88001 + i}`,
      orderId: o.id,
      carrier: CARRIERS[i % CARRIERS.length]!,
      driverName: fullName(d),
      vehicleNo: `${d.location.state}-${int(10, 49)}-${pick(['T', 'G', 'AB', 'MK'])}-${int(1000, 9999)}`,
      origin: from.name,
      destination: to.name,
      distanceKm: dist,
      weightKg: int(2, 90) * 100,
      pickedUpAt,
      eta: status === 'delayed' ? ago(int(2, 20) * HOUR) : ahead(int(2, 60) * HOUR),
      progress,
      podCaptured: status === 'delivered',
      status,
      lastPing: ago(int(1, status === 'delayed' ? 240 : 25) * 60000),
      from: { x: from.x, y: from.y },
      to: { x: to.x, y: to.y },
      history: created(pickedUpAt ?? ago(2 * HOUR), 'Shipment created'),
    }
  })
)

export const agreements: Agreement[] = registerCollection(
  'agreements',
  Array.from({ length: 40 }, (_, i) => {
    const type = (['Machinery rental', 'Warehouse lease', 'Labor contract', 'Logistics contract', 'Contract farming'] as const)[i % 5]!
    const a = type === 'Warehouse lease' ? warehouseOwners[i % warehouseOwners.length]! : type === 'Machinery rental' ? rentalOwners[i % rentalOwners.length]! : type === 'Labor contract' ? labor[i % labor.length]! : sellers[i % sellers.length]!
    const b = buyers[(i * 9) % buyers.length]!
    const status = (['active', 'active', 'pending_signature', 'draft', 'expiring', 'expired', 'terminated', 'active'] as const)[i % 8]!
    const start = status === 'draft' || status === 'pending_signature' ? ahead(int(2, 20) * DAY) : ago(int(30, 300) * DAY)
    const end =
      status === 'expiring' ? ahead(int(3, 25) * DAY) : status === 'expired' ? ago(int(2, 60) * DAY) : ahead(int(40, 360) * DAY)
    return {
      id: `AGR-${4401 + i}`,
      agreementType: type,
      partyA: type === 'Logistics contract' ? LOGI_NAMES[i % LOGI_NAMES.length]! : fullName(a),
      partyB: type === 'Contract farming' ? pick(['Nashik FPO', 'Sahyadri Farms', 'Ruchi Agro Buyers', 'ITC e-Choupal']) : fullName(b),
      startDate: start,
      endDate: end,
      value: round(int(15, 900) * 1000, 1000),
      version: int(1, 4),
      signedByA: status !== 'draft',
      signedByB: status !== 'draft' && status !== 'pending_signature',
      status,
      history: created(ago(int(31, 320) * DAY), 'Agreement drafted from template'),
    }
  })
)

/* ───────────────────────── Finance ───────────────────────── */

const GATEWAYS = ['Razorpay', 'PayU', 'Cashfree'] as const

export const payments: Payment[] = registerCollection(
  'payments',
  Array.from({ length: 150 }, (_, i) => {
    const o = orders[i % orders.length]!
    const status = (['captured', 'captured', 'captured', 'captured', 'captured', 'authorized', 'pending', 'failed', 'refunded'] as const)[i % 9]!
    const method = (['UPI', 'UPI', 'UPI', 'Card', 'Net banking', 'Wallet'] as const)[i % 6]!
    const createdAt = ago(int(1, 45 * 24) * HOUR)
    const amount = i < orders.length ? o.amount : round(int(300, 90000), 10)
    return {
      id: `PYT-${3301 + i}`,
      reference: i % 4 === 3 ? bookings[i % bookings.length]!.id : o.id,
      payerId: o.buyerId,
      payerName: o.buyerName,
      amount,
      fee: Math.round(amount * (method === 'UPI' ? 0 : method === 'Card' ? 0.019 : 0.012)),
      method,
      gateway: GATEWAYS[i % 3]!,
      gatewayRef: `${pick(['pay_', 'txn_', 'cf_'])}${Math.floor(rand() * 1e12).toString(36)}`,
      status,
      createdAt,
      failureReason: status === 'failed' ? pick(['Bank declined', 'UPI timeout', 'Insufficient funds', 'OTP not entered']) : undefined,
      history: created(createdAt, `Initiated via ${method}`),
    }
  })
)

const REFUND_REASONS = ['Order cancelled by seller', 'Quality mismatch', 'Short quantity delivered', 'Duplicate payment', 'Booking cancelled — provider no-show', 'Damaged in transit']

export const refunds: Refund[] = registerCollection(
  'refunds',
  Array.from({ length: 44 }, (_, i) => {
    const p = payments[(i * 3) % payments.length]!
    const status = (['requested', 'requested', 'approved', 'processing', 'completed', 'completed', 'rejected'] as const)[i % 7]!
    const requestedAt = ago(int(2, 20 * 24) * HOUR)
    return {
      id: `RFD-${1100 + i}`,
      paymentId: p.id,
      orderId: p.reference,
      customerId: p.payerId,
      customerName: p.payerName,
      amount: Math.min(p.amount, round(p.amount * (i % 3 === 0 ? 1 : 0.2 + rand() * 0.6), 10)),
      reason: REFUND_REASONS[i % REFUND_REASONS.length]!,
      destination: i % 4 === 0 ? 'CropVibe wallet' : 'Original source',
      requestedAt,
      approvedBy: status === 'requested' || status === 'rejected' ? undefined : pick(['Neha Gupta', 'Raj Kumar']),
      status,
      history: created(requestedAt, 'Refund requested'),
    }
  })
)

export const settlements: Settlement[] = registerCollection(
  'settlements',
  Array.from({ length: 30 }, (_, i) => {
    const gateway = GATEWAYS[i % 3]!
    const dayOffset = Math.floor(i / 3)
    const end = new Date(Date.now() - dayOffset * DAY)
    end.setHours(23, 59, 0, 0)
    const start = new Date(end.getTime() - DAY + 60000)
    const gross = int(8, 60) * 25000
    const fees = Math.round(gross * 0.014)
    const tax = Math.round(fees * 0.18)
    const net = gross - fees - tax
    const status: Settlement['status'] = dayOffset === 0 ? 'scheduled' : i % 7 === 4 ? 'mismatch' : dayOffset > 3 ? 'reconciled' : 'settled'
    return {
      id: `STL-${gateway.slice(0, 2).toUpperCase()}-${240900 + i}`,
      gateway,
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
      txnCount: int(40, 420),
      gross,
      fees,
      tax,
      net: status === 'mismatch' ? net - int(3, 40) * 100 : net,
      expected: net,
      utr: status === 'scheduled' ? undefined : `UTR${int(100000000, 999999999)}`,
      settledAt: status === 'scheduled' ? undefined : new Date(end.getTime() + DAY + 10 * HOUR).toISOString(),
      status,
      history: created(end.toISOString(), 'Settlement batch generated'),
    }
  })
)

export const payouts: Payout[] = registerCollection(
  'payouts',
  Array.from({ length: 58 }, (_, i) => {
    const pool = [sellers, rentalOwners, labor, drivers, warehouseOwners, experts][i % 6]!
    const roleLabel = ['Seller', 'Rental owner', 'Labor', 'Driver', 'Warehouse owner', 'Expert'][i % 6]!
    const u = pool[(i * 3) % pool.length]!
    const status = (['scheduled', 'pending_approval', 'pending_approval', 'processing', 'paid', 'paid', 'paid', 'failed', 'on_hold'] as const)[i % 9]!
    const scheduledFor = status === 'paid' ? ago(int(1, 30) * DAY) : ahead(int(0, 5) * DAY)
    return {
      id: `PO-${55001 + i}`,
      beneficiaryId: u.id,
      beneficiaryName: fullName(u),
      beneficiaryRole: roleLabel,
      amount: round(int(1500, 240000), 10),
      orders: int(1, 48),
      bankMasked: `XXXX XXXX ${int(1000, 9999)}`,
      ifsc: `${pick(['SBIN', 'HDFC', 'ICIC', 'PUNB', 'UBIN', 'BKID'])}000${int(1000, 9999)}`,
      cycle: `W${36 - Math.floor(i / 12)} · Sep 2026`,
      scheduledFor,
      holdReason: status === 'on_hold' ? pick(['KYC expired', 'Open dispute on order', 'Bank account name mismatch']) : undefined,
      status,
      history: created(ago(int(1, 8) * DAY), 'Payout computed for cycle'),
    }
  })
)

export const invoices: Invoice[] = registerCollection(
  'invoices',
  Array.from({ length: 70 }, (_, i) => {
    const pool = [sellers, rentalOwners, warehouseOwners, experts][i % 4]!
    const u = pool[(i * 7) % pool.length]!
    const type = (['Commission', 'Commission', 'Subscription', 'Service fee', 'Logistics', 'Advertising'] as const)[i % 6]!
    const amount = round(int(400, 60000), 10)
    const gst = Math.round(amount * 0.18)
    const issuedAt = ago(int(1, 90) * DAY)
    const due = new Date(new Date(issuedAt).getTime() + 15 * DAY)
    const status = (['issued', 'paid', 'paid', 'paid', 'overdue', 'draft', 'void'] as const)[i % 7]!
    return {
      id: `INV-2026-${String(4101 + i).padStart(5, '0')}`,
      billedTo: fullName(u),
      billedToId: u.id,
      invoiceType: type,
      amount,
      gst,
      total: amount + gst,
      issuedAt,
      dueAt: status === 'overdue' ? ago(int(2, 30) * DAY) : due.toISOString(),
      status,
      history: created(issuedAt, 'Invoice generated'),
    }
  })
)

export const financialDisputes: FinancialDispute[] = registerCollection(
  'financialDisputes',
  Array.from({ length: 22 }, (_, i) => {
    const p = payments[(i * 5 + 2) % payments.length]!
    const status = (['open', 'open', 'evidence_submitted', 'won', 'lost', 'accepted'] as const)[i % 6]!
    const raisedAt = ago(int(1, 40) * DAY)
    return {
      id: `FDP-${7701 + i}`,
      paymentId: p.id,
      customerName: p.payerName,
      amount: p.amount,
      disputeType: (['Chargeback', 'Duplicate charge', 'Payment not received', 'Settlement shortfall', 'Payout failed'] as const)[i % 5]!,
      gateway: p.gateway,
      raisedAt,
      respondBy: status === 'open' ? ahead(int(-1, 7) * DAY + int(1, 20) * HOUR) : new Date(new Date(raisedAt).getTime() + 7 * DAY).toISOString(),
      evidence: status === 'open' ? int(0, 1) : int(2, 6),
      status,
      history: created(raisedAt, `Raised via ${p.gateway}`),
    }
  })
)

const STREAMS: [string, number][] = [
  ['Marketplace commission', 0.035],
  ['Rental commission', 0.08],
  ['Logistics fee', 0.1],
  ['Warehouse commission', 0.06],
  ['Expert consult fee', 0.15],
  ['Soil test fee', 0.2],
  ['Subscriptions', 1],
  ['Promoted listings', 1],
]

export const revenueEntries: RevenueEntry[] = registerCollection(
  'revenueEntries',
  Array.from({ length: 160 }, (_, i) => {
    const [stream, rate] = STREAMS[i % STREAMS.length]!
    const gross = rate === 1 ? int(4, 60) * 100 : round(int(2000, 120000), 10)
    const date = ago(int(0, 90) * DAY + int(0, 23) * HOUR)
    const counterparty = users[(i * 13) % users.length]!
    return {
      id: `REV-${120001 + i}`,
      stream,
      reference: rate === 1 ? `SUB-${int(1000, 9999)}` : i % 3 === 0 ? bookings[i % bookings.length]!.id : orders[i % orders.length]!.id,
      counterparty: fullName(counterparty),
      gross,
      amount: rate === 1 ? gross : Math.round(gross * rate),
      date,
      status: i % 19 === 0 ? 'reversed' : i % 11 === 0 ? 'deferred' : 'recognized',
      history: created(date, 'Posted to revenue ledger'),
    }
  })
)

/* ───────────────────────── Trust, support, platform ───────────────────────── */

const MOD_ITEMS: { type: ModerationReport['contentType']; content: string; reason: string }[] = [
  { type: 'listing', content: '“100% organic basmati, cheapest in India, call 98XXXXXX12 directly”', reason: 'Off-platform contact' },
  { type: 'review', content: '“Worst seller, total fraud, these people are thieves…”', reason: 'Abusive language' },
  { type: 'listing', content: 'Glyphosate 71% SG — no CIB registration shown', reason: 'Restricted product' },
  { type: 'image', content: 'tractor_front_damage.jpg reused across 4 rental listings', reason: 'Misleading images' },
  { type: 'profile', content: 'Store name impersonates “IFFCO Official”', reason: 'Impersonation' },
  { type: 'message', content: 'Buyer asked to pay advance via personal UPI', reason: 'Payment fraud attempt' },
  { type: 'listing', content: 'Hybrid tomato seeds priced at ₹5 / packet (MRP ₹450)', reason: 'Misleading price' },
  { type: 'review', content: 'Five 5-star reviews from same device in 10 minutes', reason: 'Fake reviews' },
]

export const moderationReports: ModerationReport[] = registerCollection(
  'moderationReports',
  Array.from({ length: 40 }, (_, i) => {
    const item = MOD_ITEMS[i % MOD_ITEMS.length]!
    const reported = users[(i * 9 + 4) % users.length]!
    const reporter = users[(i * 5 + 1) % users.length]!
    const status = (['open', 'open', 'open', 'escalated', 'removed', 'dismissed', 'warned'] as const)[i % 7]!
    const aiScore = Math.round((0.35 + rand() * 0.64) * 100) / 100
    const createdAt = ago(int(1, 160) * HOUR)
    return {
      id: `MOD-${6101 + i}`,
      contentType: item.type,
      content: item.content,
      reportedUserId: reported.id,
      reportedUserName: fullName(reported),
      reporterName: i % 4 === 0 ? 'Auto-detection' : fullName(reporter),
      reason: item.reason,
      reports: int(1, 14),
      aiScore,
      severity: aiScore > 0.85 ? 'high' : aiScore > 0.6 ? 'medium' : 'low',
      createdAt,
      status,
      history: created(createdAt, i % 4 === 0 ? 'Flagged by trust model' : 'Reported by user'),
    }
  })
)

const TICKET_SUBJECTS: [SupportTicket['category'], string, string][] = [
  ['Payments', 'Money debited but order not placed', 'I paid ₹4,850 through UPI but the order shows payment pending. Please check.'],
  ['Orders', 'Received 2 bags less than ordered', 'Ordered 20 bags DAP, received only 18. Seller not responding.'],
  ['KYC', 'KYC rejected, name spelling different on PAN', 'My PAN has “Mohd.” and Aadhaar has “Mohammed”. What should I upload?'],
  ['Bookings', 'Tractor owner did not come on booked date', 'Booked rotavator for 6 hrs on Monday, owner did not arrive. Need refund.'],
  ['Account', 'Cannot login — OTP not coming', 'OTP is not received on my Jio number since yesterday.'],
  ['Technical', 'App crashes when uploading crop photos', 'App closes when I add more than 3 photos to my listing.'],
  ['Payments', 'Payout not received for last week', 'My payout for week 35 is still not credited to my SBI account.'],
  ['Other', 'How to become a verified expert?', 'I am an agronomist with 12 years experience. How do I list my services?'],
]

export const supportTickets: SupportTicket[] = registerCollection(
  'supportTickets',
  Array.from({ length: 64 }, (_, i) => {
    const [category, subject, body] = TICKET_SUBJECTS[i % TICKET_SUBJECTS.length]!
    const u = users[(i * 7 + 3) % users.length]!
    const status = (['open', 'open', 'in_progress', 'in_progress', 'pending_user', 'resolved', 'resolved', 'closed'] as const)[i % 8]!
    const priority = (['medium', 'high', 'low', 'urgent', 'medium', 'medium', 'low', 'high'] as const)[i % 8]!
    const createdAt = ago(int(1, 200) * HOUR)
    const slaHours = priority === 'urgent' ? 4 : priority === 'high' ? 12 : priority === 'medium' ? 24 : 72
    const assignee = status === 'open' && i % 3 === 0 ? undefined : pick(['Arjun Mehta', 'Maya Singh', 'Priya Nair (L2)'])
    return {
      id: `TKT-${24001 + i}`,
      subject,
      requesterId: u.id,
      requesterName: fullName(u),
      requesterRole: u.roles[0] ?? 'buyer',
      channel: (['App', 'WhatsApp', 'Phone', 'Email', 'WhatsApp'] as const)[i % 5]!,
      category,
      priority,
      language: ['Hindi', 'Marathi', 'Telugu', 'English', 'Kannada', 'Tamil'][i % 6]!,
      assignee,
      createdAt,
      updatedAt: ago(int(0, 20) * HOUR),
      slaDueAt: new Date(new Date(createdAt).getTime() + slaHours * HOUR).toISOString(),
      csat: status === 'closed' || status === 'resolved' ? int(2, 5) : undefined,
      messages: [
        { id: `m-${i}-1`, from: 'user', author: fullName(u), body, at: createdAt },
        ...(assignee
          ? [{ id: `m-${i}-2`, from: 'agent' as const, author: assignee, body: 'Thank you for reaching out. I am checking this with the concerned team and will update you shortly.', at: new Date(new Date(createdAt).getTime() + 40 * 60000).toISOString() }]
          : []),
        ...(status === 'in_progress'
          ? [{ id: `m-${i}-3`, from: 'internal' as const, author: assignee ?? 'Maya Singh', body: 'Checked gateway logs — payment captured, order webhook failed. Raised with engineering.', at: ago(3 * HOUR) }]
          : []),
      ],
      status,
      history: created(createdAt, 'Ticket created'),
    }
  })
)

const ALERT_SEEDS: Omit<PlatformAlert, 'id' | 'createdAt' | 'status' | 'history'>[] = [
  { title: 'Payment success rate dropped to 91.2%', description: 'UPI success on PayU fell below the 95% threshold for 15 minutes.', category: 'Finance', severity: 'critical', source: 'Payments monitor', href: '/finance/payments' },
  { title: '12 KYC applications breached 48h SLA', description: 'Oldest application has been waiting 61 hours.', category: 'SLA', severity: 'high', source: 'KYC queue', href: '/kyc?status=pending' },
  { title: 'Unusual refund velocity for one buyer', description: '6 refund requests from the same device in 24 hours.', category: 'Fraud', severity: 'high', source: 'Trust model', href: '/finance/refunds' },
  { title: 'Settlement mismatch — Razorpay', description: 'Net settled is ₹3,400 less than expected for yesterday’s batch.', category: 'Finance', severity: 'medium', source: 'Reconciliation', href: '/finance/settlements' },
  { title: 'API p95 latency above 800ms', description: 'Search service p95 at 912ms in ap-south-1.', category: 'System', severity: 'medium', source: 'Observability', href: '/performance' },
  { title: '5 deliveries delayed on Nashik → Mumbai lane', description: 'Heavy rain advisory on NH-160.', category: 'Operations', severity: 'medium', source: 'Tracking', href: '/operations/deliveries' },
  { title: 'Machinery insurance expired for 6 listings', description: 'Listings remain live while insurance is expired.', category: 'Compliance', severity: 'high', source: 'Compliance rules', href: '/services/machinery' },
  { title: 'Chargeback response due in 18 hours', description: 'Evidence not yet submitted for FDP-7701.', category: 'Finance', severity: 'high', source: 'Disputes', href: '/finance/disputes' },
  { title: 'SMS OTP delivery degraded on Jio', description: 'MSG91 delivery at 84% for Jio numbers — failover to WhatsApp OTP enabled.', category: 'System', severity: 'medium', source: 'Messaging', href: '/settings/integrations' },
  { title: 'Price anomaly on onion listings', description: '14 listings priced 40% below Lasalgaon mandi average.', category: 'Fraud', severity: 'low', source: 'Pricing model', href: '/marketplace/approvals' },
  { title: 'Warehouse WH-5104 at 98% occupancy', description: 'New storage bookings will be rejected automatically.', category: 'Operations', severity: 'low', source: 'Capacity rules', href: '/services/warehouses' },
  { title: 'Driver licence expired — still accepting trips', description: '3 drivers with expired licences completed trips this week.', category: 'Compliance', severity: 'critical', source: 'Compliance rules', href: '/services/drivers' },
]

export const alerts: PlatformAlert[] = registerCollection(
  'alerts',
  ALERT_SEEDS.concat(ALERT_SEEDS.slice(3, 9)).map((a, i) => {
    const createdAt = ago(int(5, 60 * (i + 1)) * 60000)
    return {
      ...a,
      id: `ALT-${5501 + i}`,
      createdAt,
      owner: i % 3 === 0 ? undefined : pick(['Maya Singh', 'Neha Gupta', 'Raj Kumar']),
      status: i < 7 ? (i % 3 === 2 ? 'acknowledged' : 'open') : (['resolved', 'snoozed', 'resolved', 'acknowledged'] as const)[i % 4]!,
      history: created(createdAt, `Raised by ${a.source}`),
    }
  })
)

export const reportDefinitions: ReportDefinition[] = registerCollection(
  'reportDefinitions',
  [
    ['Daily GMV & orders', 'Marketplace', 'Daily', 'XLSX', ['leadership@cropvibe.com']],
    ['Seller payout register', 'Finance', 'Weekly', 'CSV', ['finance@cropvibe.com']],
    ['GST output tax (GSTR-1)', 'Finance', 'Monthly', 'XLSX', ['finance@cropvibe.com', 'ca@partner.in']],
    ['KYC turnaround & SLA', 'Users', 'Weekly', 'PDF', ['ops@cropvibe.com']],
    ['Rental utilisation by district', 'Services', 'Weekly', 'XLSX', ['ops@cropvibe.com']],
    ['Delivery SLA by carrier', 'Operations', 'Daily', 'CSV', ['logistics@cropvibe.com']],
    ['Dispute outcomes', 'Trust & Safety', 'Monthly', 'PDF', ['trust@cropvibe.com']],
    ['Support CSAT & backlog', 'Support', 'Weekly', 'PDF', ['support@cropvibe.com']],
    ['Settlement reconciliation', 'Finance', 'Daily', 'CSV', ['finance@cropvibe.com']],
    ['New user acquisition by channel', 'Growth', 'Weekly', 'XLSX', ['growth@cropvibe.com']],
    ['Soil test turnaround', 'Services', 'Monthly', 'PDF', ['agronomy@cropvibe.com']],
    ['Audit log export', 'Compliance', 'On demand', 'CSV', ['auditor@cropvibe.com']],
  ].map(([name, area, frequency, format, recipients], i) => {
    const lastRunAt = ago(int(1, 30) * HOUR)
    return {
      id: `RPT-${301 + i}`,
      name: name as string,
      area: area as string,
      frequency: frequency as ReportDefinition['frequency'],
      format: format as ReportDefinition['format'],
      recipients: recipients as string[],
      owner: pick(['Raj Kumar', 'Neha Gupta', 'Maya Singh']),
      lastRunAt,
      nextRunAt: frequency === 'On demand' ? undefined : ahead(int(1, 160) * HOUR),
      lastRows: int(40, 18000),
      status: i === 5 ? 'failed' : i === 10 ? 'paused' : 'active',
      history: created(ago(int(40, 200) * DAY), 'Report scheduled'),
    }
  })
)

export const integrations: Integration[] = registerCollection(
  'integrations',
  (
    [
      ['Razorpay payments', 'Payments', 'Razorpay', 'REST', 'BOTH', 'https://api.razorpay.com/v1', undefined, undefined, undefined, 'TLS 1.3', 'active', 99.4],
      ['PayU payments', 'Payments', 'PayU', 'REST', 'BOTH', 'https://info.payu.in/merchant', undefined, undefined, undefined, 'TLS 1.3', 'degraded', 91.2],
      ['Cashfree payouts', 'Payments', 'Cashfree', 'REST', 'OUTBOUND', 'https://payout-api.cashfree.com', undefined, undefined, undefined, 'TLS 1.3', 'active', 99.1],
      ['DHL EDI invoices', 'Logistics', 'DHL', 'SFTP', 'INBOUND', 'ftp://edi.dhl-logistics.com', 22, 'cropvibe_edi', 'DHL_Invoice_*.xml', 'AES-256', 'active', 98.7],
      ['Delhivery shipments', 'Logistics', 'Delhivery', 'Webhook', 'INBOUND', 'https://track.delhivery.com/api', undefined, undefined, undefined, 'TLS 1.3', 'active', 97.9],
      ['MSG91 SMS & OTP', 'Messaging', 'MSG91', 'REST', 'OUTBOUND', 'https://control.msg91.com/api/v5', undefined, undefined, undefined, 'TLS 1.3', 'degraded', 84.3],
      ['WhatsApp Business', 'Messaging', 'Meta', 'Webhook', 'BOTH', 'https://graph.facebook.com/v19.0', undefined, undefined, undefined, 'TLS 1.3', 'active', 99.6],
      ['DigiLocker KYC', 'Identity', 'MeitY DigiLocker', 'REST', 'INBOUND', 'https://api.digitallocker.gov.in', undefined, undefined, undefined, 'TLS 1.3', 'active', 98.2],
      ['Tally accounting export', 'Accounting', 'Tally', 'SFTP', 'OUTBOUND', 'ftp://sftp.cropvibe-finance.in', 22, 'tally_sync', 'CV_Ledger_*.csv', 'PGP', 'paused', 100],
      ['Google Maps Platform', 'Maps', 'Google', 'REST', 'OUTBOUND', 'https://maps.googleapis.com', undefined, undefined, undefined, 'TLS 1.3', 'active', 99.9],
    ] as const
  ).map(([name, category, partner, protocol, direction, endpoint, port, username, filePattern, encryption, status, successRate], i) => {
    const createdAt = ago(int(90, 600) * DAY)
    return {
      id: `INT-${101 + i}`,
      name,
      category,
      partner,
      protocol,
      direction,
      endpoint,
      port,
      username,
      filePattern,
      encryption,
      certificateExpiry: protocol === 'SFTP' ? ahead(int(10, 300) * DAY) : undefined,
      lastSyncAt: ago(int(1, status === 'paused' ? 4000 : 90) * 60000),
      successRate,
      createdAt,
      updatedAt: ago(int(1, 40) * DAY),
      status,
      history: created(createdAt, 'Connection configured'),
    } satisfies Integration
  })
)

// Admins share objects with the auth seed so role changes and deactivations apply everywhere
adminUsers.forEach((a, i) => {
  a.mfa = i !== 3
  a.history = [{ at: a.createdAt, actor: 'System', action: 'Invited to console' }]
})
export const adminRecords = registerCollection('admins', adminUsers)

/* ───────────────────────── Seed audit log ───────────────────────── */

const AUDIT_SEEDS: [string, string, Parameters<typeof recordAudit>[0]['module'], string, string, string, 'info' | 'warning' | 'critical'][] = [
  ['Raj Kumar', 'Super Admin', 'kyc', 'KYC application', 'kyc-3', 'Approved KYC', 'info'],
  ['Maya Singh', 'Ops Admin', 'marketplace', 'Listing approval', 'LA-2004', 'Approved listing', 'info'],
  ['Neha Gupta', 'Finance Admin', 'finance', 'Payout', 'PO-55006', 'Approved payout batch', 'warning'],
  ['Arjun Mehta', 'Support Agent', 'support', 'Support ticket', 'TKT-24003', 'Resolved ticket', 'info'],
  ['Maya Singh', 'Ops Admin', 'users', 'User', 'user-9', 'Suspended user until 30 Sep', 'warning'],
  ['Raj Kumar', 'Super Admin', 'settings', 'Platform settings', 'commission', 'Changed rental commission 7% → 8%', 'critical'],
  ['Neha Gupta', 'Finance Admin', 'finance', 'Refund', 'RFD-1104', 'Approved refund ₹2,400', 'info'],
  ['Maya Singh', 'Ops Admin', 'trust', 'Moderation report', 'MOD-6105', 'Removed content', 'warning'],
  ['Raj Kumar', 'Super Admin', 'roles', 'Admin', 'admin-5', 'Granted Auditor role', 'critical'],
  ['Maya Singh', 'Ops Admin', 'services', 'Machinery', 'MCH-7004', 'Suspended machinery — insurance expired', 'warning'],
  ['Neha Gupta', 'Finance Admin', 'finance', 'Settlement', 'STL-RA-240912', 'Marked settlement reconciled', 'info'],
  ['Arjun Mehta', 'Support Agent', 'trust', 'Dispute', 'D-1043', 'Escalated dispute to L2', 'warning'],
  ['Raj Kumar', 'Super Admin', 'settings', 'Integration', 'INT-109', 'Paused Tally accounting export', 'warning'],
  ['Maya Singh', 'Ops Admin', 'operations', 'Delivery', 'DLV-88008', 'Reassigned carrier', 'info'],
  ['Suresh Iyer', 'Auditor', 'reports', 'Report', 'RPT-312', 'Exported audit log', 'info'],
]

AUDIT_SEEDS.forEach(([actor, actorRole, module, entity, entityId, action, severity], i) => {
  recordAudit({
    actor,
    actorRole,
    module,
    entity,
    entityId,
    action,
    severity,
    at: ago((AUDIT_SEEDS.length - i) * int(40, 180) * 60000),
    ip: `10.24.${int(1, 9)}.${int(10, 200)}`,
  })
})

registerCollection('users', users)
registerCollection('listings', listings)
registerCollection('transactions', transactions)
registerCollection('subscriptions', subscriptions)
registerCollection('disputes', disputes)
registerCollection('contentItems', contentItems)
registerCollection('kyc', kycApplications)
auditLog.sort((a, b) => b.at.localeCompare(a.at))
hydrateAuditLog()
