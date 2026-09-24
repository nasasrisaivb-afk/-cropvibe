import {
  AlertTriangle,
  BadgeCheck,
  CalendarClock,
  ClipboardCheck,
  FlaskConical,
  FileCheck2,
  Gauge,
  GraduationCap,
  HardHat,
  IndianRupee,
  PackageCheck,
  Route,
  ShieldCheck,
  Star,
  Tractor,
  Truck,
  UserCheck,
  Users,
  Warehouse as WarehouseIcon,
  Wrench,
} from 'lucide-react'
import type {
  DriverService,
  ExpertService,
  LaborService,
  LogisticsPartner,
  Machinery,
  MachineryRental,
  SoilTest,
  Warehouse,
} from '@/lib/types/ops'
import type { ResourceConfig, StatusDef } from './types'
import { approve, avg, count, location, optionsFilter, pct, reactivate, reject, s, stateFilter, sum, suspend, transition } from './helpers'
import { formatInrCompact, relativeDue } from '@/lib/utils'

const isPast = (iso: string) => new Date(iso).getTime() < Date.now()

/* ───────── Machinery ───────── */

const MACHINE_STATUS: Record<Machinery['status'], StatusDef> = {
  verified: s('Verified', 'success'),
  pending_inspection: s('Pending inspection', 'pending'),
  suspended: s('Suspended', 'error'),
  retired: s('Retired', 'default'),
}

const CONDITION: Record<Machinery['condition'], StatusDef> = {
  excellent: s('Excellent', 'success'),
  good: s('Good', 'accent'),
  fair: s('Fair', 'warning'),
  needs_service: s('Needs service', 'error'),
}

const MACHINE_TYPES = ['Tractor', 'Harvester', 'Rotavator', 'Sprayer', 'Seed drill', 'Thresher', 'Transplanter', 'Drone']

export const machineryResource: ResourceConfig<Machinery> = {
  collection: 'machinery',
  module: 'services',
  entity: 'Machine',
  entityPlural: 'Machines',
  title: (m) => m.name,
  subtitle: (m) => `${m.machineType} · ${m.regNo}`,
  searchText: (m) => `${m.name} ${m.regNo} ${m.ownerName} ${m.district}`,
  status: { value: (m) => m.status, map: MACHINE_STATUS },
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'verified', label: 'Verified', match: (m) => m.status === 'verified' },
    { value: 'pending', label: 'Pending inspection', match: (m) => m.status === 'pending_inspection' },
    { value: 'insurance', label: 'Insurance expired', match: (m) => isPast(m.insuranceExpiry) && m.status !== 'retired' },
    { value: 'suspended', label: 'Suspended', match: (m) => m.status === 'suspended' },
    { value: 'retired', label: 'Retired', match: (m) => m.status === 'retired' },
  ],
  columns: [
    { key: 'name', header: 'Machine', kind: 'strong', value: (m) => m.name, sub: (m) => `${m.machineType}${m.hp ? ` · ${m.hp} HP` : ''} · ${m.year}` },
    { key: 'reg', header: 'Registration', kind: 'mono', value: (m) => m.regNo, hideBelow: 'lg' },
    { key: 'owner', header: 'Owner', value: (m) => m.ownerName, sub: (m) => location(m.district, m.state), href: (m) => `/users/${m.ownerId}` },
    { key: 'condition', header: 'Condition', kind: 'status', value: (m) => m.condition, statusMap: CONDITION, hideBelow: 'md' },
    { key: 'insurance', header: 'Insurance', value: (m) => relativeDue(m.insuranceExpiry).label, sub: () => 'expiry' },
    { key: 'inspection', header: 'Last inspection', kind: 'relative', value: (m) => m.lastInspection, hideBelow: 'xl' },
    { key: 'status', header: 'Status', kind: 'status', value: (m) => m.status },
  ],
  filters: [optionsFilter('type', 'Type', MACHINE_TYPES, (m) => m.machineType), stateFilter((m) => m.state)],
  kpis: (rows) => [
    { label: 'Registered machines', value: rows.length, icon: Tractor, highlight: true },
    { label: 'Verified', value: `${pct(count(rows, (m) => m.status === 'verified'), rows.length)}%`, icon: BadgeCheck },
    { label: 'Awaiting inspection', value: count(rows, (m) => m.status === 'pending_inspection'), icon: ClipboardCheck },
    { label: 'Insurance expired', value: count(rows, (m) => isPast(m.insuranceExpiry) && m.status !== 'retired'), hint: 'Must be suspended', hintTone: 'error', icon: AlertTriangle },
  ],
  detail: [
    {
      title: 'Machine',
      fields: [
        { label: 'Type', value: (m) => m.machineType },
        { label: 'Horsepower', value: (m) => (m.hp ? `${m.hp} HP` : '—') },
        { label: 'Model year', value: (m) => m.year },
        { label: 'Registration / UIN', kind: 'mono', value: (m) => m.regNo },
        { label: 'Condition', kind: 'status', value: (m) => m.condition, statusMap: CONDITION },
      ],
    },
    {
      title: 'Compliance',
      fields: [
        { label: 'Insurance expiry', kind: 'date', value: (m) => m.insuranceExpiry },
        { label: 'Last inspection', kind: 'date', value: (m) => m.lastInspection },
        { label: 'Owner', value: (m) => m.ownerName, href: (m) => `/users/${m.ownerId}` },
        { label: 'Location', value: (m) => location(m.district, m.state) },
      ],
    },
  ],
  related: (m) => [
    { label: 'Rental offers', href: `/services/machinery-rental?q=${encodeURIComponent(m.name)}` },
    { label: 'Owner profile', href: `/users/${m.ownerId}` },
  ],
  actions: [
    approve<Machinery>(['pending_inspection'], 'verified', 'machine', { label: 'Pass inspection' }),
    {
      id: 'inspection',
      label: 'Schedule inspection',
      icon: CalendarClock,
      when: (m) => m.status !== 'retired',
      confirm: {
        title: (m) => `Schedule inspection for ${m.name}`,
        description: 'A field agent visits and records condition and documents.',
        date: { label: 'Inspection date' },
        confirmLabel: 'Schedule',
      },
      run: (_, input) => ({ patch: { status: 'pending_inspection' }, audit: `Scheduled inspection for ${new Date(input.date!).toLocaleDateString('en-IN')}` }),
    },
    suspend<Machinery>(['verified', 'pending_inspection'], 'suspended', 'machine'),
    reactivate<Machinery>(['suspended'], 'verified', 'machine'),
  ],
}

