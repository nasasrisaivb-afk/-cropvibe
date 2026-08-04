import type { ReactNode } from 'react'
import { cn } from '../../utils/format'

interface CardProps {
  children: ReactNode
  title?: string
  subtitle?: string
  className?: string
  interactive?: boolean
}

export function Card({ children, title, subtitle, className = '', interactive = false }: CardProps) {
  return (
    <section
      className={cn(
        'rounded-[16px] border border-[var(--cv-border)] bg-[var(--cv-surface)] p-6 shadow-[var(--shadow-sm)] transition-[box-shadow,transform] duration-150 ease-out',
        interactive && 'cv-card-interactive hover:shadow-[var(--shadow-md)]',
        className,
      )}
    >
      {title ? (
        <div className={subtitle ? 'mb-4' : 'mb-4'}>
          <h3 className="text-base font-medium text-[var(--cv-text)]">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-[var(--cv-muted)]">{subtitle}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}
