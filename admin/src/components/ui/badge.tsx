import { cn } from '@/lib/cn'
import {
  CheckCircle2,
  Clock3,
  MinusCircle,
  Flag,
  type LucideIcon,
} from 'lucide-react'

const variants = {
  success: 'bg-status-success/15 text-status-success',
  warning: 'bg-status-warning/15 text-status-warning',
  error: 'bg-status-error/15 text-status-error',
  pending: 'bg-status-pending/15 text-status-pending',
  info: 'bg-status-info/15 text-status-info',
  accent: 'bg-brand-lime/15 text-brand-lime',
  default: 'bg-bg-surfaceAlt text-text-secondary',
} as const

export type BadgeVariant = keyof typeof variants

const defaultIcons: Partial<Record<keyof typeof variants, LucideIcon>> = {
  success: CheckCircle2,
  warning: Clock3,
  error: MinusCircle,
  pending: Clock3,
  info: Flag,
  accent: CheckCircle2,
}

export function Badge({
  children,
  variant = 'default',
  className,
  showIcon = false,
  icon: IconProp,
}: {
  children: React.ReactNode
  variant?: keyof typeof variants
  className?: string
  showIcon?: boolean
  icon?: LucideIcon
}) {
  const Icon = IconProp ?? (showIcon ? defaultIcons[variant] : undefined)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden /> : null}
      {children}
    </span>
  )
}
