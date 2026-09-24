import {
  AlertTriangle,
  Ban,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileSignature,
  FileText,
  IndianRupee,
  MapPin,
  PackageCheck,
  Phone,
  RefreshCw,
  Route,
  Scale,
  Send,
  Timer,
  Truck,
  Video,
} from 'lucide-react'
import type { Agreement, Appointment, Booking, Delivery } from '@/lib/types/ops'
import type { ResourceConfig, StatusDef } from './types'
import { count, location, optionsFilter, pct, s, stateFilter, sum, transition } from './helpers'
import { formatInrCompact, relativeDue } from '@/lib/utils'

/* ───────── Bookings ───────── */

const BOOKING_STATUS: Record<Booking['status'], StatusDef> = {
  requested: s('Requested', 'pending'),
  confirmed: s('Confirmed', 'info'),
  in_progress: s('In progress', 'accent'),
  completed: s('Completed', 'success'),
  cancelled: s('Cancelled', 'default'),
  no_show: s('No-show', 'warning'),
  disputed: s('Disputed', 'error'),
}

const BOOKING_PAYMENT: Record<Booking['paymentStatus'], StatusDef> = {
  paid: s('Paid', 'success'),
  pending: s('Pending', 'pending'),
  partially_paid: s('Part paid', 'warning'),
  refunded: s('Refunded', 'info'),
}

const SERVICE_TYPES = ['Machinery rental', 'Labor', 'Driver', 'Warehouse', 'Expert', 'Soil testing', 'Logistics']

