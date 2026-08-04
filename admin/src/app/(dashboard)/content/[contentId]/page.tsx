'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { getContentById, saveContent, publishContent } from '@/lib/api/content.api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/loading'
import { Badge } from '@/components/ui/badge'

const schema = z.object({
  title: z.string().min(1),
  type: z.enum(['banner', 'play_store', 'legal', 'faq']),
  status: z.enum(['draft', 'published', 'scheduled']),
  body: z.string().min(1),
  scheduledAt: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function ContentDetailPage() {
  const { contentId } = useParams<{ contentId: string }>()
  const isNew = contentId === 'new'
  const router = useRouter()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['content', contentId],
    queryFn: () => (isNew ? Promise.resolve(null) : getContentById(contentId)),
    enabled: !isNew,
  })

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: data
      ? {
          title: data.title,
          type: data.type,
          status: data.status,
          body: data.body,
          scheduledAt: data.scheduledAt?.slice(0, 16),
        }
      : {
          title: '',
          type: 'banner',
          status: 'draft',
          body: '',
        },
  })

  const saveMut = useMutation({
    mutationFn: (payload: FormData) =>
      saveContent(isNew ? null : contentId, {
        ...payload,
        scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt).toISOString() : undefined,
      }),
    onSuccess: (item) => {
      toast.success('Saved')
      void qc.invalidateQueries({ queryKey: ['content'] })
      if (isNew) router.replace(`/content/${item.id}`)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const publishMut = useMutation({
    mutationFn: () => publishContent(contentId),
    onSuccess: () => {
      toast.success('Published')
      void qc.invalidateQueries({ queryKey: ['content'] })
    },
  })

  if (!isNew && isLoading) return <Skeleton className="h-96 w-full" />

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => router.push('/content')}>← Back</Button>
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">{isNew ? 'New content' : data?.title}</h1>
        {data ? <Badge>v{data.version}</Badge> : null}
      </div>
      <Card>
        <CardHeader><h2 className="font-semibold">Editor</h2></CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit((d) => saveMut.mutate(d))} className="space-y-4">
            <input {...form.register('title')} placeholder="Title" className="h-10 w-full rounded-lg border border-border-default bg-bg-base px-3 text-sm" />
            <div className="flex flex-wrap gap-3">
              <select {...form.register('type')} className="h-9 rounded-lg border border-border-default bg-bg-base px-3 text-sm">
                <option value="banner">Banner</option>
                <option value="play_store">Play Store</option>
                <option value="legal">Legal</option>
                <option value="faq">FAQ</option>
              </select>
              <select {...form.register('status')} className="h-9 rounded-lg border border-border-default bg-bg-base px-3 text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
              <input type="datetime-local" {...form.register('scheduledAt')} className="h-9 rounded-lg border border-border-default bg-bg-base px-3 text-sm" />
            </div>
            <textarea
              {...form.register('body')}
              className="min-h-[240px] w-full rounded-lg border border-border-default bg-bg-base p-3 font-mono text-sm"
              placeholder="Rich text / HTML body…"
            />
            <div className="rounded-lg border border-border-light bg-bg-surfaceAlt p-4 text-sm">
              <p className="mb-2 text-text-muted">Preview</p>
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: form.watch('body') || '<p class="text-text-muted">Empty</p>' }}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={saveMut.isPending}>Save</Button>
              {!isNew ? (
                <Button type="button" variant="secondary" loading={publishMut.isPending} onClick={() => publishMut.mutate()}>
                  Publish now
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
