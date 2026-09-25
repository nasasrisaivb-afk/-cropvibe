import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { IconTile } from './icon-tile'
import { Skeleton } from './loading'

export type StatTone = 'default' | 'accent' | 'success' | 'warning' | 'error' | 'info'

const toneText: Record<StatTone, string> = {
  default: 'text-text-secondary',
  accent: 'text-brand-lime',
  success: 'text-status-success',
  warning: 'text-status-warning',
  error: 'text-status-error',
  info: 'text-status-info',
}

/**
 * Figma "KYC verification | widgets" tile (329×127): label, big value, icon tile, supporting line.
 */
export function StatCard({
  label,
  value,
  icon,
  hint,
  hintTone = 'default',
  trend,
  href,
  loading,
  highlight,
  className,
}: {
  label: string
  value: React.ReactNode
  icon?: LucideIcon
  hint?: React.ReactNode
  hintTone?: StatTone
  /** Percent change; positive renders as up (success), negative as down (error). */
  trend?: number
  href?: string
  loading?: boolean
  /** Accent-filled icon tile — use for at most one tile per row. */
  highlight?: boolean
  className?: string
}) {
  const body = (
    <div
      className={cn(
        'flex h-full min-h-[127px] flex-col justify-between gap-3 rounded-xl border border-border-default bg-bg-surface p-5 shadow-card',
        href && 'transition-colors hover:border-border-strong hover:bg-bg-surfaceHover',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        {icon ? <IconTile icon={icon} active={highlight} /> : null}
      </div>
      <div>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="tabular text-[1.75rem] font-bold leading-none tracking-tight text-text-primary">
            {value}
          </p>
        )}
        {trend != null || hint ? (
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {trend != null ? (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-semibold',
                  trend >= 0 ? 'text-status-success' : 'text-status-error'
                )}
              >
                {trend >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />
                )}
                {Math.abs(trend)}%
                <span className="sr-only">{trend >= 0 ? 'increase' : 'decrease'}</span>
              </span>
            ) : null}
            {hint ? <span className={toneText[hintTone]}>{hint}</span> : null}
          </p>
        ) : null}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block rounded-xl">
        {body}
      </Link>
    )
  }
  return body
}

export function StatGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}>{children}</div>
}
