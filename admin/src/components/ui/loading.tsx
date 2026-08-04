import { cn } from '@/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-bg-surfaceAlt', className)} />
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-5 w-5 animate-spin rounded-full border-2 border-brand-lime border-t-transparent',
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-default bg-bg-surface px-6 py-16 text-center">
      <p className="text-lg font-semibold text-text-primary">{title}</p>
      {description ? <p className="mt-2 max-w-sm text-sm text-text-secondary">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