/* ───────── Machinery rental ───────── */

const RENTAL_STATUS: Record<MachineryRental['status'], StatusDef> = {
  live: s('Live', 'success'),
  pending_review: s('Pending review', 'pending'),
  paused: s('Paused', 'default'),
  rejected: s('Rejected', 'error'),
}

const AVAILABILITY: Record<MachineryRental['availability'], StatusDef> = {
  available: s('Available', 'accent'),
  booked: s('Booked', 'info'),
  maintenance: s('Maintenance', 'warning'),
}

export const machineryRentalResource: ResourceConfig<MachineryRental> = {
  collection: 'machineryRentals',
  module: 'services',
  entity: 'Rental offer',
  entityPlural: 'Rental offers',
  title: (r) => r.machineName,
  subtitle: (r) => `${r.ownerName} · ${location(r.district, r.state)}`,
  searchText: (r) => `${r.machineName} ${r.machineType} ${r.ownerName} ${r.district}`,
  status: { value: (r) => r.status, map: RENTAL_STATUS },
  defaultSort: { key: 'utilisation', dir: 'desc' },
  columns: [
    { key: 'machine', header: 'Machine', kind: 'strong', value: (r) => r.machineName, sub: (r) => r.machineType },
    { key: 'owner', header: 'Owner', value: (r) => r.ownerName, sub: (r) => location(r.district, r.state), href: (r) => `/users/${r.ownerId}`, hideBelow: 'md' },
    { key: 'rate', header: 'Rate', kind: 'money', value: (r) => r.rate, sub: (r) => r.rateType, align: 'right' },
    { key: 'availability', header: 'Availability', kind: 'status', value: (r) => r.availability, statusMap: AVAILABILITY, hideBelow: 'lg' },
    { key: 'utilisation', header: 'Utilisation', kind: 'progress', value: (r) => r.utilisation, hideBelow: 'lg' },
    { key: 'bookings', header: 'Bookings (30d)', kind: 'number', value: (r) => r.bookings30d, align: 'right', hideBelow: 'xl' },
    { key: 'rating', header: 'Rating', kind: 'rating', value: (r) => r.rating, hideBelow: 'md' },
    { key: 'status', header: 'Status', kind: 'status', value: (r) => r.status },
  ],
  filters: [
    optionsFilter('type', 'Type', MACHINE_TYPES, (r) => r.machineType),
    optionsFilter('rateType', 'Pricing', ['per hour', 'per day', 'per acre'], (r) => r.rateType),
    stateFilter((r) => r.state),
  ],
  kpis: (rows) => {
    const live = rows.filter((r) => r.status === 'live')
    return [
      { label: 'Live offers', value: live.length, icon: Tractor, highlight: true },
      { label: 'Avg utilisation', value: `${avg(live, (r) => r.utilisation).toFixed(0)}%`, trend: 4.2, icon: Gauge },
      { label: 'Bookings (30d)', value: sum(rows, (r) => r.bookings30d), icon: CalendarClock },
      { label: 'Pending review', value: count(rows, (r) => r.status === 'pending_review'), icon: ClipboardCheck },
    ]
  },
  detail: [
    {
      title: 'Offer',
      fields: [
        { label: 'Rate', kind: 'money', value: (r) => r.rate },
        { label: 'Pricing', value: (r) => r.rateType },
        { label: 'Security deposit', kind: 'money', value: (r) => r.deposit },
        { label: 'Availability', kind: 'status', value: (r) => r.availability, statusMap: AVAILABILITY },
      ],
    },
    {
      title: 'Performance',
      fields: [
        { label: 'Utilisation', kind: 'progress', value: (r) => r.utilisation },
        { label: 'Bookings (30 days)', kind: 'number', value: (r) => r.bookings30d },
        { label: 'Rating', kind: 'rating', value: (r) => r.rating },
        { label: 'Owner', value: (r) => r.ownerName, href: (r) => `/users/${r.ownerId}` },
      ],
    },
  ],
  related: (r) => [
    { label: 'Bookings', href: `/operations/bookings?q=${encodeURIComponent(r.machineName)}` },
    { label: 'Agreements', href: '/operations/agreements?tab=active' },
  ],
  actions: [
    approve<MachineryRental>(['pending_review'], 'live', 'rental offer', { label: 'Approve & publish' }),
    reject<MachineryRental>(['pending_review'], 'rejected', 'rental offer', ['Machine not verified', 'Rate far above district average', 'Missing insurance', 'Poor photos']),
    transition<MachineryRental>({ id: 'pause', label: 'Pause', to: 'paused', from: ['live'], audit: 'Paused rental offer', bulk: true, confirm: { title: 'Pause this offer?', description: 'Existing bookings continue; no new bookings are accepted.', reasonRequired: true } }),
    transition<MachineryRental>({ id: 'resume', label: 'Resume', to: 'live', from: ['paused'], audit: 'Resumed rental offer', tone: 'primary' }),
  ],
}

