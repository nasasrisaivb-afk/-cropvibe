import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Rounded icon container used by the Figma sidebar rows (34px) and KPI widgets (44px).
 * `active` fills it with the accent — reserved for the current item or a primary signal.
 */
export function IconTile({
  icon: Icon,
  active,
  size = 'md',
  className,
}: {
  icon: LucideIcon
  active?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const dims = {
    sm: 'h-7 w-7 rounded-md [&>svg]:h-3.5 [&>svg]:w-3.5',
    md: 'h-[34px] w-[34px] rounded-lg [&>svg]:h-[18px] [&>svg]:w-[18px]',
    lg: 'h-11 w-11 rounded-xl [&>svg]:h-5 [&>svg]:w-5',
  }[size]
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center transition-colors',
        dims,
        active
          ? 'bg-brand-lime text-brand-ink'
          : 'border border-border-default bg-bg-surfaceAlt text-text-secondary',
        className
      )}
      aria-hidden
    >
      <Icon strokeWidth={1.9} />
    </span>
  )
}
