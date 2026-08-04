'use client'

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './button'
import { Skeleton } from './loading'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T, unknown>[]
  loading?: boolean
  pageSize?: number
  total?: number
  page?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  enableSelection?: boolean
  onSelectionChange?: (rows: T[]) => void
  onRowClick?: (row: T) => void
  emptyMessage?: string
}

export function DataTable<T>({
  data,
  columns,
  loading,
  pageSize = 50,
  total,
  page = 1,
  onPageChange,
  onPageSizeChange,
  enableSelection,
  onSelectionChange,
  onRowClick,
  emptyMessage = 'No results found',
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const serverPaged = total != null && onPageChange != null

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    enableRowSelection: enableSelection,
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater
      setRowSelection(next)
      if (onSelectionChange) {
        const selected = Object.keys(next)
          .filter((k) => next[k])
          .map((k) => data[Number(k)])
          .filter(Boolean) as T[]
        onSelectionChange(selected)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: serverPaged ? undefined : getPaginationRowModel(),
    manualPagination: serverPaged,
    pageCount: serverPaged ? Math.ceil((total ?? 0) / pageSize) : undefined,
    initialState: { pagination: { pageSize } },
  })

  const totalRows = total ?? data.length
  const currentPage = serverPaged ? page : table.getState().pagination.pageIndex + 1
  const size = serverPaged ? pageSize : table.getState().pagination.pageSize
  const pageCount = Math.max(1, Math.ceil(totalRows / size))

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-border-default">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-bg-surfaceAlt text-text-secondary">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border-default">
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-medium">
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className={cn(
                          'inline-flex items-center gap-1',
                          header.column.getCanSort() && 'cursor-pointer hover:text-text-primary'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() ? (
                          header.column.getIsSorted() === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                          )
                        ) : null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border-light">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b border-border-light transition-colors hover:bg-bg-surfaceHover',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-text-primary">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-text-secondary">
        <p>
          Showing {(currentPage - 1) * size + 1}–
          {Math.min(currentPage * size, totalRows)} of {totalRows}
        </p>
        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded-md border border-border-default bg-bg-surface px-2 text-text-primary"
            value={size}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (onPageSizeChange) onPageSizeChange(v)
              else table.setPageSize(v)
            }}
            aria-label="Rows per page"
          >
            {[25, 50, 100, 250].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Previous page"
            disabled={currentPage <= 1}
            onClick={() =>
              serverPaged ? onPageChange?.(currentPage - 1) : table.previousPage()
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[4rem] text-center">
            {currentPage} / {pageCount}
          </span>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Next page"
            disabled={currentPage >= pageCount}
            onClick={() => (serverPaged ? onPageChange?.(currentPage + 1) : table.nextPage())}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
