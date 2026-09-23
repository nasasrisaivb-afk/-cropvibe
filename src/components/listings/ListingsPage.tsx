import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LISTINGS_LABEL, PRIMARY_CTA } from '../../config/navigation'
import { useAppStore } from '../../store/appStore'
import type { Role } from '../../types/roles'
import { formatCurrency } from '../../utils/format'
import { Button } from '../common/Button'
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
  StatusPill,
  type StatusTone,
} from '../common/DataOverview'

const SELLER_PRODUCTS = [
  { name: 'Organic Tomatoes', stock: '45 kg', price: 45, status: 'active' as const, orders: 28 },
  { name: 'Fresh Potatoes', stock: '120 kg', price: 28, status: 'active' as const, orders: 19 },
  { name: 'Carrots', stock: '5 kg', price: 35, status: 'pending' as const, orders: 8 },
  { name: 'Lettuce', stock: '30 kg', price: 60, status: 'active' as const, orders: 12 },
]

const BUYER_SUPPLIERS = [
  { name: 'Green Valley', location: 'Nashik', rating: 4.8, product: 'Tomatoes', moq: '50 kg', price: 42, delivery: '1–2 days' },
  { name: 'Fresh Farm', location: 'Pune', rating: 4.6, product: 'Potatoes', moq: '100 kg', price: 26, delivery: 'Same day' },
  { name: 'Organic Roots', location: 'Hyderabad', rating: 4.9, product: 'Lettuce', moq: '20 kg', price: 55, delivery: '2 days' },
  { name: 'Sunrise Agro', location: 'Ahmedabad', rating: 4.5, product: 'Grains', moq: '200 kg', price: 32, delivery: '3 days' },
  { name: 'Deccan Organics', location: 'Solapur', rating: 4.7, product: 'Onions', moq: '80 kg', price: 22, delivery: '1 day' },
  { name: 'Konkan Fresh', location: 'Ratnagiri', rating: 4.4, product: 'Mangoes', moq: '40 kg', price: 90, delivery: '2–3 days' },
]

const RENTAL_EQUIPMENT = [
  { name: 'Tractor #1', status: 'Available', next: 'Ready now', rate: 2500 },
  { name: 'Tractor #2', status: 'Booked', next: 'Return today', rate: 2500 },
  { name: 'Harvester #1', status: 'Booked', next: 'Return in 3 days', rate: 4500 },
  { name: 'Rotavator #1', status: 'Available', next: 'Ready', rate: 1800 },
  { name: 'Sprayer #1', status: 'Available', next: 'Ready', rate: 800 },
  { name: 'Sprayer #2', status: 'Maintenance', next: 'Due tomorrow', rate: 800 },
]

const RENTAL_CATEGORY_LINKS = [
  { label: 'Equipment', path: '/dashboard/equipment' },
  { label: 'Operators', path: '/dashboard/operators' },
  { label: 'Maintenance', path: '/dashboard/maintenance' },
  { label: 'Calendar', path: '/dashboard/calendar' },
] as const

const SERVICES = [
  { name: 'Farm Consultancy', bookings: 34, revenue: 123600, rating: 4.9 },
  { name: 'Soil Testing', bookings: 18, revenue: 78300, rating: 4.8 },
  { name: 'Equipment Repair', bookings: 12, revenue: 45200, rating: 4.7 },
  { name: 'Drone Spraying', bookings: 9, revenue: 32450, rating: 4.6 },
]

const COURSES = [
  { name: 'Organic Farming 101', students: 35, completion: 78, rating: 4.8 },
  { name: 'IPM Techniques', students: 24, completion: 65, rating: 4.5 },
  { name: 'Soil Health Mastery', students: 18, completion: 82, rating: 4.9 },
  { name: 'Crop Planning 101', students: 28, completion: 71, rating: 4.4 },
]

const EQUIPMENT_TONE: Record<string, StatusTone> = {
  Available: 'success',
  Booked: 'info',
  Maintenance: 'warning',
}

