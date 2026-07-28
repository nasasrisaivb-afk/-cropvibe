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
      ? 'text-[var(--cv-accent)]'
      : deltaPositive === false
        ? 'text-[var(--cv-danger)]'
        : 'text-[var(--cv-muted)]'

  return (
    <section
      className={cn(
        'rounded-xl border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4 border-l-4 border-l-[var(--cv-accent)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-[var(--cv-muted)]">{title}</p>
          <p className="mt-1 truncate text-2xl font-bold text-[var(--cv-accent)]">{value}</p>
          {subtitle ? <p className="mt-1 text-xs text-[var(--cv-muted)]">{subtitle}</p> : null}
          {delta ? (
            <p className={cn('mt-2 text-xs', trendColor)}>
              {deltaPositive === true ? '↑ ' : deltaPositive === false ? '↓ ' : ''}
              {delta}
            </p>
          ) : null}
        </div>
        {icon ? <span className="shrink-0 text-2xl opacity-70">{icon}</span> : null}
      </div>
    </section>
  )
}
