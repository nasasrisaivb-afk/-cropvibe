'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

function pageWindow(current: number, count: number): (number | '…')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)
  const pages: (number | '…')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(count - 1, current + 1)
  if (start > 2) pages.push('…')
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < count - 1) pages.push('…')
  pages.push(count)
  return pages
}

/** Figma "Pagination / Group" — sits in its own card under the table. */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizes = [10, 25, 50],
  className,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizes?: number[]
  className?: string
}) {
  const count = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border-default bg-bg-surface px-6 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <p className="tabular text-sm text-text-secondary">
        Showing <span className="font-semibold text-text-primary">{from}</span>–
        <span className="font-semibold text-text-primary">{to}</span> of{' '}
        <span className="font-semibold text-text-primary">{total}</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange ? (
          <label className="mr-2 flex items-center gap-2 text-sm text-text-secondary">
            Rows
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-9 rounded-lg border border-border-default bg-bg-inset px-2 text-sm text-text-primary outline-none focus:border-brand-lime"
            >
              {pageSizes.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-9 items-center gap-1 rounded-lg border border-border-default px-3 text-sm font-medium text-text-secondary transition hover:bg-bg-surfaceHover hover:text-text-primary disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <ul className="hidden items-center gap-1 sm:flex">
          {pageWindow(page, count).map((p, i) =>
            p === '…' ? (
              <li key={`gap-${i}`} className="px-1 text-text-muted" aria-hidden>
                …
              </li>
            ) : (
              <li key={p}>
                <button
                  type="button"
                  onClick={() => onPageChange(p)}
                  aria-current={p === page ? 'page' : undefined}
                  className={cn(
                    'tabular h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition',
                    p === page
                      ? 'bg-brand-lime text-brand-ink'
                      : 'text-text-secondary hover:bg-bg-surfaceHover hover:text-text-primary'
                  )}
                >
                  {p}
                </button>
              </li>
            )
          )}
        </ul>
        <span className="tabular text-sm text-text-secondary sm:hidden">
          {page} / {count}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= count}
          className="flex h-9 items-center gap-1 rounded-lg border border-border-default px-3 text-sm font-medium text-text-secondary transition hover:bg-bg-surfaceHover hover:text-text-primary disabled:pointer-events-none disabled:opacity-40"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  )
}