/* ───────── Labor ───────── */

const LABOR_STATUS: Record<LaborService['status'], StatusDef> = {
  active: s('Active', 'success'),
  pending_verification: s('Pending verification', 'pending'),
  suspended: s('Suspended', 'error'),
}

export const laborResource: ResourceConfig<LaborService> = {
  collection: 'laborServices',
  module: 'services',
  entity: 'Labor crew',
  entityPlural: 'Labor crews',
  title: (l) => `${l.leaderName}’s crew`,
  subtitle: (l) => `${l.crewSize} workers · ${location(l.district, l.state)}`,
  searchText: (l) => `${l.leaderName} ${l.skills.join(' ')} ${l.district}`,
  status: { value: (l) => l.status, map: LABOR_STATUS },
  columns: [
    { key: 'leader', header: 'Crew lead', kind: 'person', value: (l) => l.leaderName, sub: (l) => location(l.district, l.state) },
    { key: 'size', header: 'Crew', kind: 'number', value: (l) => l.crewSize, align: 'right' },
    { key: 'skills', header: 'Skills', kind: 'tags', value: (l) => l.skills, hideBelow: 'md' },
    { key: 'wage', header: 'Daily wage', kind: 'money', value: (l) => l.dailyWage, sub: () => 'per worker', align: 'right' },
    { key: 'jobs', header: 'Jobs done', kind: 'number', value: (l) => l.jobsCompleted, align: 'right', hideBelow: 'xl' },
    { key: 'availability', header: 'Availability', kind: 'status', value: (l) => l.availability, statusMap: { available: s('Available', 'accent'), engaged: s('Engaged', 'info'), off_season: s('Off season', 'default') }, hideBelow: 'lg' },
    { key: 'rating', header: 'Rating', kind: 'rating', value: (l) => l.rating },
    { key: 'status', header: 'Status', kind: 'status', value: (l) => l.status },
  ],
  filters: [
    optionsFilter('skill', 'Skill', ['Sowing', 'Transplanting', 'Weeding', 'Spraying', 'Harvesting', 'Threshing', 'Loading', 'Pruning'], (l) => l.skills),
    stateFilter((l) => l.state),
  ],
  kpis: (rows) => [
    { label: 'Registered crews', value: rows.length, icon: HardHat, highlight: true },
    { label: 'Workers available', value: sum(rows.filter((l) => l.availability === 'available' && l.status === 'active'), (l) => l.crewSize), icon: Users },
    { label: 'Avg daily wage', value: formatInrCompact(avg(rows, (l) => l.dailyWage)), hint: 'Above MGNREGA floor', icon: IndianRupee },
    { label: 'Awaiting verification', value: count(rows, (l) => l.status === 'pending_verification'), icon: UserCheck },
  ],
  detail: [
    {
      title: 'Crew',
      fields: [
        { label: 'Crew lead', value: (l) => l.leaderName, href: (l) => `/users/${l.leaderId}` },
        { label: 'Crew size', kind: 'number', value: (l) => l.crewSize },
        { label: 'Skills', kind: 'tags', value: (l) => l.skills, span: 2 },
        { label: 'Daily wage (per worker)', kind: 'money', value: (l) => l.dailyWage },
        { label: 'Jobs completed', kind: 'number', value: (l) => l.jobsCompleted },
        { label: 'Rating', kind: 'rating', value: (l) => l.rating },
        { label: 'Location', value: (l) => location(l.district, l.state) },
      ],
    },
  ],
  actions: [
    approve<LaborService>(['pending_verification'], 'active', 'labor crew', { label: 'Verify crew' }),
    suspend<LaborService>(['active', 'pending_verification'], 'suspended', 'labor crew'),
    reactivate<LaborService>(['suspended'], 'active', 'labor crew'),
  ],
}

