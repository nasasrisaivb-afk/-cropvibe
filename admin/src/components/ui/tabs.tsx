'use client'

import { cn } from '@/lib/cn'

export interface TabItem {
  value: string
  label: string
  count?: number
}

/** Underline tabs with counts — the KYC queue pattern, reused by every list. */
export function UnderlineTabs({
  tabs,
  value,
  onChange,
  className,
  ariaLabel = 'Filter by status',
}: {
  tabs: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
  ariaLabel?: string
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('scrollbar-none flex gap-0 overflow-x-auto border-b border-border-default px-2', className)}
    >
      {tabs.map((tab) => {
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative shrink-0 px-4 py-3.5 text-sm font-medium transition-colors',
              active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {tab.label}
            {tab.count != null ? (
              <span
                className={cn(
                  'tabular ml-2 rounded-full px-1.5 py-0.5 text-2xs font-semibold',
                  active ? 'bg-brand-lime text-brand-ink' : 'bg-bg-surfaceAlt text-text-muted'
                )}
              >
                {tab.count}
              </span>
            ) : null}
            {active ? (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-lime" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

/** Pill segmented control for switching views/time ranges inside a card. */
export function Segmented({
  options,
  value,
  onChange,
  className,
  ariaLabel,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  className?: string
  ariaLabel?: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn('inline-flex rounded-lg border border-border-default bg-bg-inset p-0.5', className)}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
              active ? 'bg-bg-surfaceAlt text-text-primary shadow-card' : 'text-text-muted hover:text-text-primary'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
