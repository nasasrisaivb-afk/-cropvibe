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
        'rounded-xl border border-[var(--cv-border)] bg-[var(--cv-surface)] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[box-shadow,transform] duration-150 ease-out max-lg:rounded-[20px] max-lg:p-5 max-lg:shadow-[0_4px_16px_rgba(15,23,42,0.05)]',
        interactive && 'cv-card-interactive hover:shadow-[var(--shadow-md)]',
        className,
      )}
      {...rest}
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