function useListingChrome(role: Role) {
  const navigate = useNavigate()
  const cta = PRIMARY_CTA[role]
  const kycPending = useAppStore((s) => s.user?.kycStatus === 'pending')
  const locked = Boolean(kycPending && role !== 'buyer')
  return {
    title: `${LISTINGS_LABEL[role]} overview`,
    subtitle: `Manage and discover offerings for your ${role} workspace.`,
    actions: (
      <>
        <ExportButton onClick={() => undefined} />
        <PrimaryActionButton disabled={locked} onClick={() => navigate(cta.path)}>
          {cta.label}
        </PrimaryActionButton>
      </>
    ),
  }
}

function RentalEquipmentView() {
  const navigate = useNavigate()
  const chrome = useListingChrome('rental')
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')

  const tabs = useMemo(() => {
    const counts = {
      all: RENTAL_EQUIPMENT.length,
      Available: RENTAL_EQUIPMENT.filter((i) => i.status === 'Available').length,
      Booked: RENTAL_EQUIPMENT.filter((i) => i.status === 'Booked').length,
      Maintenance: RENTAL_EQUIPMENT.filter((i) => i.status === 'Maintenance').length,
    }
    return [
      { value: 'all', label: 'All equipment', count: counts.all },
      { value: 'Available', label: 'Available', count: counts.Available },
      { value: 'Booked', label: 'Booked', count: counts.Booked },
      { value: 'Maintenance', label: 'Maintenance', count: counts.Maintenance },
    ]
  }, [])

  const items = useMemo(() => {
    return RENTAL_EQUIPMENT.filter((item) => {
      const matchTab = tab === 'all' || item.status === tab
      const q = query.trim().toLowerCase()
      const matchQ =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        item.next.toLowerCase().includes(q)
      return matchTab && matchQ
    })
  }, [query, tab])

  return (
    <OverviewShell title={chrome.title} subtitle={chrome.subtitle} actions={chrome.actions}>
      <div className="mb-3 flex flex-wrap gap-2">
        {RENTAL_CATEGORY_LINKS.map((link) => (
          <button
            key={link.path}
            type="button"
            onClick={() => navigate(link.path)}
            className="rounded-lg border border-[var(--cv-border)] bg-[var(--cv-surface)] px-3 py-1.5 text-sm font-medium text-[var(--cv-text)] transition hover:bg-[var(--cv-elevated)]"
          >
            {link.label}
          </button>
        ))}
      </div>

      <OverviewPanel>
        <OverviewTabs tabs={tabs} value={tab} onChange={setTab} />
        <OverviewToolbar>
          <div className="flex flex-wrap gap-2">
            <FilterSelect
              label="Status"
              value={tab}
              onChange={setTab}
              options={[
                { value: 'all', label: 'Status' },
                { value: 'Available', label: 'Available' },
                { value: 'Booked', label: 'Booked' },
                { value: 'Maintenance', label: 'Maintenance' },
              ]}
            />
            <FilterSelect
              label="Category"
              value="all"
              onChange={() => undefined}
              options={[
                { value: 'all', label: 'Category' },
                { value: 'machinery', label: 'Machinery' },
                { value: 'tools', label: 'Tools' },
              ]}
            />
          </div>
          <OverviewSearch
            placeholder="Search equipment"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </OverviewToolbar>

        <DataTable>
          <DataTableHead columns={['Equipment', 'Schedule', 'Rate', 'Status']} />
          <DataTableBody>
            {items.map((item) => (
              <DataTableRow key={item.name}>
                <DataTableCell strong>{item.name}</DataTableCell>
                <DataTableCell className="text-[var(--cv-muted)]">{item.next}</DataTableCell>
                <DataTableCell strong>
                  {formatCurrency(item.rate)}
                  <span className="font-medium text-[var(--cv-muted)]">/day</span>
                </DataTableCell>
                <DataTableCell>
                  <StatusPill tone={EQUIPMENT_TONE[item.status] ?? 'neutral'}>
                    {item.status}
                  </StatusPill>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>

        <OverviewFooter
          countLabel={`${items.length} result${items.length === 1 ? '' : 's'}`}
          disablePrev
          disableNext
        />
      </OverviewPanel>
    </OverviewShell>
  )
}

export function ListingsPage() {
  const role = useAppStore((s) => s.user?.activeRole ?? 'seller')
  const navigate = useNavigate()
  const [buyerQuery, setBuyerQuery] = useState('')
  const [sellerTab, setSellerTab] = useState('all')
  const [saved, setSaved] = useState<string[]>(['Organic Roots'])
  const chrome = useListingChrome(role)

  const suppliers = useMemo(
    () =>
      BUYER_SUPPLIERS.filter(
        (s) =>
          !buyerQuery ||
          s.name.toLowerCase().includes(buyerQuery.toLowerCase()) ||
          s.product.toLowerCase().includes(buyerQuery.toLowerCase()) ||
          s.location.toLowerCase().includes(buyerQuery.toLowerCase()),
      ),
    [buyerQuery],
  )

  const sellerItems = useMemo(() => {
    if (sellerTab === 'all') return SELLER_PRODUCTS
    return SELLER_PRODUCTS.filter((p) => p.status === sellerTab)
  }, [sellerTab])

  if (role === 'rental') {
    return <RentalEquipmentView />
  }

  if (role === 'seller') {
    return (
      <OverviewShell title={chrome.title} subtitle={chrome.subtitle} actions={chrome.actions}>
        <OverviewPanel>
          <OverviewTabs
            tabs={[
              { value: 'all', label: 'All products', count: SELLER_PRODUCTS.length },
              {
                value: 'active',
                label: 'Active',
                count: SELLER_PRODUCTS.filter((p) => p.status === 'active').length,
              },
              {
                value: 'pending',
                label: 'Pending',
                count: SELLER_PRODUCTS.filter((p) => p.status === 'pending').length,
              },
            ]}
            value={sellerTab}
            onChange={setSellerTab}
          />
          <OverviewToolbar>
            <FilterSelect
              label="Status"
              value={sellerTab}
              onChange={setSellerTab}
              options={[
                { value: 'all', label: 'Status' },
                { value: 'active', label: 'Active' },
                { value: 'pending', label: 'Pending' },
              ]}
            />
            <OverviewSearch placeholder="Search products" />
          </OverviewToolbar>
          <DataTable>
            <DataTableHead columns={['Product', 'Stock', 'Price', 'Orders', 'Status', '']} />
            <DataTableBody>
              {sellerItems.map((p) => (
                <DataTableRow key={p.name}>
                  <DataTableCell strong>{p.name}</DataTableCell>
                  <DataTableCell className="text-[var(--cv-muted)]">{p.stock}</DataTableCell>
                  <DataTableCell strong>{formatCurrency(p.price)}/kg</DataTableCell>
                  <DataTableCell>{p.orders}</DataTableCell>
                  <DataTableCell>
                    <StatusPill tone={p.status === 'active' ? 'success' : 'warning'}>
                      {p.status === 'active' ? 'Active' : 'Pending'}
                    </StatusPill>
                  </DataTableCell>
                  <DataTableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/create')}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/orders')}>
                        Orders
                      </Button>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
          <OverviewFooter countLabel={`${sellerItems.length} results`} disablePrev disableNext />
        </OverviewPanel>
      </OverviewShell>
    )
  }

  if (role === 'buyer') {
    return (
      <OverviewShell title={chrome.title} subtitle={chrome.subtitle} actions={chrome.actions}>
        <OverviewPanel>
          <OverviewTabs
            tabs={[{ value: 'all', label: 'All suppliers', count: BUYER_SUPPLIERS.length }]}
            value="all"
            onChange={() => undefined}
          />
          <OverviewToolbar>
            <FilterSelect
              label="Location"
              value="all"
              onChange={() => undefined}
              options={[
                { value: 'all', label: 'Location' },
                ...Array.from(new Set(BUYER_SUPPLIERS.map((s) => s.location))).map((loc) => ({
                  value: loc,
                  label: loc,
                })),
              ]}
            />
            <OverviewSearch
              placeholder="Search by product, supplier, or location"
              value={buyerQuery}
              onChange={(e) => setBuyerQuery(e.target.value)}
            />
          </OverviewToolbar>
          <DataTable>
            <DataTableHead columns={['Supplier', 'Product', 'MOQ', 'Price', 'ETA', '']} />
            <DataTableBody>
              {suppliers.map((s) => {
                const isSaved = saved.includes(s.name)
                return (
                  <DataTableRow key={s.name}>
                    <DataTableCell>
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-xs text-[var(--cv-muted)]">
                        {s.location} · {s.rating}★
                      </p>
                    </DataTableCell>
                    <DataTableCell>{s.product}</DataTableCell>
                    <DataTableCell className="text-[var(--cv-muted)]">{s.moq}</DataTableCell>
                    <DataTableCell strong>{formatCurrency(s.price)}/kg</DataTableCell>
                    <DataTableCell className="text-[var(--cv-muted)]">{s.delivery}</DataTableCell>
                    <DataTableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            setSaved((prev) =>
                              isSaved ? prev.filter((n) => n !== s.name) : [...prev, s.name],
                            )
                          }
                        >
                          {isSaved ? 'Saved' : 'Save'}
                        </Button>
                        <Button size="sm" onClick={() => navigate('/dashboard/create')}>
                          Request quote
                        </Button>
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                )
              })}
            </DataTableBody>
          </DataTable>
          <OverviewFooter countLabel={`${suppliers.length} results`} disablePrev disableNext />
        </OverviewPanel>
      </OverviewShell>
    )
  }

  if (role === 'service') {
    return (
      <OverviewShell title={chrome.title} subtitle={chrome.subtitle} actions={chrome.actions}>
        <OverviewPanel>
          <OverviewTabs
            tabs={[{ value: 'all', label: 'All services', count: SERVICES.length }]}
            value="all"
            onChange={() => undefined}
          />
          <OverviewToolbar>
            <FilterSelect
              label="Sort"
              value="revenue"
              onChange={() => undefined}
              options={[
                { value: 'revenue', label: 'Revenue' },
                { value: 'bookings', label: 'Bookings' },
              ]}
            />
            <OverviewSearch placeholder="Search services" />
          </OverviewToolbar>
          <DataTable>
            <DataTableHead columns={['Service', 'Bookings', 'Rating', 'Revenue', '']} />
            <DataTableBody>
              {SERVICES.map((s) => (
                <DataTableRow key={s.name}>
                  <DataTableCell strong>{s.name}</DataTableCell>
                  <DataTableCell>{s.bookings}</DataTableCell>
                  <DataTableCell>{s.rating}★</DataTableCell>
                  <DataTableCell strong>{formatCurrency(s.revenue)}</DataTableCell>
                  <DataTableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/calendar')}>
                        Calendar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/create')}>
                        Edit
                      </Button>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
          <OverviewFooter countLabel={`${SERVICES.length} results`} disablePrev disableNext />
        </OverviewPanel>
      </OverviewShell>
    )
  }

  return (
    <OverviewShell title={chrome.title} subtitle={chrome.subtitle} actions={chrome.actions}>
      <OverviewPanel>
        <OverviewTabs
          tabs={[{ value: 'all', label: 'All courses', count: COURSES.length }]}
          value="all"
          onChange={() => undefined}
        />
        <OverviewToolbar>
          <FilterSelect
            label="Sort"
            value="students"
            onChange={() => undefined}
            options={[
              { value: 'students', label: 'Students' },
              { value: 'rating', label: 'Rating' },
            ]}
          />
          <OverviewSearch placeholder="Search courses" />
        </OverviewToolbar>
        <DataTable>
          <DataTableHead columns={['Course', 'Students', 'Completion', 'Rating', '']} />
          <DataTableBody>
            {COURSES.map((c) => (
              <DataTableRow key={c.name}>
                <DataTableCell strong>{c.name}</DataTableCell>
                <DataTableCell>{c.students}</DataTableCell>
                <DataTableCell>{c.completion}%</DataTableCell>
                <DataTableCell>{c.rating}★</DataTableCell>
                <DataTableCell>
                  <Button size="sm" variant="secondary">
                    View
                  </Button>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
        <OverviewFooter countLabel={`${COURSES.length} results`} disablePrev disableNext />
      </OverviewPanel>
    </OverviewShell>
  )
}
