import type { ReactNode } from 'react'
import { cn } from '../../utils/format'

interface LargeTitleProps {
  title: string
  subtitle?: string
  eyebrow?: string
  actions?: ReactNode
  /** When true (header collapsed), large title is visually reduced / hidden for sticky compact title */
  collapsed?: boolean
  className?: string
}

/**
 * Apple-style large title for primary landing screens.
 * Pair with DashboardHeader compact title driven by scroll collapse.
 */
export function LargeTitle({
  title,
  subtitle,
  eyebrow,
  actions,
  collapsed = false,
  className,
}: LargeTitleProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        'transition-[opacity,transform] duration-200 ease-out',
        collapsed && 'pointer-events-none -translate-y-1 opacity-0 sm:opacity-100 sm:translate-y-0',
        className,
      )}
      data-large-title
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[13px] font-medium text-[var(--cv-muted)]">{eyebrow}</p>
        ) : null}
        <h1
          className={cn(
            'mt-1 font-semibold tracking-[-0.02em] text-[var(--cv-text)]',
            'text-[28px] leading-9 sm:text-[32px] sm:leading-10',
          )}
        >
          {title}
        </h1>
        {subtitle ? <p className="mt-2 max-w-xl text-sm text-[var(--cv-muted)]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}
