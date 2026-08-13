import type { ReactNode } from 'react'
import { cn } from '../../utils/format'

interface LargeTitleProps {
  title: string
  subtitle?: string
  eyebrow?: string
  actions?: ReactNode
  collapsed?: boolean
  className?: string
}

/** Pointsale-style page hero panel */
export function LargeTitle({
  title,
  subtitle,
  eyebrow,
  actions,
  className,
}: LargeTitleProps) {
  return (
    <section
      className={cn(
        'cv-dashboard-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6',
        className,
      )}
      data-large-title
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[13px] font-medium text-[var(--cv-sidebar-muted)]">{eyebrow}</p>
        ) : null}
        <h1
          className={cn(
            'font-semibold tracking-tight text-[var(--cv-sidebar-text)]',
            eyebrow ? 'mt-1' : '',
            'text-[26px] sm:text-[28px]',
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1.5 max-w-xl text-sm text-[var(--cv-sidebar-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2 max-lg:w-full">{actions}</div> : null}
    </section>
  )
}