/* ───────── Drivers ───────── */

const DRIVER_STATUS: Record<DriverService['status'], StatusDef> = {
  available: s('Available', 'success'),
  on_trip: s('On trip', 'accent'),
  offline: s('Offline', 'default'),
  pending_verification: s('Pending verification', 'pending'),
  suspended: s('Suspended', 'error'),
}

const BG_CHECK: Record<DriverService['backgroundCheck'], StatusDef> = {
  clear: s('Clear', 'success'),
  pending: s('Pending', 'pending'),
  flagged: s('Flagged', 'error'),
}

export const driversResource: ResourceConfig<DriverService> = {
  collection: 'driverServices',
  module: 'services',
  entity: 'Driver',
  entityPlural: 'Drivers',
  title: (d) => d.name,
  subtitle: (d) => `${d.vehicleTypes.join(', ')} · ${d.experienceYears} yrs experience`,
  searchText: (d) => `${d.name} ${d.licenseNo} ${d.district} ${d.vehicleTypes.join(' ')}`,
  status: { value: (d) => d.status, map: DRIVER_STATUS },
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'available', label: 'Available', match: (d) => d.status === 'available' },
    { value: 'on_trip', label: 'On trip', match: (d) => d.status === 'on_trip' },
    { value: 'pending', label: 'Pending verification', match: (d) => d.status === 'pending_verification' },
    { value: 'compliance', label: 'Licence expired', match: (d) => isPast(d.licenseExpiry) && d.status !== 'suspended' },
    { value: 'suspended', label: 'Suspended', match: (d) => d.status === 'suspended' },
  ],
  columns: [
    { key: 'name', header: 'Driver', kind: 'person', value: (d) => d.name, sub: (d) => location(d.district, d.state) },
    { key: 'vehicles', header: 'Vehicles', kind: 'tags', value: (d) => d.vehicleTypes },
    { key: 'licence', header: 'Licence', kind: 'mono', value: (d) => d.licenseNo, sub: (d) => `Expiry ${relativeDue(d.licenseExpiry).label}`, hideBelow: 'lg' },
    { key: 'bg', header: 'Background', kind: 'status', value: (d) => d.backgroundCheck, statusMap: BG_CHECK, hideBelow: 'md' },
    { key: 'trips', header: 'Trips (30d)', kind: 'number', value: (d) => d.trips30d, align: 'right', hideBelow: 'xl' },
    { key: 'rating', header: 'Rating', kind: 'rating', value: (d) => d.rating },
    { key: 'status', header: 'Status', kind: 'status', value: (d) => d.status },
  ],
  filters: [
    optionsFilter('vehicle', 'Vehicle', ['Tractor', 'Truck', 'Pickup'], (d) => d.vehicleTypes),
    { key: 'bg', label: 'Background', options: Object.entries(BG_CHECK).map(([value, d]) => ({ value, label: d.label })), match: (d, v) => d.backgroundCheck === v },
    stateFilter((d) => d.state),
  ],
  kpis: (rows) => [
    { label: 'Drivers', value: rows.length, icon: Truck, highlight: true },
    { label: 'On trip now', value: count(rows, (d) => d.status === 'on_trip'), icon: Route },
    { label: 'Licence expired', value: count(rows, (d) => isPast(d.licenseExpiry) && d.status !== 'suspended'), hint: 'Block new trips', hintTone: 'error', icon: AlertTriangle },
    { label: 'Background flagged', value: count(rows, (d) => d.backgroundCheck === 'flagged'), icon: ShieldCheck },
  ],
  detail: [
    {
      title: 'Driver',
      fields: [
        { label: 'Licence number', kind: 'mono', value: (d) => d.licenseNo },
        { label: 'Licence expiry', kind: 'date', value: (d) => d.licenseExpiry },
        { label: 'Vehicles', kind: 'tags', value: (d) => d.vehicleTypes },
        { label: 'Experience', value: (d) => `${d.experienceYears} years` },
        { label: 'Background check', kind: 'status', value: (d) => d.backgroundCheck, statusMap: BG_CHECK },
        { label: 'Trips (30 days)', kind: 'number', value: (d) => d.trips30d },
      ],
    },
  ],
  related: (d) => [
    { label: 'User profile', href: `/users/${d.userId}` },
    { label: 'Live tracking', href: '/operations/tracking' },
  ],
  actions: [
    approve<DriverService>(['pending_verification'], 'available', 'driver', { label: 'Verify driver' }),
    transition<DriverService>({ id: 'bg-clear', label: 'Mark background clear', to: 'available', from: ['pending_verification'], audit: 'Marked background check clear', icon: ShieldCheck, extra: () => ({ backgroundCheck: 'clear' }) }),
    suspend<DriverService>(['available', 'on_trip', 'offline', 'pending_verification'], 'suspended', 'driver'),
    reactivate<DriverService>(['suspended'], 'available', 'driver'),
  ],
}

