import type { ComponentType, SVGProps } from 'react'
import { cn } from '../../utils/format'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

interface DashboardStatCardProps {
  title: string
  value: string
  hint?: string
  positive?: boolean
  icon: IconType
  featured?: boolean
  className?: string
}

export function DashboardStatCard({
  title,
  value,
  hint,
  positive,
  icon: Icon,
  featured,
  className,
}: DashboardStatCardProps) {
  return (
    <div className={cn('cv-stat-card p-5', featured && 'cv-stat-card--featured', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-[var(--cv-sidebar-muted)]">{title}</p>
          <p className="mt-2 text-[1.5rem] font-semibold tracking-tight text-[var(--cv-sidebar-text)] sm:text-[1.65rem]">
            {value}
          </p>
          {hint ? (
            <p
              className={cn(
                'mt-1.5 text-[13px] font-medium',
                positive === true && 'text-[var(--cv-success)]',
                positive === false && 'text-[var(--cv-danger)]',
                positive === undefined && 'text-[var(--cv-sidebar-muted)]',
              )}
            >
              {positive === true ? '↑ ' : positive === false ? '↓ ' : ''}
              {hint}
            </p>
          ) : null}
        </div>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            featured
              ? 'bg-[var(--cv-sidebar-logo-bg)] text-[var(--cv-sidebar-logo-fg)]'
              : 'bg-[var(--cv-sidebar-search-bg)] text-[var(--cv-sidebar-muted)]',
          )}
          aria-hidden
        >
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
      </div>
    </div>
  )
}