export const bookingsResource: ResourceConfig<Booking> = {
  collection: 'bookings',
  module: 'operations',
  entity: 'Booking',
  entityPlural: 'Bookings',
  title: (b) => b.serviceName,
  subtitle: (b) => `${b.serviceType} · ${b.customerName} with ${b.providerName}`,
  searchText: (b) => `${b.serviceName} ${b.customerName} ${b.providerName} ${b.district}`,
  status: { value: (b) => b.status, map: BOOKING_STATUS },
  defaultSort: { key: 'scheduled', dir: 'asc' },
  columns: [
    { key: 'id', header: 'Booking', kind: 'mono', value: (b) => b.id },
    { key: 'service', header: 'Service', kind: 'strong', value: (b) => b.serviceName, sub: (b) => b.serviceType },
    { key: 'customer', header: 'Customer', value: (b) => b.customerName, sub: (b) => location(b.district, b.state), href: (b) => `/users/${b.customerId}`, hideBelow: 'md' },
    { key: 'provider', header: 'Provider', value: (b) => b.providerName, hideBelow: 'xl' },
    { key: 'scheduled', header: 'Scheduled', kind: 'datetime', value: (b) => b.scheduledFor, sub: (b) => b.duration },
    { key: 'amount', header: 'Amount', kind: 'money', value: (b) => b.amount, align: 'right' },
    { key: 'payment', header: 'Payment', kind: 'status', value: (b) => b.paymentStatus, statusMap: BOOKING_PAYMENT, hideBelow: 'lg' },
    { key: 'status', header: 'Status', kind: 'status', value: (b) => b.status },
  ],
  filters: [optionsFilter('type', 'Service', SERVICE_TYPES, (b) => b.serviceType), stateFilter((b) => b.state)],
  kpis: (rows) => {
    const done = count(rows, (b) => b.status === 'completed')
    const closed = count(rows, (b) => ['completed', 'cancelled', 'no_show', 'disputed'].includes(b.status))
    return [
      { label: 'Booking value', value: formatInrCompact(sum(rows.filter((b) => b.status !== 'cancelled'), (b) => b.amount)), trend: 11.2, icon: IndianRupee, highlight: true },
      { label: 'Awaiting confirmation', value: count(rows, (b) => b.status === 'requested'), hint: 'Auto-cancel after 6h', hintTone: 'warning', icon: Clock3 },
      { label: 'Completion rate', value: `${pct(done, closed)}%`, icon: CheckCircle2 },
      { label: 'No-shows & disputes', value: count(rows, (b) => b.status === 'no_show' || b.status === 'disputed'), icon: AlertTriangle },
    ]
  },
  detail: [
    {
      title: 'Booking',
      fields: [
        { label: 'Service type', value: (b) => b.serviceType },
        { label: 'Service', value: (b) => b.serviceName },
        { label: 'Scheduled for', kind: 'datetime', value: (b) => b.scheduledFor },
        { label: 'Duration', value: (b) => b.duration },
        { label: 'Amount', kind: 'money', value: (b) => b.amount },
        { label: 'Payment', kind: 'status', value: (b) => b.paymentStatus, statusMap: BOOKING_PAYMENT },
      ],
    },
    {
      title: 'Parties',
      fields: [
        { label: 'Customer', value: (b) => b.customerName, href: (b) => `/users/${b.customerId}` },
        { label: 'Provider', value: (b) => b.providerName },
        { label: 'Location', value: (b) => location(b.district, b.state) },
        { label: 'Booked', kind: 'datetime', value: (b) => b.createdAt },
      ],
    },
  ],
  related: (b) => [
    { label: 'Agreement', href: `/operations/agreements?q=${encodeURIComponent(b.customerName)}` },
    { label: 'Payment', href: `/finance/payments?q=${b.id}` },
  ],
  actions: [
    transition<Booking>({ id: 'confirm', label: 'Confirm booking', to: 'confirmed', from: ['requested'], audit: 'Confirmed booking', tone: 'primary', icon: CheckCircle2, bulk: true }),
    {
      id: 'reschedule',
      label: 'Reschedule',
      icon: CalendarClock,
      when: (b) => ['requested', 'confirmed'].includes(b.status),
      confirm: { title: 'Reschedule booking', description: 'Both parties get an SMS with the new date.', date: { label: 'New date' }, reasonRequired: true, reasonOptions: ['Weather', 'Provider unavailable', 'Customer requested', 'Machine breakdown'], confirmLabel: 'Reschedule' },
      run: (_, input) => ({ patch: { scheduledFor: new Date(`${input.date}T09:00:00`).toISOString(), status: 'confirmed' }, audit: `Rescheduled to ${new Date(input.date!).toLocaleDateString('en-IN')}` }),
    },
    transition<Booking>({ id: 'complete', label: 'Mark completed', to: 'completed', from: ['in_progress', 'confirmed'], audit: 'Marked booking completed', icon: PackageCheck }),
    {
      id: 'cancel',
      label: 'Cancel booking',
      icon: Ban,
      tone: 'danger',
      when: (b) => ['requested', 'confirmed'].includes(b.status),
      confirm: { title: 'Cancel this booking?', description: 'Any payment is refunded. The provider’s cancellation count is not affected when cancelled by admin.', destructive: true, reasonRequired: true, reasonOptions: ['Provider unavailable', 'Customer requested', 'Weather', 'Duplicate booking', 'Suspected fraud'], confirmLabel: 'Cancel booking' },
      run: (b) => ({ patch: { status: 'cancelled', paymentStatus: b.paymentStatus === 'pending' ? 'pending' : 'refunded' }, audit: 'Cancelled booking', severity: 'warning' }),
    },
    transition<Booking>({ id: 'dispute', label: 'Open dispute', to: 'disputed', from: ['completed', 'no_show', 'in_progress'], audit: 'Opened dispute on booking', icon: Scale, tone: 'danger', confirm: { title: 'Open a dispute for this booking?', description: 'Provider payout is held until the dispute is resolved.', destructive: true, reasonRequired: true } }),
  ],
}

/* ───────── Appointments ───────── */

const APPT_STATUS: Record<Appointment['status'], StatusDef> = {
  scheduled: s('Scheduled', 'info'),
  rescheduled: s('Rescheduled', 'pending'),
  completed: s('Completed', 'success'),
  cancelled: s('Cancelled', 'default'),
  missed: s('Missed', 'warning'),
}

const MODE: Record<Appointment['mode'], StatusDef> = {
  video: s('Video call', 'default'),
  phone: s('Phone', 'default'),
  field_visit: s('Field visit', 'accent'),
}

