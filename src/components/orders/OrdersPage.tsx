import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ORDERS_LABEL, ORDERS_PAGE_COPY, PRIMARY_CTA } from '../../config/navigation'
import { useAppStore } from '../../store/appStore'
import { useServiceBookings } from '../../hooks/useServiceBookings'
import type { ServiceBookingRecord } from '../services/serviceCatalogTypes'
import type { Role } from '../../types/roles'
import { formatCurrency } from '../../utils/format'
import { Badge, type BadgeStatus } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'
import { Select } from '../common/Select'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableRow,
  ExportButton,
  FilterSelect,
  OverviewFooter,
  OverviewPanel,
  OverviewSearch,
  OverviewShell,
  OverviewTabs,
  OverviewToolbar,
  PrimaryActionButton,
} from '../common/DataOverview'

type SellerStatus = 'pending' | 'accepted' | 'packed' | 'shipped' | 'delivered' | 'completed'
type RentalStatus = 'pending' | 'confirmed' | 'rented' | 'return' | 'completed' | 'damage' | 'closed'

interface SellerOrder {
  id: string
  buyer: string
  buyerRating: number
  product: string
  qty: string
  price: number
  orderedAgo: string
  note?: string
  status: SellerStatus
  tracking?: string
}

interface RentalBooking {
  id: string
  renter: string
  renterRating: number
  equipment: string
  period: string
  days: number
  rate: number
  deposit: number
  status: RentalStatus
  location: string
  damageCost?: number
}

const INITIAL_SELLER: SellerOrder[] = [
  {
    id: 'PO-8922',
    buyer: 'Green Mart',
    buyerRating: 4.8,
    product: 'Tomatoes',
    qty: '50kg',
    price: 8450,
    orderedAgo: '2 hours ago',
    note: 'Buyer requested urgent delivery',
    status: 'pending',
  },
  {
    id: 'PO-8923',
    buyer: 'FreshStore',
    buyerRating: 4.5,
    product: 'Potatoes',
    qty: '100kg',
    price: 12300,
    orderedAgo: '5 hours ago',
    status: 'accepted',
  },
  {
    id: 'PO-8919',
    buyer: 'Organic Hub',
    buyerRating: 4.9,
    product: 'Carrots',
    qty: '40kg',
    price: 5200,
    orderedAgo: '1 day ago',
    status: 'shipped',
    tracking: 'ABC123XYZ',
  },
]

const INITIAL_RENTAL: RentalBooking[] = [
  {
    id: 'BK-5432',
    renter: 'ABC Farm',
    renterRating: 4.6,
    equipment: 'Tractor #1',
    period: '2026-07-28 to 2026-07-31',
    days: 4,
    rate: 2500,
    deposit: 15000,
    status: 'pending',
    location: '45 km from your area',
  },
  {
    id: 'BK-5430',
    renter: 'Farm Ltd',
    renterRating: 4.8,
    equipment: 'Harvester #1',
    period: '2026-07-25 to 2026-07-28',
    days: 3,
    rate: 4500,
    deposit: 20000,
    status: 'rented',
    location: 'Pune',
  },
  {
    id: 'BK-5428',
    renter: 'XYZ Inc',
    renterRating: 4.4,
    equipment: 'Rotavator #1',
    period: '2026-07-20 to 2026-07-22',
    days: 2,
    rate: 1800,
    deposit: 8000,
    status: 'return',
    location: 'Nashik',
  },
]

function sellerBadge(status: SellerStatus): BadgeStatus {
  if (status === 'pending') return 'pending'
  if (status === 'accepted') return 'accepted'
  if (status === 'packed') return 'packed'
  if (status === 'shipped') return 'shipped'
  if (status === 'delivered') return 'delivered'
  return 'completed'
}

