'use client'

import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface SelectOption {
  value: string
  label: string
}

/** Compact filter select used in list toolbars. The first option acts as the "all" placeholder. */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  className?: string
}) {
  const active = value !== 'all' && value !== ''
  return (
    <label className={cn('relative inline-flex', className)}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-9 w-full appearance-none rounded-lg border bg-bg-inset py-2 pl-3 pr-8 text-sm font-medium outline-none transition-colors focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/25',
          active
            ? 'border-brand-lime/50 text-text-primary'
            : 'border-border-default text-text-secondary hover:border-border-strong'
        )}
      >
        <option value="all">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
    </label>
  )
}