export const appointmentsResource: ResourceConfig<Appointment> = {
  collection: 'appointments',
  module: 'operations',
  entity: 'Appointment',
  entityPlural: 'Appointments',
  title: (a) => a.topic,
  subtitle: (a) => `${a.farmerName} with ${a.expertName}`,
  searchText: (a) => `${a.topic} ${a.farmerName} ${a.expertName}`,
  status: { value: (a) => a.status, map: APPT_STATUS },
  tabs: [
    { value: 'upcoming', label: 'Upcoming', match: (a) => a.status === 'scheduled' || a.status === 'rescheduled' },
    { value: 'completed', label: 'Completed', match: (a) => a.status === 'completed' },
    { value: 'missed', label: 'Missed', match: (a) => a.status === 'missed' },
    { value: 'cancelled', label: 'Cancelled', match: (a) => a.status === 'cancelled' },
    { value: 'all', label: 'All' },
  ],
  defaultSort: { key: 'when', dir: 'asc' },
  columns: [
    { key: 'topic', header: 'Topic', kind: 'strong', value: (a) => a.topic, sub: (a) => `${a.durationMin} min · ${a.language}` },
    { key: 'farmer', header: 'Farmer', kind: 'person', value: (a) => a.farmerName, href: (a) => `/users/${a.farmerId}` },
    { key: 'expert', header: 'Expert', value: (a) => a.expertName, hideBelow: 'md' },
    { key: 'mode', header: 'Mode', kind: 'status', value: (a) => a.mode, statusMap: MODE, hideBelow: 'lg' },
    { key: 'when', header: 'When', kind: 'datetime', value: (a) => a.scheduledAt },
    { key: 'fee', header: 'Fee', kind: 'money', value: (a) => a.fee, align: 'right', hideBelow: 'xl' },
    { key: 'status', header: 'Status', kind: 'status', value: (a) => a.status },
  ],
  filters: [{ key: 'mode', label: 'Mode', options: Object.entries(MODE).map(([value, d]) => ({ value, label: d.label })), match: (a, v) => a.mode === v }],
  kpis: (rows) => {
    const upcoming = rows.filter((a) => a.status === 'scheduled' || a.status === 'rescheduled')
    const next24 = count(upcoming, (a) => new Date(a.scheduledAt).getTime() - Date.now() < 86400000)
    return [
      { label: 'Upcoming', value: upcoming.length, icon: CalendarCheck, highlight: true },
      { label: 'Next 24 hours', value: next24, icon: Timer },
      { label: 'Field visits', value: count(upcoming, (a) => a.mode === 'field_visit'), icon: MapPin },
      { label: 'Miss rate', value: `${pct(count(rows, (a) => a.status === 'missed'), count(rows, (a) => ['completed', 'missed'].includes(a.status)))}%`, icon: Phone },
    ]
  },
  detail: [
    {
      title: 'Appointment',
      fields: [
        { label: 'Topic', value: (a) => a.topic, span: 2 },
        { label: 'Mode', kind: 'status', value: (a) => a.mode, statusMap: MODE },
        { label: 'When', kind: 'datetime', value: (a) => a.scheduledAt },
        { label: 'Duration', value: (a) => `${a.durationMin} minutes` },
        { label: 'Language', value: (a) => a.language },
        { label: 'Fee', kind: 'money', value: (a) => a.fee },
      ],
    },
    {
      title: 'Participants',
      fields: [
        { label: 'Farmer', value: (a) => a.farmerName, href: (a) => `/users/${a.farmerId}` },
        { label: 'Expert', value: (a) => a.expertName },
      ],
    },
  ],
  actions: [
    {
      id: 'reschedule',
      label: 'Reschedule',
      icon: CalendarClock,
      tone: 'primary',
      when: (a) => ['scheduled', 'rescheduled', 'missed'].includes(a.status),
      confirm: { title: 'Pick a new date', date: { label: 'New date' }, confirmLabel: 'Reschedule' },
      run: (_, input) => ({ patch: { status: 'rescheduled', scheduledAt: new Date(`${input.date}T11:00:00`).toISOString() }, audit: `Rescheduled to ${new Date(input.date!).toLocaleDateString('en-IN')}` }),
    },
    transition<Appointment>({ id: 'remind', label: 'Send reminder', to: 'scheduled', from: ['scheduled', 'rescheduled'], audit: 'Sent WhatsApp reminder to both parties', icon: Send }),
    transition<Appointment>({ id: 'complete', label: 'Mark completed', to: 'completed', from: ['scheduled', 'rescheduled'], audit: 'Marked appointment completed', icon: Video }),
    transition<Appointment>({ id: 'cancel', label: 'Cancel', to: 'cancelled', from: ['scheduled', 'rescheduled'], audit: 'Cancelled appointment', icon: Ban, tone: 'danger', confirm: { title: 'Cancel this appointment?', description: 'The farmer is refunded.', destructive: true, reasonRequired: true } }),
  ],
}

