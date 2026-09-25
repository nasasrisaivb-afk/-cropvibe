import { cn } from '@/lib/cn'
import { relativeTime } from '@/lib/utils'

export interface TimelineItem {
  id: string
  title: React.ReactNode
  meta?: React.ReactNode
  body?: React.ReactNode
  at: string
  tone?: 'default' | 'accent' | 'error' | 'warning' | 'success'
}

const dot: Record<NonNullable<TimelineItem['tone']>, string> = {
  default: 'bg-text-muted',
  accent: 'bg-brand-lime',
  error: 'bg-status-error',
  warning: 'bg-status-warning',
  success: 'bg-status-success',
}

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-text-muted">No activity recorded yet.</p>
  }
  return (
    <ol className={cn('relative space-y-4', className)}>
      <span className="absolute bottom-2 left-[5px] top-2 w-px bg-border-default" aria-hidden />
      {items.map((item) => (
        <li key={item.id} className="relative flex gap-3 pl-0">
          <span
            className={cn('relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full ring-4 ring-bg-surface', dot[item.tone ?? 'default'])}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-text-primary">{item.title}</p>
            <p className="mt-0.5 text-xs text-text-muted">
              {item.meta ? <>{item.meta} · </> : null}
              <time dateTime={item.at} title={new Date(item.at).toLocaleString('en-IN')}>
                {relativeTime(item.at)}
              </time>
            </p>
            {item.body ? <div className="mt-1.5 text-sm text-text-secondary">{item.body}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
