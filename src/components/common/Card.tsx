import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  title?: string
  className?: string
}

export function Card({ children, title, className = '' }: CardProps) {
  return (
    <section
      className={`rounded-xl border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4 shadow-none ${className}`}
    >
      {title ? <h3 className="mb-3 text-base font-semibold text-[var(--cv-text)]">{title}</h3> : null}
      {children}
    </section>
  )
}