/* ───────── Deliveries ───────── */

export const DELIVERY_STATUS: Record<Delivery['status'], StatusDef> = {
  awaiting_pickup: s('Awaiting pickup', 'pending'),
  in_transit: s('In transit', 'accent'),
  out_for_delivery: s('Out for delivery', 'info'),
  delivered: s('Delivered', 'success'),
  delayed: s('Delayed', 'warning'),
  failed: s('Failed attempt', 'error'),
  returned: s('Returned', 'default'),
}

export const deliveriesResource: ResourceConfig<Delivery> = {
  collection: 'deliveries',
  module: 'operations',
  entity: 'Delivery',
  entityPlural: 'Deliveries',
  title: (d) => `${d.origin} → ${d.destination}`,
  subtitle: (d) => `${d.carrier} · ${d.vehicleNo}`,
  searchText: (d) => `${d.orderId} ${d.origin} ${d.destination} ${d.carrier} ${d.driverName} ${d.vehicleNo}`,
  status: { value: (d) => d.status, map: DELIVERY_STATUS },
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'attention', label: 'Needs attention', match: (d) => d.status === 'delayed' || d.status === 'failed' },
    { value: 'awaiting_pickup', label: 'Awaiting pickup', match: (d) => d.status === 'awaiting_pickup' },
    { value: 'moving', label: 'On the road', match: (d) => d.status === 'in_transit' || d.status === 'out_for_delivery' },
    { value: 'delivered', label: 'Delivered', match: (d) => d.status === 'delivered' },
    { value: 'returned', label: 'Returned', match: (d) => d.status === 'returned' },
  ],
  columns: [
    { key: 'id', header: 'Shipment', kind: 'mono', value: (d) => d.id, sub: (d) => d.orderId },
    { key: 'route', header: 'Route', kind: 'strong', value: (d) => `${d.origin} → ${d.destination}`, sub: (d) => `${d.distanceKm} km · ${(d.weightKg / 1000).toFixed(1)} t` },
    { key: 'carrier', header: 'Carrier', value: (d) => d.carrier, sub: (d) => d.driverName, hideBelow: 'md' },
    { key: 'progress', header: 'Progress', kind: 'progress', value: (d) => d.progress, hideBelow: 'lg' },
    { key: 'eta', header: 'ETA', value: (d) => (d.status === 'delivered' ? 'Delivered' : relativeDue(d.eta).label), sub: (d) => `Last ping ${relativeDue(d.lastPing).label.replace(' overdue', ' ago')}` },
    { key: 'status', header: 'Status', kind: 'status', value: (d) => d.status },
  ],
  filters: [optionsFilter('carrier', 'Carrier', ['Kisan Freight Co.', 'Mandi Express Logistics', 'AgriMove Carriers', 'Deccan Cold Chain', 'CropVibe Fleet'], (d) => d.carrier)],
  kpis: (rows) => {
    const done = rows.filter((d) => d.status === 'delivered')
    return [
      { label: 'Active shipments', value: count(rows, (d) => ['awaiting_pickup', 'in_transit', 'out_for_delivery', 'delayed'].includes(d.status)), icon: Truck, highlight: true },
      { label: 'Delayed or failed', value: count(rows, (d) => d.status === 'delayed' || d.status === 'failed'), hint: 'Customers notified', hintTone: 'error', icon: AlertTriangle },
      { label: 'On-time rate', value: `${pct(done.length, done.length + count(rows, (d) => d.status === 'delayed'))}%`, trend: 2.1, icon: CheckCircle2 },
      { label: 'Km on the road', value: sum(rows.filter((d) => d.status === 'in_transit'), (d) => d.distanceKm).toLocaleString('en-IN'), icon: Route },
    ]
  },
  detail: [
    {
      title: 'Shipment',
      fields: [
        { label: 'Order', kind: 'mono', value: (d) => d.orderId, href: (d) => `/marketplace/orders?id=${d.orderId}` },
        { label: 'Route', value: (d) => `${d.origin} → ${d.destination}` },
        { label: 'Distance', value: (d) => `${d.distanceKm} km` },
        { label: 'Weight', value: (d) => `${d.weightKg.toLocaleString('en-IN')} kg` },
        { label: 'Progress', kind: 'progress', value: (d) => d.progress, span: 2 },
        { label: 'Picked up', kind: 'datetime', value: (d) => d.pickedUpAt },
        { label: 'ETA', kind: 'datetime', value: (d) => d.eta },
      ],
    },
    {
      title: 'Carrier',
      fields: [
        { label: 'Carrier', value: (d) => d.carrier },
        { label: 'Driver', value: (d) => d.driverName },
        { label: 'Vehicle', kind: 'mono', value: (d) => d.vehicleNo },
        { label: 'Last GPS ping', kind: 'relative', value: (d) => d.lastPing },
        { label: 'Proof of delivery', kind: 'boolean', value: (d) => d.podCaptured },
      ],
    },
  ],
  related: (d) => [
    { label: 'Track on map', href: `/operations/tracking?id=${d.id}` },
    { label: 'Order', href: `/marketplace/orders?id=${d.orderId}` },
  ],
  actions: [
    {
      id: 'reassign',
      label: 'Reassign carrier',
      icon: RefreshCw,
      tone: 'primary',
      when: (d) => ['awaiting_pickup', 'delayed', 'failed'].includes(d.status),
      confirm: {
        title: 'Reassign to another carrier',
        choice: { label: 'Carrier', options: ['Kisan Freight Co.', 'Mandi Express Logistics', 'AgriMove Carriers', 'Deccan Cold Chain', 'CropVibe Fleet'].map((c) => ({ value: c, label: c })) },
        reasonRequired: true,
        reasonOptions: ['Vehicle breakdown', 'Driver unreachable', 'Repeated delay', 'Customer request'],
        confirmLabel: 'Reassign',
      },
      run: (d, input) => ({ patch: { carrier: input.choice!, status: d.status === 'failed' ? 'awaiting_pickup' : d.status, lastPing: new Date().toISOString() }, audit: `Reassigned carrier ${d.carrier} → ${input.choice}` }),
    },
    {
      id: 'eta',
      label: 'Update ETA',
      icon: Clock3,
      when: (d) => ['in_transit', 'delayed', 'out_for_delivery'].includes(d.status),
      confirm: { title: 'Update ETA', description: 'The buyer is notified by SMS.', date: { label: 'New ETA' }, confirmLabel: 'Update ETA' },
      run: (_, input) => ({ patch: { eta: new Date(`${input.date}T18:00:00`).toISOString(), status: 'in_transit' }, audit: `Updated ETA to ${new Date(input.date!).toLocaleDateString('en-IN')}` }),
    },
    transition<Delivery>({ id: 'pod', label: 'Confirm delivery', to: 'delivered', from: ['out_for_delivery', 'in_transit', 'delayed'], audit: 'Confirmed delivery with POD', icon: PackageCheck, extra: () => ({ progress: 100, podCaptured: true }), confirm: { title: 'Confirm proof of delivery?', reasonRequired: true, reasonLabel: 'POD reference (photo / OTP)' } }),
    transition<Delivery>({ id: 'rto', label: 'Return to origin', to: 'returned', from: ['failed', 'delayed'], audit: 'Initiated return to origin', icon: Ban, tone: 'danger', confirm: { title: 'Return this shipment to origin?', description: 'The order is cancelled and the buyer refunded.', destructive: true, reasonRequired: true } }),
  ],
}

