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
  featured?: boolean
}

export function MetricCard({
  title,
  value,
  delta,
  deltaPositive,
  subtitle,
  icon,
  className = '',
  featured,
}: MetricCardProps) {
  const trendColor =
    deltaPositive === true
      ? 'text-[var(--cv-success)]'
      : deltaPositive === false
        ? 'text-[var(--cv-danger)]'
        : 'text-[var(--cv-muted)]'

  return (
    <section className={cn('cv-stat-card p-6', featured && 'cv-stat-card--featured', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-[var(--cv-muted)]">{title}</p>
          <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-[var(--cv-text)]">
            {value}
          </p>
          {subtitle ? <p className="mt-1 text-[13px] text-[var(--cv-muted)]">{subtitle}</p> : null}
          {delta ? (
            <p className={cn('mt-2 text-[13px] font-medium', trendColor)}>
              {deltaPositive === true ? '↑ ' : deltaPositive === false ? '↓ ' : ''}
              {delta}
            </p>
          ) : null}
        </div>
        {icon ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--cv-elevated)] text-[var(--cv-primary)]">
            {icon}
          </span>
        ) : null}
      </div>
    </section>
  )
}
