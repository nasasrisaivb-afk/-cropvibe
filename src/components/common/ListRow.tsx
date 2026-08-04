import type { ReactNode } from 'react'
import { cn } from '../../utils/format'

interface ListRowProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  as?: 'div' | 'button'
}

/** Apple-style list row — 56px min height, hairline divider, hover tint */
export function ListRow({ children, onClick, className, as = 'div' }: ListRowProps) {
  const shared = cn(
    'flex min-h-14 w-full items-center gap-3 border-b border-[var(--cv-border)] px-1 py-3 text-left transition-colors duration-150',
    'last:border-b-0 hover:bg-[var(--cv-elevated)]/60',
    onClick && 'cursor-pointer',
    className,
  )

  if (as === 'button' || onClick) {
    return (
      <button type="button" className={shared} onClick={onClick}>
        {children}
      </button>
    )
  }

  return <div className={shared}>{children}</div>
}