/* ───────── Agreements ───────── */

const AGREEMENT_STATUS: Record<Agreement['status'], StatusDef> = {
  draft: s('Draft', 'default'),
  pending_signature: s('Awaiting signature', 'pending'),
  active: s('Active', 'success'),
  expiring: s('Expiring soon', 'warning'),
  expired: s('Expired', 'default'),
  terminated: s('Terminated', 'error'),
}

export const agreementsResource: ResourceConfig<Agreement> = {
  collection: 'agreements',
  module: 'operations',
  entity: 'Agreement',
  entityPlural: 'Agreements',
  title: (a) => `${a.agreementType} · ${a.partyA} ↔ ${a.partyB}`,
  subtitle: (a) => `Version ${a.version}`,
  searchText: (a) => `${a.agreementType} ${a.partyA} ${a.partyB}`,
  status: { value: (a) => a.status, map: AGREEMENT_STATUS },
  columns: [
    { key: 'id', header: 'Agreement', kind: 'mono', value: (a) => a.id, sub: (a) => `v${a.version}` },
    { key: 'type', header: 'Type', kind: 'strong', value: (a) => a.agreementType },
    { key: 'parties', header: 'Parties', value: (a) => a.partyA, sub: (a) => `with ${a.partyB}` },
    { key: 'value', header: 'Value', kind: 'money', value: (a) => a.value, align: 'right', hideBelow: 'md' },
    { key: 'term', header: 'Term', kind: 'date', value: (a) => a.endDate, sub: (a) => `from ${new Date(a.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`, hideBelow: 'lg' },
    { key: 'signatures', header: 'Signed', value: (a) => `${Number(a.signedByA) + Number(a.signedByB)}/2`, align: 'right', hideBelow: 'lg' },
    { key: 'status', header: 'Status', kind: 'status', value: (a) => a.status },
  ],
  filters: [optionsFilter('type', 'Type', ['Machinery rental', 'Warehouse lease', 'Labor contract', 'Logistics contract', 'Contract farming'], (a) => a.agreementType)],
  kpis: (rows) => [
    { label: 'Active agreements', value: count(rows, (a) => a.status === 'active'), icon: FileSignature, highlight: true },
    { label: 'Contract value (active)', value: formatInrCompact(sum(rows.filter((a) => a.status === 'active' || a.status === 'expiring'), (a) => a.value)), icon: IndianRupee },
    { label: 'Awaiting signature', value: count(rows, (a) => a.status === 'pending_signature'), icon: Clock3 },
    { label: 'Expiring in 30 days', value: count(rows, (a) => a.status === 'expiring'), hint: 'Send renewal', hintTone: 'warning', icon: AlertTriangle },
  ],
  detail: [
    {
      title: 'Terms',
      fields: [
        { label: 'Type', value: (a) => a.agreementType },
        { label: 'Value', kind: 'money', value: (a) => a.value },
        { label: 'Start', kind: 'date', value: (a) => a.startDate },
        { label: 'End', kind: 'date', value: (a) => a.endDate },
        { label: 'Version', value: (a) => `v${a.version}` },
      ],
    },
    {
      title: 'Signatures',
      fields: [
        { label: 'Party A', value: (a) => a.partyA },
        { label: 'Signed by party A', kind: 'boolean', value: (a) => a.signedByA },
        { label: 'Party B', value: (a) => a.partyB },
        { label: 'Signed by party B', kind: 'boolean', value: (a) => a.signedByB },
      ],
    },
  ],
  related: () => [{ label: 'Agreement templates', href: '/content' }],
  actions: [
    transition<Agreement>({ id: 'send', label: 'Send for e-sign', to: 'pending_signature', from: ['draft'], audit: 'Sent for Aadhaar e-sign', tone: 'primary', icon: Send, extra: () => ({ signedByA: true }) }),
    transition<Agreement>({ id: 'remind', label: 'Remind to sign', to: 'pending_signature', from: ['pending_signature'], audit: 'Sent signature reminder', icon: Send }),
    {
      id: 'renew',
      label: 'Renew',
      icon: RefreshCw,
      tone: 'primary',
      when: (a) => a.status === 'expiring' || a.status === 'expired',
      confirm: { title: 'Renew agreement', description: 'Creates a new version with the same terms and sends it for e-sign.', date: { label: 'New end date' }, confirmLabel: 'Renew & send' },
      run: (a, input) => ({ patch: { status: 'pending_signature', version: a.version + 1, endDate: new Date(input.date!).toISOString(), signedByB: false }, audit: `Renewed as v${a.version + 1}` }),
    },
    transition<Agreement>({ id: 'terminate', label: 'Terminate', to: 'terminated', from: ['active', 'expiring', 'pending_signature'], audit: 'Terminated agreement', icon: FileText, tone: 'danger', confirm: { title: 'Terminate this agreement?', description: 'Both parties are notified; any notice period in the terms still applies.', destructive: true, reasonRequired: true, reasonOptions: ['Breach of terms', 'Mutual consent', 'Non-payment', 'Asset no longer available'] } }),
  ],
}