/* ───────── Logistics partners ───────── */

const LOGISTICS_STATUS: Record<LogisticsPartner['status'], StatusDef> = {
  active: s('Active', 'success'),
  onboarding: s('Onboarding', 'info'),
  suspended: s('Suspended', 'error'),
}

export const logisticsResource: ResourceConfig<LogisticsPartner> = {
  collection: 'logisticsPartners',
  module: 'services',
  entity: 'Logistics partner',
  entityPlural: 'Logistics partners',
  title: (l) => l.name,
  subtitle: (l) => `${l.fleetSize} vehicles · ${l.coverage.join(', ')}`,
  searchText: (l) => `${l.name} ${l.coverage.join(' ')} ${l.vehicleTypes.join(' ')}`,
  status: { value: (l) => l.status, map: LOGISTICS_STATUS },
  defaultSort: { key: 'ontime', dir: 'desc' },
  columns: [
    { key: 'name', header: 'Partner', kind: 'strong', value: (l) => l.name, sub: (l) => l.vehicleTypes.join(' · ') },
    { key: 'fleet', header: 'Fleet', kind: 'number', value: (l) => l.fleetSize, align: 'right' },
    { key: 'coverage', header: 'Coverage', kind: 'tags', value: (l) => l.coverage, hideBelow: 'md' },
    { key: 'ontime', header: 'On-time', kind: 'progress', value: (l) => l.onTimeRate },
    { key: 'active', header: 'Active shipments', kind: 'number', value: (l) => l.activeShipments, align: 'right', hideBelow: 'lg' },
    { key: 'rate', header: 'Rate', kind: 'money', value: (l) => l.ratePerKm, sub: () => 'per km', align: 'right', hideBelow: 'lg' },
    { key: 'contract', header: 'Contract', value: (l) => relativeDue(l.contractEnd).label, sub: () => 'renewal', hideBelow: 'xl' },
    { key: 'status', header: 'Status', kind: 'status', value: (l) => l.status },
  ],
  kpis: (rows) => [
    { label: 'Partners', value: rows.length, icon: Truck, highlight: true },
    { label: 'Fleet capacity', value: sum(rows, (l) => l.fleetSize), hint: 'vehicles', icon: Route },
    { label: 'Avg on-time', value: `${avg(rows.filter((l) => l.status === 'active'), (l) => l.onTimeRate).toFixed(1)}%`, trend: 1.8, icon: PackageCheck },
    { label: 'Contracts expiring (30d)', value: count(rows, (l) => new Date(l.contractEnd).getTime() - Date.now() < 30 * 86400000), hintTone: 'warning', hint: 'Renew in Agreements', icon: FileCheck2 },
  ],
  detail: [
    {
      title: 'Partner',
      fields: [
        { label: 'Fleet size', kind: 'number', value: (l) => l.fleetSize },
        { label: 'Vehicle types', kind: 'tags', value: (l) => l.vehicleTypes },
        { label: 'Coverage', kind: 'tags', value: (l) => l.coverage, span: 2 },
        { label: 'Rate per km', kind: 'money', value: (l) => l.ratePerKm },
        { label: 'Contract end', kind: 'date', value: (l) => l.contractEnd },
      ],
    },
    {
      title: 'SLA',
      fields: [
        { label: 'On-time delivery', kind: 'progress', value: (l) => l.onTimeRate },
        { label: 'Active shipments', kind: 'number', value: (l) => l.activeShipments },
        { label: 'Rating', kind: 'rating', value: (l) => l.rating },
      ],
    },
  ],
  related: (l) => [{ label: 'Deliveries', href: `/operations/deliveries?q=${encodeURIComponent(l.name)}` }],
  actions: [
    approve<LogisticsPartner>(['onboarding'], 'active', 'logistics partner', { label: 'Activate partner' }),
    suspend<LogisticsPartner>(['active'], 'suspended', 'logistics partner'),
    reactivate<LogisticsPartner>(['suspended'], 'active', 'logistics partner'),
  ],
  create: {
    label: 'Onboard partner',
    idPrefix: 'LOG-',
    fields: [
      { name: 'name', label: 'Company name', type: 'text', required: true },
      { name: 'fleet', label: 'Fleet size', type: 'number', required: true, min: 1, defaultValue: 10 },
      { name: 'rate', label: 'Rate per km (₹)', type: 'number', required: true, min: 1, defaultValue: 30 },
      { name: 'coverage', label: 'States (comma separated)', type: 'text', required: true, placeholder: 'MH, KA, GJ' },
    ],
    build: (v, id) => ({
      id,
      name: v.name!,
      fleetSize: Number(v.fleet),
      vehicleTypes: ['Truck'],
      coverage: v.coverage!.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean),
      onTimeRate: 0,
      activeShipments: 0,
      ratePerKm: Number(v.rate),
      rating: 0,
      status: 'onboarding',
      contractEnd: new Date(Date.now() + 365 * 86400000).toISOString(),
    }),
  },
}

