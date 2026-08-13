import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/format'

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  title?: string
  subtitle?: string
  className?: string
  interactive?: boolean
}

export function Card({
  children,
  title,
  subtitle,
  className = '',
  interactive = false,
  ...rest
}: CardProps) {
  return (
    <section
      className={cn(
        'cv-dashboard-panel p-6 max-lg:p-5',
        interactive && 'cv-card-interactive transition-[box-shadow,transform] duration-150 ease-out hover:shadow-[var(--shadow-md)]',
        className,
      )}
      {...rest}
    >
      {title ? (
        <div className={subtitle ? 'mb-4' : 'mb-4'}>
          <h3 className="text-[15px] font-semibold text-[var(--cv-sidebar-text)]">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-[var(--cv-sidebar-muted)]">{subtitle}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}
