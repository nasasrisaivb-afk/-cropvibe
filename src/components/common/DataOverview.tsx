import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  MinusCircleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import { cn } from '../../utils/format'
import { Button } from './Button'

/* ── Status pill (Payux-style soft badges, CropVibe colors) ── */

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary'

const TONE: Record<StatusTone, { wrap: string; Icon: typeof CheckCircleIcon }> = {
  success: {
    wrap: 'bg-[var(--color-success-soft)] text-[var(--cv-success)]',
    Icon: CheckCircleIcon,
  },
  warning: {
    wrap: 'bg-[var(--color-warning-soft)] text-[var(--cv-warning)]',
    Icon: ClockIcon,
  },
  danger: {
    wrap: 'bg-[color-mix(in_srgb,var(--cv-danger)_12%,transparent)] text-[var(--cv-danger)]',
    Icon: MinusCircleIcon,
  },
  info: {
    wrap: 'bg-[var(--color-info-soft)] text-[var(--cv-info)]',
    Icon: ClockIcon,
  },
  neutral: {
    wrap: 'bg-[var(--cv-elevated)] text-[var(--cv-muted)]',
    Icon: MinusCircleIcon,
  },
  primary: {
    wrap: 'bg-[var(--cv-primary-soft)] text-[var(--cv-primary)]',
    Icon: CheckCircleIcon,
  },
}

export function StatusPill({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: StatusTone
  children: ReactNode
  className?: string
}) {
  const { wrap, Icon } = TONE[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide max-lg:tracking-wider',
        wrap,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
      {children}
    </span>
  )
}

/* ── Page shell ── */

export function OverviewShell({
  title,
  subtitle,
  eyebrow,
  actions,
  children,
  className,
}: {
  title: string
  subtitle?: string
  eyebrow?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-5 lg:space-y-6', className)}>
      <section className="cv-dashboard-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[13px] font-medium text-[var(--cv-sidebar-muted)]">{eyebrow}</p>
          ) : null}
          <h1
            className={cn(
              'font-semibold tracking-tight text-[var(--cv-sidebar-text)] text-[26px] sm:text-[28px]',
              eyebrow ? 'mt-1' : '',
            )}
          >
            {title}
          </h1>
          {subtitle ? <p className="mt-1.5 text-sm text-[var(--cv-sidebar-muted)]">{subtitle}</p> : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2 shrink-0 max-lg:w-full max-lg:[&>button]:flex-1 max-lg:[&>a]:flex-1 max-lg:[&>div]:flex-1">
            {actions}
          </div>
        ) : null}
      </section>
      {children}
    </div>
  )
}

export function OverviewPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('cv-dashboard-panel overflow-hidden', className)}>
      {children}
    </div>
  )
}

/* ── Underline tabs ── */

export function OverviewTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: string; label: string; count?: number }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="cv-overview-tabs flex gap-0 overflow-x-auto border-b border-[var(--cv-border)] px-1">
      {tabs.map((tab) => {
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative shrink-0 px-4 py-3 text-sm font-medium transition',
              active
                ? 'text-[var(--cv-text)]'
                : 'text-[var(--cv-muted)] hover:text-[var(--cv-text)]',
            )}
          >
            {tab.label}
            {typeof tab.count === 'number' ? (
              <span className="ml-1.5 text-[var(--cv-muted)]">{tab.count}</span>
            ) : null}
            {active ? (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[var(--cv-nav-active-fg)]" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

/* ── Filter toolbar ── */

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
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <label className={cn('relative inline-flex min-w-0 flex-1 sm:flex-none', className)}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring w-full appearance-none rounded-lg border border-[var(--cv-border)] bg-[var(--cv-surface)] py-2.5 pl-3 pr-8 text-sm font-medium text-[var(--cv-text)] sm:w-auto sm:py-2"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--cv-muted)]" />
    </label>
  )
}

export function OverviewSearch(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props
  return (
    <label className={cn('relative min-w-0 flex-1 sm:max-w-xs', className)}>
      <span className="sr-only">Search</span>
      <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cv-muted)]" />
      <input
        type="search"
        className="focus-ring w-full rounded-lg border border-[var(--cv-border)] bg-[var(--cv-surface)] py-2 pl-9 pr-3 text-sm text-[var(--cv-text)] placeholder:text-[var(--cv-muted)]"
        {...rest}
      />
    </label>
  )
}

export function OverviewToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="cv-overview-toolbar flex flex-col gap-3 border-b border-[var(--cv-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  )
}

export function ExportButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-[var(--cv-border)] bg-[var(--cv-surface)] px-3 py-2 text-sm font-medium text-[var(--cv-text)] transition hover:bg-[var(--cv-elevated)]',
        props.className,
      )}
      {...props}
    >
      <ArrowDownTrayIcon className="h-4 w-4" strokeWidth={1.75} />
      {props.children ?? 'Export'}
    </button>
  )
}

export function PrimaryActionButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <Button className="!rounded-lg" onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  )
}

/* ── Data table ── */

export function DataTable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('cv-data-table-wrap cv-responsive-table-wrap overflow-x-auto', className)}>
      <table className="cv-data-table cv-responsive-table min-w-full text-left text-sm">{children}</table>
    </div>
  )
}

export function DataTableHead({ columns }: { columns: string[] }) {
  return (
    <thead>
      <tr className="border-b border-[var(--cv-border)]">
        {columns.map((col) => (
          <th
            key={col}
            className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--cv-muted)]"
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
  )
}

export function DataTableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>
}

export function DataTableRow({
  children,
  className,
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <tr
      className={cn(
        'border-b border-[var(--cv-border)] last:border-0 transition',
        onClick && 'cursor-pointer hover:bg-[var(--cv-elevated)]/60',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function DataTableCell({
  children,
  className,
  mono,
  strong,
}: {
  children: ReactNode
  className?: string
  mono?: boolean
  strong?: boolean
}) {
  return (
    <td
      className={cn(
        'px-4 py-3.5 align-middle text-[var(--cv-text)]',
        mono && 'font-mono text-[13px]',
        strong && 'font-semibold',
        className,
      )}
    >
      {children}
    </td>
  )
}

export function OverviewFooter({
  countLabel,
  onPrev,
  onNext,
  disablePrev,
  disableNext,
}: {
  countLabel: string
  onPrev?: () => void
  onNext?: () => void
  disablePrev?: boolean
  disableNext?: boolean
}) {
  return (
    <div className="cv-overview-footer flex items-center justify-between gap-3 border-t border-[var(--cv-border)] px-4 py-3">
      <p className="text-sm text-[var(--cv-muted)]">{countLabel}</p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disablePrev}
          onClick={onPrev}
          className="rounded-full border border-[var(--cv-border)] px-3.5 py-1.5 text-sm font-medium text-[var(--cv-text)] disabled:opacity-40 hover:bg-[var(--cv-elevated)] lg:rounded-lg"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={disableNext}
          onClick={onNext}
          className="rounded-full border border-[var(--cv-border)] px-3.5 py-1.5 text-sm font-medium text-[var(--cv-text)] disabled:opacity-40 hover:bg-[var(--cv-elevated)] lg:rounded-lg"
        >
          Next
        </button>
      </div>
    </div>
  )
}