/* ───────── Warehouses ───────── */

const WAREHOUSE_STATUS: Record<Warehouse['status'], StatusDef> = {
  active: s('Active', 'success'),
  full: s('Full', 'warning'),
  pending_inspection: s('Pending inspection', 'pending'),
  suspended: s('Suspended', 'error'),
}

export const warehousesResource: ResourceConfig<Warehouse> = {
  collection: 'warehouses',
  module: 'services',
  entity: 'Warehouse',
  entityPlural: 'Warehouses',
  title: (w) => w.name,
  subtitle: (w) => `${w.storageType} · ${w.ownerName}`,
  searchText: (w) => `${w.name} ${w.ownerName} ${w.storageType} ${w.district}`,
  status: { value: (w) => w.status, map: WAREHOUSE_STATUS },
  columns: [
    { key: 'name', header: 'Warehouse', kind: 'strong', value: (w) => w.name, sub: (w) => location(w.district, w.state) },
    { key: 'type', header: 'Type', value: (w) => w.storageType, hideBelow: 'md' },
    { key: 'capacity', header: 'Capacity', value: (w) => `${w.capacityMt.toLocaleString('en-IN')} MT`, align: 'right' },
    { key: 'occupancy', header: 'Occupancy', kind: 'meter', value: (w) => (w.occupiedMt / w.capacityMt) * 100 },
    { key: 'rate', header: 'Rate', kind: 'money', value: (w) => w.ratePerMtMonth, sub: () => 'per MT / month', align: 'right', hideBelow: 'lg' },
    { key: 'wdra', header: 'WDRA', kind: 'boolean', value: (w) => w.wdraCertified, hideBelow: 'lg' },
    { key: 'status', header: 'Status', kind: 'status', value: (w) => w.status },
  ],
  filters: [optionsFilter('type', 'Type', ['Dry storage', 'Cold storage', 'Silo', 'Open yard'], (w) => w.storageType), stateFilter((w) => w.state)],
  kpis: (rows) => {
    const cap = sum(rows, (w) => w.capacityMt)
    const occ = sum(rows, (w) => w.occupiedMt)
    return [
      { label: 'Total capacity', value: `${(cap / 1000).toFixed(1)}K MT`, icon: WarehouseIcon, highlight: true },
      { label: 'Network occupancy', value: `${pct(occ, cap)}%`, trend: 3.4, icon: Gauge },
      { label: 'WDRA certified', value: `${pct(count(rows, (w) => w.wdraCertified), rows.length)}%`, hint: 'Eligible for warehouse receipts', icon: BadgeCheck },
      { label: 'Near full (>90%)', value: count(rows, (w) => w.occupiedMt / w.capacityMt > 0.9), hintTone: 'warning', hint: 'Bookings auto-limited', icon: AlertTriangle },
    ]
  },
  detail: [
    {
      title: 'Facility',
      fields: [
        { label: 'Storage type', value: (w) => w.storageType },
        { label: 'Capacity', value: (w) => `${w.capacityMt.toLocaleString('en-IN')} MT` },
        { label: 'Occupied', value: (w) => `${w.occupiedMt.toLocaleString('en-IN')} MT` },
        { label: 'Occupancy', kind: 'meter', value: (w) => (w.occupiedMt / w.capacityMt) * 100 },
        { label: 'Rate', kind: 'money', value: (w) => w.ratePerMtMonth },
        { label: 'WDRA certified', kind: 'boolean', value: (w) => w.wdraCertified },
      ],
    },
    {
      title: 'Compliance',
      fields: [
        { label: 'Owner', value: (w) => w.ownerName, href: (w) => `/users/${w.ownerId}` },
        { label: 'Last audit', kind: 'date', value: (w) => w.lastAudit },
        { label: 'Location', value: (w) => location(w.district, w.state) },
      ],
    },
  ],
  actions: [
    approve<Warehouse>(['pending_inspection'], 'active', 'warehouse', { label: 'Pass inspection' }),
    suspend<Warehouse>(['active', 'full', 'pending_inspection'], 'suspended', 'warehouse'),
    reactivate<Warehouse>(['suspended'], 'active', 'warehouse'),
  ],
}