function SellerOrders() {
  const [orders, setOrders] = useState(INITIAL_SELLER)
  const [selected, setSelected] = useState<string | null>(INITIAL_SELLER[0]?.id ?? null)
  const [tracking, setTracking] = useState({ partner: '', number: '', eta: '' })
  const order = orders.find((o) => o.id === selected)

  const update = (id: string, status: SellerStatus, extra?: Partial<SellerOrder>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status, ...extra } : o)))
  }

  if (!order) {
    return (
      <Card>
        <div className="py-12 text-center">
          <p className="text-4xl">ðŸ“­</p>
          <h2 className="mt-3 text-lg font-semibold">No Orders Yet</h2>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">Orders from buyers will appear here.</p>
        </div>
      </Card>
    )
  }

  return (
    <OverviewShell
      eyebrow={ORDERS_PAGE_COPY.seller.eyebrow}
      title={ORDERS_PAGE_COPY.seller.title}
      subtitle={ORDERS_PAGE_COPY.seller.subtitle}
      actions={
        <>
          <ExportButton onClick={() => undefined} />
          <PrimaryActionButton onClick={() => undefined}>+ New order</PrimaryActionButton>
        </>
      }
    >
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card title="Orders">
        <ul className="space-y-2">
          {orders.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => setSelected(o.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${selected === o.id ? 'border-[var(--cv-btn-bg)] bg-[var(--cv-primary-soft)]' : 'border-[var(--cv-border)]'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{o.id}</span>
                  <Badge status={sellerBadge(o.status)} />
                </div>
                <p className="mt-1 text-xs text-[var(--cv-muted)]">{o.buyer} · {o.product}</p>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{order.id}</h2>
            <p className="text-sm text-[var(--cv-muted)]">Ordered {order.orderedAgo}</p>
          </div>
          <Badge status={sellerBadge(order.status)} />
        </div>

        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <p><strong>Buyer:</strong> {order.buyer} ({order.buyerRating}â­)</p>
          <p><strong>Product:</strong> {order.product}, {order.qty}</p>
          <p><strong>Price:</strong> {formatCurrency(order.price)}</p>
          {order.tracking ? <p><strong>Tracking:</strong> {order.tracking}</p> : null}
        </div>
        {order.note ? <p className="mt-3 rounded-md bg-[var(--cv-accent-soft)] px-3 py-2 text-sm text-[var(--cv-warning)]">Note: {order.note}</p> : null}

        {order.status === 'packed' && (
          <div className="mt-4 space-y-3 rounded-lg border border-[var(--cv-border)] p-4">
            <p className="font-medium">Shipping Details</p>
            <Select
              label="Logistics Partner"
              value={tracking.partner}
              onChange={(e) => setTracking((p) => ({ ...p, partner: e.target.value }))}
              options={['Delhivery', 'BlueDart', 'DTDC', 'Self'].map((o) => ({ value: o, label: o }))}
            />
            <FormInput label="Tracking Number" value={tracking.number} onChange={(e) => setTracking((p) => ({ ...p, number: e.target.value }))} />
            <FormInput label="Estimated Delivery" type="datetime-local" value={tracking.eta} onChange={(e) => setTracking((p) => ({ ...p, eta: e.target.value }))} />
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {order.status === 'pending' && (
            <>
              <Button roleColor="seller" onClick={() => update(order.id, 'accepted')}>Accept Order</Button>
              <Button variant="danger" onClick={() => update(order.id, 'completed')}>Reject</Button>
              <Button variant="secondary" roleColor="seller">Contact Buyer</Button>
            </>
          )}
          {order.status === 'accepted' && (
            <>
              <Button roleColor="seller" onClick={() => update(order.id, 'packed')}>Mark as Packed</Button>
              <Button variant="secondary" roleColor="seller">Cancel Order</Button>
            </>
          )}
          {order.status === 'packed' && (
            <Button
              roleColor="seller"
              onClick={() => update(order.id, 'shipped', { tracking: tracking.number || 'TRACK-NEW' })}
            >
              Add Tracking Info
            </Button>
          )}
          {order.status === 'shipped' && (
            <>
              <Button roleColor="seller" onClick={() => update(order.id, 'delivered')}>Mark Delivered</Button>
              <Button variant="secondary" roleColor="seller">Update Tracking</Button>
            </>
          )}
          {order.status === 'delivered' && (
            <Button roleColor="seller" onClick={() => update(order.id, 'completed')}>Request Rating</Button>
          )}
          {order.status === 'completed' && (
            <p className="text-sm text-[var(--cv-muted)]">Payment released in 1â€“2 business days. Buyer rated â­â­â­â­â­</p>
          )}
        </div>
      </Card>
    </div>
    </OverviewShell>
  )
}

function RentalBookings() {
  const [bookings, setBookings] = useState(INITIAL_RENTAL)
  const [selected, setSelected] = useState<string | null>(INITIAL_RENTAL[0]?.id ?? null)
  const [damage, setDamage] = useState({ level: 'none', desc: '', cost: '' })
  const booking = bookings.find((b) => b.id === selected)

  const update = (id: string, status: RentalStatus, extra?: Partial<RentalBooking>) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status, ...extra } : b)))
  }

  const badgeFor = (s: RentalStatus): BadgeStatus => {
    if (s === 'pending' || s === 'return' || s === 'damage') return 'pending'
    if (s === 'confirmed') return 'accepted'
    if (s === 'rented') return 'active'
    return 'completed'
  }

  if (!booking) return null

  const rentalTotal = booking.rate * booking.days
  const fee = rentalTotal * 0.15
  const earnings = rentalTotal - fee

  return (
    <OverviewShell
      eyebrow={ORDERS_PAGE_COPY.rental.eyebrow}
      title={ORDERS_PAGE_COPY.rental.title}
      subtitle={ORDERS_PAGE_COPY.rental.subtitle}
      actions={
        <>
          <ExportButton onClick={() => undefined} />
          <PrimaryActionButton onClick={() => undefined}>+ New booking</PrimaryActionButton>
        </>
      }
    >
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card title="Bookings">
        <ul className="space-y-2">
          {bookings.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => setSelected(b.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${selected === b.id ? 'border-[var(--cv-btn-bg)] bg-[var(--cv-primary-soft)]' : 'border-[var(--cv-border)]'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{b.id}</span>
                  <Badge status={badgeFor(b.status)} children={b.status} />
                </div>
                <p className="mt-1 text-xs text-[var(--cv-muted)]">{b.equipment} · {b.renter}</p>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{booking.id}</h2>
            <p className="text-sm text-[var(--cv-muted)]">{booking.period} ({booking.days} days)</p>
          </div>
          <Badge status={badgeFor(booking.status)} children={booking.status} />
        </div>

        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <p><strong>Renter:</strong> {booking.renter} ({booking.renterRating}â­)</p>
          <p><strong>Equipment:</strong> {booking.equipment}</p>
          <p><strong>Location:</strong> {booking.location}</p>
          <p><strong>Rate:</strong> {formatCurrency(booking.rate)}/day Ã— {booking.days} = {formatCurrency(rentalTotal)}</p>
          <p><strong>Security Deposit:</strong> {formatCurrency(booking.deposit)}</p>
          <p><strong>Total:</strong> {formatCurrency(rentalTotal + booking.deposit)}</p>
        </div>

        {booking.status === 'return' && (
          <div className="mt-4 space-y-3 rounded-lg border border-[var(--cv-border)] p-4">
            <p className="font-medium">Verify Equipment Condition</p>
            {['Engine starts smoothly', 'No visible damage', 'Tires intact', 'Lights working', 'Fuel/fluids normal'].map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> {c}</label>
            ))}
            <Select
              label="Any Damage?"
              value={damage.level}
              onChange={(e) => setDamage((p) => ({ ...p, level: e.target.value }))}
              options={[
                { value: 'none', label: 'No damage' },
                { value: 'minor', label: 'Minor damage' },
                { value: 'major', label: 'Major damage' },
              ]}
            />
            {damage.level !== 'none' && (
              <>
                <FormInput label="Damage Description" as="textarea" value={damage.desc} onChange={(e) => setDamage((p) => ({ ...p, desc: e.target.value }))} />
                <FormInput label="Estimated Repair Cost" type="number" value={damage.cost} onChange={(e) => setDamage((p) => ({ ...p, cost: e.target.value }))} />
              </>
            )}
          </div>
        )}

        {(booking.status === 'completed' || booking.status === 'damage' || booking.status === 'closed') && (
          <div className="mt-4 rounded-lg bg-[var(--cv-elevated)] p-4 text-sm">
            <p>Rental: {formatCurrency(rentalTotal)}</p>
            <p>Platform Fee: {formatCurrency(fee)} (15%)</p>
            <p className="font-semibold text-[var(--cv-success)]">Your Earnings: {formatCurrency(earnings)}</p>
            {booking.status === 'damage' && booking.damageCost ? (
              <>
                <p className="mt-2">Damage Charge: {formatCurrency(booking.damageCost)}</p>
                <p>Deposit Refund: {formatCurrency(booking.deposit - booking.damageCost)}</p>
              </>
            ) : (
              <p className="mt-2">Security Deposit Refund: {formatCurrency(booking.deposit)}</p>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {booking.status === 'pending' && (
            <>
              <Button roleColor="rental" onClick={() => update(booking.id, 'confirmed')}>Confirm Booking</Button>
              <Button variant="danger" onClick={() => update(booking.id, 'closed')}>Decline</Button>
              <Button variant="secondary" roleColor="rental">Contact Renter</Button>
            </>
          )}
          {booking.status === 'confirmed' && (
            <Button roleColor="rental" onClick={() => update(booking.id, 'rented')}>Mark as Rented</Button>
          )}
          {booking.status === 'rented' && (
            <>
              <Button roleColor="rental" onClick={() => update(booking.id, 'return')}>Initiate Return</Button>
              <Button variant="secondary" roleColor="rental">Send Reminder</Button>
            </>
          )}
          {booking.status === 'return' && (
            <>
              <Button
                roleColor="rental"
                onClick={() => {
                  if (damage.level === 'none') update(booking.id, 'completed')
                  else update(booking.id, 'damage', { damageCost: Number(damage.cost) || 3500 })
                }}
              >
                Confirm Return
              </Button>
            </>
          )}
          {(booking.status === 'completed' || booking.status === 'damage') && (
            <Button roleColor="rental" onClick={() => update(booking.id, 'closed')}>Request Renter Rating</Button>
          )}
          {booking.status === 'closed' && (
            <p className="text-sm text-[var(--cv-muted)]">Booking closed & rated. All payments settled.</p>
          )}
        </div>
      </Card>
    </div>
    </OverviewShell>
  )
}

function GenericOrders({ role }: { role: Role }) {
  const navigate = useNavigate()
  const cta = PRIMARY_CTA[role]
  const label = ORDERS_LABEL[role]
  const serviceBookings = useServiceBookings().bookings

  const rows = useMemo(() => {
    const stored =
      role === 'service' || role === 'buyer'
        ? serviceBookings.map((b: ServiceBookingRecord) => ({
            id: b.confirmationCode,
            party: role === 'service' ? 'New client' : b.provider,
            item: `${b.serviceTitle} · ${b.date}`,
            amount: formatCurrency(b.amount),
            status: 'accepted' as BadgeStatus,
          }))
        : []

    if (role === 'buyer') {
      const staticRows = [
        { id: 'PO-8801', party: 'Green Valley', item: 'Tomatoes 100kg', amount: formatCurrency(8450), status: 'delivered' as BadgeStatus },
        { id: 'PO-8800', party: 'Fresh Farm', item: 'Potatoes 200kg', amount: formatCurrency(14200), status: 'shipped' as BadgeStatus },
        { id: 'PO-8795', party: 'Organic Roots', item: 'Lettuce 40kg', amount: formatCurrency(3200), status: 'pending' as BadgeStatus },
      ]
      return [...stored, ...staticRows]
    }
    if (role === 'service') {
      const staticRows = [
        { id: 'AP-219', party: 'Village A', item: 'Soil Testing', amount: formatCurrency(800), status: 'pending' as BadgeStatus },
        { id: 'AP-218', party: 'Workshop DEF', item: 'Equipment Repair', amount: formatCurrency(2400), status: 'completed' as BadgeStatus },
      ]
      return stored.length > 0 ? [...stored, ...staticRows] : [
        { id: 'AP-220', party: 'Farmer ABC', item: 'Farm Consultancy', amount: formatCurrency(1500), status: 'accepted' as BadgeStatus },
        ...staticRows,
      ]
    }
    return [
      { id: 'EN-101', party: 'Student A', item: 'Organic Farming 101', amount: formatCurrency(999), status: 'active' as BadgeStatus },
      { id: 'EN-100', party: 'Student B', item: 'IPM Techniques', amount: formatCurrency(799), status: 'completed' as BadgeStatus },
      { id: 'EN-099', party: 'Student C', item: 'Soil Health Mastery', amount: formatCurrency(1299), status: 'pending' as BadgeStatus },
    ]
  }, [role, serviceBookings])

  const copy = ORDERS_PAGE_COPY[role]

  return (
    <OverviewShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
      actions={
        <>
          <ExportButton onClick={() => undefined} />
          <PrimaryActionButton onClick={() => navigate(cta.path)}>{cta.label}</PrimaryActionButton>
        </>
      }
    >
      <OverviewPanel>
        <OverviewTabs
          tabs={[{ value: 'all', label: `All ${label.toLowerCase()}`, count: rows.length }]}
          value="all"
          onChange={() => undefined}
        />
        <OverviewToolbar>
          <FilterSelect
            label="Status"
            value="all"
            onChange={() => undefined}
            options={[
              { value: 'all', label: 'Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
          <OverviewSearch placeholder="Search" />
        </OverviewToolbar>
        <DataTable>
          <DataTableHead columns={['ID', 'Party', 'Item', 'Amount', 'Status']} />
          <DataTableBody>
            {rows.map((r) => (
              <DataTableRow key={r.id}>
                <DataTableCell mono>{r.id}</DataTableCell>
                <DataTableCell strong>{r.party}</DataTableCell>
                <DataTableCell className="text-[var(--cv-muted)]">{r.item}</DataTableCell>
                <DataTableCell strong>{r.amount}</DataTableCell>
                <DataTableCell>
                  <Badge status={r.status} />
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
        <OverviewFooter countLabel={`${rows.length} results`} disablePrev disableNext />
      </OverviewPanel>
    </OverviewShell>
  )
}

export function OrdersPage() {
  const role = useAppStore((s) => s.user?.activeRole ?? 'seller')
  if (role === 'seller') return <SellerOrders />
  if (role === 'rental') return <RentalBookings />
  return <GenericOrders role={role} />
}

