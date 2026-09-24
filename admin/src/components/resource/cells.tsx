import Link from 'next/link'
import { Check, Minus, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/cn'
import type { CellKind, StatusDef } from '@/lib/resources/types'
import {
  formatDate,
  formatDateTime,
  formatInr,
  formatNumber,
  relativeTime,
  titleCase,
} from '@/lib/utils'

/** One renderer for table cells and drawer fields so formatting never drifts between them. */
export function CellValue({
  kind = 'text',
  value,
  sub,
  statusMap,
  href,
}: {
  kind?: CellKind
  value: unknown
  sub?: string
  statusMap?: Record<string, StatusDef>
  href?: string
}) {
  if (value == null || value === '') {
    return <span className="text-text-muted">—</span>
  }

  let content: React.ReactNode
  switch (kind) {
    case 'strong':
      content = <span className="font-medium text-text-primary">{String(value)}</span>
      break
    case 'mono':
      content = <span className="font-mono text-[13px] text-text-secondary">{String(value)}</span>
      break
    case 'money':
      content = <span className="tabular font-medium text-text-primary">{formatInr(Number(value))}</span>
      break
    case 'number':
      content = <span className="tabular">{formatNumber(Number(value))}</span>
      break
    case 'percent':
      content = <span className="tabular">{Number(value).toFixed(Number(value) % 1 === 0 ? 0 : 1)}%</span>
      break
    case 'date':
      content = <span className="whitespace-nowrap text-text-secondary">{formatDate(String(value))}</span>
      break
    case 'datetime':
      content = <span className="whitespace-nowrap text-text-secondary">{formatDateTime(String(value))}</span>
      break
    case 'relative':
      content = (
        <time
          dateTime={String(value)}
          title={formatDateTime(String(value))}
          className="whitespace-nowrap text-text-secondary"
        >
          {relativeTime(String(value))}
        </time>
      )
      break
    case 'status': {
      const def = statusMap?.[String(value)]
      content = (
        <Badge variant={def?.tone ?? 'default'} showIcon={def != null && def.tone !== 'default' && def.tone !== 'accent'}>
          {def?.label ?? titleCase(String(value))}
        </Badge>
      )
      break
    }
    case 'person':
      content = (
        <span className="flex min-w-0 items-center gap-2.5">
          <Avatar name={String(value)} size="sm" />
          <span className="min-w-0">
            <span className="block truncate font-medium text-text-primary">{String(value)}</span>
            {sub ? <span className="block truncate text-xs text-text-muted">{sub}</span> : null}
          </span>
        </span>
      )
      break
    case 'rating':
      content = (
        <span className="tabular inline-flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-brand-lime text-brand-lime" aria-hidden />
          {Number(value).toFixed(1)}
        </span>
      )
      break
    case 'progress':
    case 'meter': {
      const pct = Math.max(0, Math.min(100, Number(value)))
      const warn = kind === 'meter' && pct >= 90
      content = (
        <span className="flex min-w-[7rem] items-center gap-2">
          <span
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-elevated"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span
              className={cn('block h-full rounded-full', warn ? 'bg-status-warning' : 'bg-brand-lime')}
              style={{ width: `${pct}%` }}
            />
          </span>
          <span className="tabular w-9 text-right text-xs text-text-secondary">{Math.round(pct)}%</span>
        </span>
      )
      break
    }
    case 'tags': {
      const tags = Array.isArray(value) ? (value as string[]) : [String(value)]
      content = (
        <span className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((t) => (
            <span key={t} className="rounded-md bg-bg-surfaceAlt px-1.5 py-0.5 text-xs text-text-secondary">
              {t}
            </span>
          ))}
          {tags.length > 3 ? <span className="text-xs text-text-muted">+{tags.length - 3}</span> : null}
        </span>
      )
      break
    }
    case 'boolean':
      content = value ? (
        <span className="inline-flex items-center gap-1 text-status-success">
          <Check className="h-4 w-4" aria-hidden /> Yes
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-text-muted">
          <Minus className="h-4 w-4" aria-hidden /> No
        </span>
      )
      break
    default:
      content = <span className="text-text-primary">{String(value)}</span>
  }

  const withSub =
    sub && kind !== 'person' ? (
      <span className="block min-w-0">
        <span className="block">{content}</span>
        <span className="block truncate text-xs text-text-muted">{sub}</span>
      </span>
    ) : (
      content
    )

  if (href) {
    return (
      <Link
        href={href}
        onClick={(e) => e.stopPropagation()}
        className="rounded underline-offset-4 hover:text-brand-lime hover:underline"
      >
        {withSub}
      </Link>
    )
  }
  return <>{withSub}</>
}

/** Plain-text version of a value, used for search, CSV export and sorting. */
export function plainValue(value: unknown): string | number {
  if (value == null) return ''
  if (Array.isArray(value)) return value.join('; ')
  if (typeof value === 'number') return value
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}
