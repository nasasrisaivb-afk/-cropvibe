import { useEffect, useRef, useState, type RefObject } from 'react'
import { Button } from '../common/Button'
import { FormInput } from '../common/FormInput'
import { Select } from '../common/Select'
import {
  countActiveFilters,
  DEFAULT_FILTERS,
  getLocations,
  getSearchSuggestions,
} from './serviceCatalogUtils'
import type { ServiceCategory, ServiceFiltersState } from './serviceCatalogTypes'

interface Props {
  category: ServiceCategory
  filters: ServiceFiltersState
  onChange: (next: ServiceFiltersState) => void
}

function SearchField({
  value,
  onChange,
  suggestions,
  showSuggestions,
  onShowSuggestions,
  onPick,
  inputRef,
}: {
  value: string
  onChange: (v: string) => void
  suggestions: { label: string; count: number }[]
  showSuggestions: boolean
  onShowSuggestions: (v: boolean) => void
  onPick: (label: string) => void
  inputRef: RefObject<HTMLDivElement | null>
}) {
  return (
    <div ref={inputRef} className="relative lg:col-span-1">
      <FormInput
        label="Search"
        placeholder="Search services, providers, topics..."
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          onShowSuggestions(true)
        }}
        onFocus={() => onShowSuggestions(true)}
        aria-autocomplete="list"
        aria-expanded={showSuggestions && suggestions.length > 0}
      />
      {showSuggestions && suggestions.length > 0 ? (
        <ul
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-[10px] border border-[var(--cv-border)] bg-[var(--cv-surface)] py-1 shadow-[var(--shadow-lg)]"
          role="listbox"
        >
          {suggestions.map((s) => (
            <li key={s.label} role="option">
              <button
                type="button"
                className="focus-ring w-full px-3 py-2 text-left text-sm hover:bg-[var(--cv-primary)]/10"
                onClick={() => onPick(s.label)}
              >
                {s.label}
                <span className="ml-2 text-xs text-[var(--cv-muted)]">({s.count})</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function ServiceFilters({ category, filters, onChange }: Props) {
  const [showMobile, setShowMobile] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const locations = getLocations(category)
  const suggestions = getSearchSuggestions(category, filters.q)
  const activeCount = countActiveFilters(filters)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const set = (patch: Partial<ServiceFiltersState>) => onChange({ ...filters, ...patch })
  const clearAll = () => onChange({ ...DEFAULT_FILTERS, q: filters.q })

  const chips: { key: keyof ServiceFiltersState; label: string }[] = []
  if (filters.status !== 'all') chips.push({ key: 'status', label: `Status: ${filters.status}` })
  if (filters.location !== 'all') chips.push({ key: 'location', label: filters.location })
  if (filters.price !== 'all') chips.push({ key: 'price', label: `Price: ${filters.price}` })
  if (filters.sort !== 'newest') chips.push({ key: 'sort', label: `Sort: ${filters.sort}` })

  const statusOptions = [
    { value: 'all', label: 'All statuses' },
    { value: 'open', label: 'Open for booking' },
    { value: 'booked', label: 'Fully booked' },
    { value: 'paused', label: 'Paused' },
  ]

  const priceOptions = [
    { value: 'all', label: 'All prices' },
    { value: 'under1k', label: 'Under ₹1,000' },
    { value: '1k-5k', label: '₹1,000 – ₹5,000' },
    { value: '5k-10k', label: '₹5,000 – ₹10,000' },
    { value: 'above10k', label: 'Above ₹10,000' },
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Rating: High to Low' },
    { value: 'popular', label: 'Most booked' },
  ]

  const locationOptions = [
    { value: 'all', label: 'All locations' },
    ...locations.map((l) => ({ value: l, label: l })),
  ]

  return (
    <div className="space-y-3">
      <div className="cv-dashboard-panel hidden gap-3 p-4 lg:grid lg:grid-cols-5 lg:items-end">
        <SearchField
          value={filters.q}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          inputRef={searchRef}
          onChange={(q) => set({ q })}
          onShowSuggestions={setShowSuggestions}
          onPick={(label) => {
            set({ q: label })
            setShowSuggestions(false)
          }}
        />
        <Select label="Status" value={filters.status} onChange={(e) => set({ status: e.target.value })} options={statusOptions} />
        <Select label="Location" value={filters.location} onChange={(e) => set({ location: e.target.value })} options={locationOptions} />
        <Select
          label="Price"
          value={filters.price}
          onChange={(e) => set({ price: e.target.value as ServiceFiltersState['price'] })}
          options={priceOptions}
        />
        <Select
          label="Sort"
          value={filters.sort}
          onChange={(e) => set({ sort: e.target.value as ServiceFiltersState['sort'] })}
          options={sortOptions}
        />
      </div>

      <div className="cv-dashboard-panel space-y-3 p-4 lg:hidden">
        <SearchField
          value={filters.q}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          inputRef={searchRef}
          onChange={(q) => set({ q })}
          onShowSuggestions={setShowSuggestions}
          onPick={(label) => {
            set({ q: label })
            setShowSuggestions(false)
          }}
        />
        <Button
          type="button"
          variant="secondary"
          fullWidth
          aria-expanded={showMobile}
          onClick={() => setShowMobile((v) => !v)}
        >
          Filters{activeCount > 0 ? ` (${activeCount})` : ''}
        </Button>
        {showMobile ? (
          <div className="grid gap-3 border-t border-[var(--cv-border)] pt-3">
            <Select label="Status" value={filters.status} onChange={(e) => set({ status: e.target.value })} options={statusOptions} />
            <Select label="Location" value={filters.location} onChange={(e) => set({ location: e.target.value })} options={locationOptions} />
            <Select
              label="Price"
              value={filters.price}
              onChange={(e) => set({ price: e.target.value as ServiceFiltersState['price'] })}
              options={priceOptions}
            />
            <Select
              label="Sort"
              value={filters.sort}
              onChange={(e) => set({ sort: e.target.value as ServiceFiltersState['sort'] })}
              options={sortOptions}
            />
          </div>
        ) : null}
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-xs font-medium text-[var(--cv-muted)]">Active filters:</span>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className="focus-ring rounded-full border border-[var(--cv-border)] bg-[var(--cv-surface)] px-2.5 py-1 text-xs font-medium"
              onClick={() => set({ [chip.key]: DEFAULT_FILTERS[chip.key] } as Partial<ServiceFiltersState>)}
            >
              {chip.label} ✕
            </button>
          ))}
          <button type="button" className="text-xs font-semibold text-[var(--cv-primary)]" onClick={clearAll}>
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  )
}
