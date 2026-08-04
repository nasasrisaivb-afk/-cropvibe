'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import type { ColumnDef } from '@tanstack/react-table'
import { getContentItems } from '@/lib/api/content.api'
import type { ContentItem } from '@/lib/types'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { relativeTime } from '@/lib/utils'

export default function ContentPage() {
  const router = useRouter()
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['content', { type, status, page }],
    queryFn: () => getContentItems({ type, status, page }),
  })

  const columns = useMemo<ColumnDef<ContentItem>[]>(
    () => [
      { accessorKey: 'title', header: 'Title' },
      { accessorKey: 'type', header: 'Type' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === 'published'
                ? 'success'
                : row.original.status === 'scheduled'
                  ? 'info'
                  : 'default'
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
      { accessorKey: 'version', header: 'Version' },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ row }) => relativeTime(row.original.updatedAt),
      },
      { accessorKey: 'updatedBy', header: 'By' },
    ],
    []
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content</h1>
        <Button onClick={() => router.push('/content/new')}>New content</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {['all', 'banner', 'play_store', 'legal', 'faq'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`rounded-full px-3 py-1 text-xs ${
              type === t ? 'bg-brand-lime text-text-inverse' : 'bg-bg-surfaceAlt text-text-secondary'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {['all', 'draft', 'published', 'scheduled'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1 text-xs ${
              status === s ? 'bg-brand-lime/20 text-brand-limeAlt' : 'text-text-muted'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        total={data?.total}
        page={page}
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/content/${row.id}`)}
      />
    </div>
  )
}
