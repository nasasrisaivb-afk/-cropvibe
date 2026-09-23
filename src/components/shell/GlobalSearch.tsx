import { useMemo, useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import type { PageId } from '../../types/roles'

const RESULTS = [
  { group: 'My items', label: 'Organic Tomatoes listing', page: 'listings' as PageId },
  { group: 'My items', label: 'Tractor #1', page: 'equipment' as PageId },
  { group: 'Orders / bookings', label: 'PO-8922 · Green Mart', page: 'orders' as PageId },
  { group: 'Orders / bookings', label: 'BK-4418 · Sprayer #1', page: 'bookings' as PageId },
  { group: 'People', label: 'FreshStore (buyer)', page: 'orders' as PageId },
  { group: 'Crops & mandi', label: 'Tomato · Nagpur mandi', page: 'mandi' as PageId },
  { group: 'Schemes', label: 'PM-KISAN instalment window', page: 'schemes' as PageId },
  { group: 'Help', label: 'How payouts work', page: 'help' as PageId },
]

export function GlobalSearch({
  placeholder,
  onNavigate,
}: {
  placeholder: string
  onNavigate: (page: PageId) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return RESULTS
    return RESULTS.filter((item) => item.label.toLowerCase().includes(q) || item.group.toLowerCase().includes(q))
  }, [query])
  const groups = [...new Set(filtered.map((item) => item.group))]

  return (
    <div className="relative mx-2 max-w-md flex-1">
      <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cv-muted)]" />
      <input
        aria-label="Search"
        className="focus-ring cv-input w-full py-2.5 pl-10 pr-3 text-sm"
        placeholder={placeholder}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 160)}
      />
      {open ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-surface)] py-2 shadow-[var(--shadow-lg)]">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-sm text-[var(--cv-muted)]">No matches. Try a crop, order ID, or scheme.</p>
          ) : (
            groups.map((group) => (
              <div key={group} className="mb-1">
                <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--cv-muted)]">
                  {group}
                </p>
                {filtered
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className="flex w-full px-3 py-2 text-left text-sm text-[var(--cv-text)] hover:bg-[var(--cv-elevated)]"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onNavigate(item.page)
                        setOpen(false)
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}