/* ───────── Experts ───────── */

const EXPERT_STATUS: Record<ExpertService['status'], StatusDef> = {
  active: s('Active', 'success'),
  pending_verification: s('Pending verification', 'pending'),
  paused: s('Paused', 'default'),
  suspended: s('Suspended', 'error'),
}

export const expertsResource: ResourceConfig<ExpertService> = {
  collection: 'expertServices',
  module: 'services',
  entity: 'Expert',
  entityPlural: 'Experts',
  title: (e) => e.name,
  subtitle: (e) => `${e.specialization} · ${e.qualification}`,
  searchText: (e) => `${e.name} ${e.specialization} ${e.languages.join(' ')}`,
  status: { value: (e) => e.status, map: EXPERT_STATUS },
  columns: [
    { key: 'name', header: 'Expert', kind: 'person', value: (e) => e.name, sub: (e) => e.qualification },
    { key: 'spec', header: 'Specialisation', value: (e) => e.specialization },
    { key: 'languages', header: 'Languages', kind: 'tags', value: (e) => e.languages, hideBelow: 'lg' },
    { key: 'fee', header: 'Fee', kind: 'money', value: (e) => e.fee, sub: () => 'per consult', align: 'right' },
    { key: 'consults', header: 'Consults (30d)', kind: 'number', value: (e) => e.consultations30d, align: 'right', hideBelow: 'md' },
    { key: 'response', header: 'Avg response', value: (e) => `${e.responseHours}h`, align: 'right', hideBelow: 'xl' },
    { key: 'rating', header: 'Rating', kind: 'rating', value: (e) => e.rating },
    { key: 'status', header: 'Status', kind: 'status', value: (e) => e.status },
  ],
  filters: [optionsFilter('spec', 'Specialisation', ['Agronomy', 'Soil science', 'Plant protection', 'Veterinary', 'Horticulture', 'Irrigation', 'Organic farming'], (e) => e.specialization)],
  kpis: (rows) => [
    { label: 'Experts', value: rows.length, icon: GraduationCap, highlight: true },
    { label: 'Consultations (30d)', value: sum(rows, (e) => e.consultations30d), trend: 14, icon: CalendarClock },
    { label: 'Avg rating', value: avg(rows, (e) => e.rating).toFixed(2), icon: Star },
    { label: 'Awaiting verification', value: count(rows, (e) => e.status === 'pending_verification'), icon: UserCheck },
  ],
  detail: [
    {
      title: 'Profile',
      fields: [
        { label: 'Specialisation', value: (e) => e.specialization },
        { label: 'Qualification', value: (e) => e.qualification },
        { label: 'Languages', kind: 'tags', value: (e) => e.languages },
        { label: 'Fee', kind: 'money', value: (e) => e.fee },
        { label: 'Consultations (30 days)', kind: 'number', value: (e) => e.consultations30d },
        { label: 'Avg response time', value: (e) => `${e.responseHours} hours` },
      ],
    },
  ],
  related: (e) => [
    { label: 'Appointments', href: `/operations/appointments?q=${encodeURIComponent(e.name)}` },
    { label: 'User profile', href: `/users/${e.userId}` },
  ],
  actions: [
    approve<ExpertService>(['pending_verification'], 'active', 'expert', { label: 'Verify credentials' }),
    reject<ExpertService>(['pending_verification'], 'suspended', 'expert', ['Degree could not be verified', 'Registration number invalid', 'Incomplete profile'], { label: 'Decline' }),
    suspend<ExpertService>(['active', 'paused'], 'suspended', 'expert'),
    reactivate<ExpertService>(['suspended', 'paused'], 'active', 'expert'),
  ],
}

/* ───────── Soil testing ───────── */

const SOIL_STATUS: Record<SoilTest['status'], StatusDef> = {
  requested: s('Requested', 'pending'),
  sample_collected: s('Sample collected', 'info'),
  in_lab: s('In lab', 'info'),
  report_ready: s('Report ready', 'accent'),
  delivered: s('Delivered', 'success'),
  cancelled: s('Cancelled', 'default'),
}

