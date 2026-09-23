import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/appStore'
import { Button } from '../common/Button'
import {
  FilterSelect,
  OverviewSearch,
  OverviewShell,
  OverviewToolbar,
  PrimaryActionButton,
  StatusPill,
} from '../common/DataOverview'

const LISTINGS = [
  { name: 'Organic Tomatoes', seller: 'Green Valley', verified: true, price: 45, mandi: 42.8, unit: 'kg', grade: 'A', distance: '18 km', rating: 4.8, photo: '🍅' },
  { name: 'Fresh Potatoes', seller: 'Fresh Farm', verified: true, price: 28, mandi: 25.2, unit: 'kg', grade: 'A', distance: '32 km', rating: 4.6, photo: '🥔' },
  { name: 'Onions', seller: 'Deccan Organics', verified: false, price: 22, mandi: 24.1, unit: 'kg', grade: 'B', distance: '41 km', rating: 4.5, photo: '🧅' },
  { name: 'Lettuce', seller: 'Organic Roots', verified: true, price: 60, mandi: 58, unit: 'kg', grade: 'A', distance: '12 km', rating: 4.9, photo: '🥬' },
  { name: 'Carrots', seller: 'Sunrise Agro', verified: true, price: 35, mandi: 33, unit: 'kg', grade: 'A', distance: '27 km', rating: 4.7, photo: '🥕' },
  { name: 'Soybean', seller: 'Wardha FPO', verified: true, price: 4300, mandi: 4320, unit: 'qtl', grade: 'FAQ', distance: '64 km', rating: 4.4, photo: '🌱' },
]

export function DiscoverPage() {
  const navigate = useNavigate()
  const setPage = useAppStore((s) => s.setCurrentPage)
  const [query, setQuery] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState('all')
  const [sort, setSort] = useState('relevance')

  const rows = useMemo(() => {
    let next = LISTINGS.filter((item) => {
      const q = query.trim().toLowerCase()
      const match = !q || item.name.toLowerCase().includes(q) || item.seller.toLowerCase().includes(q)
      const ver = verifiedOnly === 'all' || item.verified
      return match && ver
    })
    if (sort === 'price') next = [...next].sort((a, b) => a.price - b.price)
    if (sort === 'distance') next = [...next].sort((a, b) => parseInt(a.distance) - parseInt(b.distance))
    if (sort === 'rating') next = [...next].sort((a, b) => b.rating - a.rating)
    return next
  }, [query, verifiedOnly, sort])

  return (
    <OverviewShell
      title="Discover"
      subtitle="Source produce with price vs mandi modal, verified sellers, and distance."
      actions={
        <PrimaryActionButton
          onClick={() => {
            setPage('rfqs')
            navigate('/dashboard/rfqs')
          }}
        >
          New RFQ
        </PrimaryActionButton>
      }
    >
      <div className="cv-dashboard-panel overflow-hidden">
        <OverviewToolbar>
          <OverviewSearch placeholder="Search produce, sellers, or mandi prices..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <FilterSelect
              label="Verified"
              value={verifiedOnly}
              onChange={setVerifiedOnly}
              options={[
                { value: 'all', label: 'All sellers' },
                { value: 'verified', label: 'Verified only' },
              ]}
            />
            <FilterSelect
              label="Sort"
              value={sort}
              onChange={setSort}
              options={[
                { value: 'relevance', label: 'Relevance' },
                { value: 'price', label: 'Price' },
                { value: 'distance', label: 'Distance' },
                { value: 'rating', label: 'Rating' },
              ]}
            />
          </div>
        </OverviewToolbar>
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((item) => {
            const delta = ((item.price - item.mandi) / item.mandi) * 100
            const above = delta > 0
            return (
              <article key={item.name} className="flex flex-col rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-3xl" aria-hidden>
                    {item.photo}
                  </span>
                  {item.verified ? <StatusPill tone="success">Verified</StatusPill> : <StatusPill tone="neutral">Unverified</StatusPill>}
                </div>
                <h3 className="mt-3 text-base font-semibold text-[var(--cv-text)]">{item.name}</h3>
                <p className="text-xs text-[var(--cv-muted)]">
                  {item.seller} · {item.distance} · {item.rating} ★
                </p>
                <p className="mt-3 text-lg font-semibold tabular-nums">
                  ₹ {item.price.toLocaleString('en-IN')} / {item.unit}
                </p>
                <p className="text-xs text-[var(--cv-muted)]">
                  vs mandi modal {above ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}% · AGMARKNET
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => navigate('/dashboard/orders')}>
                    Add to cart
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/messages')}>
                    Message
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </OverviewShell>
  )
}
