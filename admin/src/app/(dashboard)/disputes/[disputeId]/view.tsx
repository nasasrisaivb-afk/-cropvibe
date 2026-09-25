'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { getDisputeById, resolveDispute, addDisputeNote, updateDisputeStatus } from '@/lib/api/disputes.api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/loading'
import { formatInr, relativeTime } from '@/lib/utils'

const schema = z.object({
  status: z.enum(['new', 'under_investigation', 'awaiting_response', 'resolved', 'escalated']),
  type: z.enum(['refund', 'replacement', 'mediation', 'deny']),
  amount: z.coerce.number().optional(),
  notes: z.string().min(1, 'Resolution notes required'),
  internalNotes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function DisputeDetailPage() {
  const { disputeId } = useParams<{ disputeId: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const [note, setNote] = useState('')

  const { data: dispute, isLoading } = useQuery({
    queryKey: ['disputes', disputeId],
    queryFn: () => getDisputeById(disputeId),
  })

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: dispute
      ? {
          status: dispute.status,
          type: dispute.resolution?.type ?? 'refund',
          amount: dispute.resolution?.amount ?? dispute.amount,
          notes: dispute.resolution?.notes ?? '',
          internalNotes: '',
        }
      : undefined,
  })

  const resolveMut = useMutation({
    mutationFn: (data: FormData) =>
      resolveDispute(disputeId, {
        type: data.type,
        amount: data.amount,
        notes: data.notes,
        internalNotes: data.internalNotes,
        decidedBy: 'Raj Kumar',
        status: data.status,
      }),
    onSuccess: () => {
      toast.success('Resolution submitted')
      void qc.invalidateQueries({ queryKey: ['disputes'] })
      router.push('/disputes')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const noteMut = useMutation({
    mutationFn: () => addDisputeNote(disputeId, note, 'Raj Kumar'),
    onSuccess: () => {
      toast.success('Note added')
      setNote('')
      void qc.invalidateQueries({ queryKey: ['disputes', disputeId] })
    },
  })

  const assignMut = useMutation({
    mutationFn: () =>
      updateDisputeStatus(disputeId, 'under_investigation', 'admin-1', 'Raj Kumar'),
    onSuccess: () => {
      toast.success('Assigned to you')
      void qc.invalidateQueries({ queryKey: ['disputes', disputeId] })
    },
  })

  if (isLoading) return <Skeleton className="h-96 w-full" />
  if (!dispute) return <p>Dispute not found</p>

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => router.push('/disputes')}>
        ← Back
      </Button>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold text-text-primary">Dispute #{dispute.id}</h2>
        <Badge variant="warning">{dispute.status.replace(/_/g, ' ')}</Badge>
        <Button size="sm" variant="secondary" loading={assignMut.isPending} onClick={() => assignMut.mutate()}>
          Reassign to Me
        </Button>
      </div>

      <Card>
        <CardContent className="grid gap-3 pt-5 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div><p className="text-text-muted">Amount</p><p className="font-mono text-lg">{formatInr(dispute.amount)}</p></div>
          <div><p className="text-text-muted">Reason</p><p>{dispute.reason}</p></div>
          <div><p className="text-text-muted">Buyer</p><p>{dispute.buyerName}</p></div>
          <div><p className="text-text-muted">Seller</p><p>{dispute.sellerName}</p></div>
          <div><p className="text-text-muted">Transaction</p><p className="font-mono">{dispute.transactionId}</p></div>
          <div><p className="text-text-muted">Created</p><p>{relativeTime(dispute.createdAt)}</p></div>
          <div><p className="text-text-muted">Assigned</p><p>{dispute.assignedToName ?? '—'}</p></div>
          <div><p className="text-text-muted">SLA deadline</p><p>{new Date(dispute.slaDeadline).toLocaleDateString('en-IN')}</p></div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Card>
            <CardHeader><h2 className="font-semibold">Evidence</h2></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {dispute.evidence.map((e) => (
                <div key={e.id} className="rounded-lg border border-border-light p-3 text-sm">
                  <p className="font-medium">{e.label}</p>
                  <p className="text-xs text-text-muted">{e.submittedBy} · {relativeTime(e.submittedAt)}</p>
                  {e.type === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.url} alt={e.label} className="mt-2 rounded-md" />
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="font-semibold">Communication Log</h2></CardHeader>
            <CardContent className="space-y-3">
              {dispute.messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-lg border p-3 text-sm ${
                    m.kind === 'internal'
                      ? 'border-brand-lime/30 bg-brand-lime/5'
                      : 'border-border-light'
                  }`}
                >
                  <p className="text-xs text-text-muted">
                    [{m.kind.toUpperCase()}] {m.author} ({m.role}) · {relativeTime(m.createdAt)}
                  </p>
                  <p className="mt-1">{m.body}</p>
                </div>
              ))}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add internal note…"
                className="cv-control h-20 py-2"
              />
              <Button size="sm" disabled={!note.trim()} loading={noteMut.isPending} onClick={() => noteMut.mutate()}>
                Add internal note
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-2 h-fit">
          <CardHeader><h2 className="font-semibold">Resolution</h2></CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit((d) => resolveMut.mutate(d))} className="space-y-3">
              <label className="block text-sm text-text-secondary">
                Status
                <select {...form.register('status')} className="mt-1 cv-control h-9">
                  <option value="new">New</option>
                  <option value="under_investigation">Under Investigation</option>
                  <option value="awaiting_response">Awaiting Response</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                </select>
              </label>
              <fieldset className="space-y-2 text-sm">
                <legend className="text-text-secondary">Resolution type</legend>
                {(['refund', 'replacement', 'mediation', 'deny'] as const).map((t) => (
                  <label key={t} className="flex items-center gap-2 capitalize">
                    <input type="radio" value={t} {...form.register('type')} />
                    {t}
                  </label>
                ))}
              </fieldset>
              <label className="block text-sm text-text-secondary">
                Amount (INR)
                <input type="number" {...form.register('amount')} className="mt-1 cv-control h-9 font-mono" />
              </label>
              <textarea {...form.register('notes')} placeholder="Resolution notes (visible to parties)" className="cv-control h-24 py-2" />
              {form.formState.errors.notes ? <p className="text-xs text-status-error">{form.formState.errors.notes.message}</p> : null}
              <textarea {...form.register('internalNotes')} placeholder="Internal notes" className="cv-control h-20 py-2" />
              <Button type="submit" className="w-full" loading={resolveMut.isPending}>
                Submit Resolution
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
