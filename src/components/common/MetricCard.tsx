import type { ReactNode } from 'react'
import type { Role } from '../../types/roles'
import { cn } from '../../utils/format'

interface MetricCardProps {
  title: string
  value: string
  delta?: string
  deltaPositive?: boolean
  subtitle?: string
  icon?: ReactNode
  roleColor?: Role
  className?: string
}

export function MetricCard({
  title,
  value,
  delta,
  deltaPositive,
  subtitle,
  icon,
  className = '',
}: MetricCardProps) {
  const trendColor =
    deltaPositive === true
      ? 'text-[var(--cv-success)]'
      : deltaPositive === false
        ? 'text-[var(--cv-danger)]'
        : 'text-[var(--cv-muted)]'

  return (
    <section
      className={cn(
        'rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface)] p-6 shadow-[var(--shadow-sm)] transition-shadow duration-150 ease-out hover:shadow-[var(--shadow-md)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-[var(--cv-muted)]">{title}</p>
          <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-[var(--cv-text)]">
            {value}
          </p>
          {subtitle ? <p className="mt-1 text-[13px] text-[var(--cv-muted)]">{subtitle}</p> : null}
          {delta ? (
            <p className={cn('mt-2 text-[13px]', trendColor)}>
              {deltaPositive === true ? '↑ ' : deltaPositive === false ? '↓ ' : ''}
              {delta}
            </p>
          ) : null}
        </div>
        {icon ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--cv-primary-soft)] text-[var(--cv-primary)]">
            {icon}
          </span>
        ) : null}
      </div>
    </section>
  )
}