export const soilTestsResource: ResourceConfig<SoilTest> = {
  collection: 'soilTests',
  module: 'services',
  entity: 'Soil test',
  entityPlural: 'Soil tests',
  title: (t) => `${t.crop} field — ${t.farmerName}`,
  subtitle: (t) => `${t.village}, ${location(t.district, t.state)} · ${t.labName}`,
  searchText: (t) => `${t.farmerName} ${t.village} ${t.district} ${t.labName} ${t.crop}`,
  status: { value: (t) => t.status, map: SOIL_STATUS },
  defaultSort: { key: 'requested', dir: 'desc' },
  columns: [
    { key: 'farmer', header: 'Farmer', kind: 'person', value: (t) => t.farmerName, sub: (t) => `${t.village}, ${t.district}` },
    { key: 'crop', header: 'Crop', value: (t) => t.crop },
    { key: 'lab', header: 'Lab', value: (t) => t.labName, hideBelow: 'lg' },
    { key: 'params', header: 'Parameters', kind: 'tags', value: (t) => t.parameters, hideBelow: 'xl' },
    { key: 'fee', header: 'Fee', kind: 'money', value: (t) => t.fee, align: 'right', hideBelow: 'md' },
    { key: 'requested', header: 'Requested', kind: 'relative', value: (t) => t.requestedAt },
    { key: 'status', header: 'Status', kind: 'status', value: (t) => t.status },
  ],
  filters: [optionsFilter('lab', 'Lab', ['KVK Soil Lab, Baramati', 'ICAR-IISS Partner Lab', 'AgroTest Labs Nagpur', 'Krishi Vigyan Soil Unit', 'GreenSoil Diagnostics'], (t) => t.labName), stateFilter((t) => t.state)],
  kpis: (rows) => [
    { label: 'Tests this month', value: rows.length, icon: FlaskConical, highlight: true },
    { label: 'In progress', value: count(rows, (t) => ['requested', 'sample_collected', 'in_lab'].includes(t.status)), icon: CalendarClock },
    { label: 'Reports to deliver', value: count(rows, (t) => t.status === 'report_ready'), hint: 'Assign expert to explain', hintTone: 'warning', icon: FileCheck2 },
    { label: 'Avg turnaround', value: `${avg(rows, (t) => t.tatDays).toFixed(1)} days`, trend: -8, icon: Gauge },
  ],
  detail: [
    {
      title: 'Request',
      fields: [
        { label: 'Farmer', value: (t) => t.farmerName, href: (t) => `/users/${t.farmerId}` },
        { label: 'Crop', value: (t) => t.crop },
        { label: 'Village', value: (t) => `${t.village}, ${location(t.district, t.state)}`, span: 2 },
        { label: 'Parameters', kind: 'tags', value: (t) => t.parameters, span: 2 },
        { label: 'Fee', kind: 'money', value: (t) => t.fee },
        { label: 'Requested', kind: 'datetime', value: (t) => t.requestedAt },
      ],
    },
    {
      title: 'Lab',
      fields: [
        { label: 'Lab', value: (t) => t.labName },
        { label: 'Sample collected', kind: 'datetime', value: (t) => t.collectedAt },
        { label: 'Turnaround', value: (t) => `${t.tatDays} days` },
        { label: 'Assigned expert', value: (t) => t.assignedExpert },
      ],
    },
  ],
  actions: [
    transition<SoilTest>({ id: 'collected', label: 'Mark sample collected', to: 'sample_collected', from: ['requested'], audit: 'Marked sample collected', tone: 'primary', icon: PackageCheck, bulk: true, extra: () => ({ collectedAt: new Date().toISOString() }) }),
    transition<SoilTest>({ id: 'lab', label: 'Received at lab', to: 'in_lab', from: ['sample_collected'], audit: 'Sample received at lab', tone: 'primary', bulk: true }),
    transition<SoilTest>({ id: 'ready', label: 'Upload report', to: 'report_ready', from: ['in_lab'], audit: 'Uploaded soil health report', tone: 'primary', icon: FileCheck2 }),
    {
      id: 'assign',
      label: 'Assign expert & deliver',
      icon: GraduationCap,
      tone: 'primary',
      when: (t) => t.status === 'report_ready',
      confirm: {
        title: 'Assign an expert to walk the farmer through the report',
        choice: { label: 'Expert', options: ['Dr. Harish Kumar', 'Dr. Priya Sharma', 'Dr. Meera Patel'].map((e) => ({ value: e, label: e })) },
        confirmLabel: 'Assign & deliver',
      },
      run: (_, input) => ({ patch: { status: 'delivered', assignedExpert: input.choice }, audit: `Delivered report via ${input.choice}` }),
    },
    {
      id: 'cancel',
      label: 'Cancel test',
      icon: Wrench,
      tone: 'danger',
      when: (t) => ['requested', 'sample_collected'].includes(t.status),
      confirm: { title: 'Cancel this soil test?', description: 'The farmer is refunded in full.', destructive: true, reasonRequired: true, reasonOptions: ['Farmer requested', 'Village not serviceable', 'Sample damaged'] },
      run: () => ({ patch: { status: 'cancelled' }, audit: 'Cancelled soil test', severity: 'warning' }),
    },
  ],
}
