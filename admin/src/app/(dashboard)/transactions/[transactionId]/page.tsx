'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getTransactionById, reverseTransaction, retryTransaction } from '@/lib/api/transactions.api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/loading'
import { formatInr } from '@/lib/utils'

export default function TransactionDetailPage() {
  const { transactionId } = useParams<{ transactionId: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const { data: tx, isLoading } = useQuery({
    queryKey: ['transactions', transactionId],
    queryFn: () => getTransactionById(transactionId),
  })

  const reverseMut = useMutation({
    mutationFn: () => reverseTransaction(transactionId),
    onSuccess: () => {
      toast.success('Reversed')
      void qc.invalidateQueries({ queryKey: ['transactions', transactionId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
  const retryMut = useMutation({
    mutationFn: () => retryTransaction(transactionId),
    onSuccess: () => {
      toast.success('Retried')
      void qc.invalidateQueries({ queryKey: ['transactions', transactionId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) return <Skeleton className="h-64 w-full" />
  if (!tx) return <p>Transaction not found</p>

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => router.push('/transactions')}>← Back</Button>
      <div className="flex items-center gap-3">
        <h2 className="font-mono text-2xl font-bold text-text-primary">{tx.id}</h2>
        <Badge>{tx.status}</Badge>
      </div>
      <Card>
        <CardHeader><h2 className="font-semibold">Details</h2></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <div><p className="text-text-muted">Type</p><p>{tx.type}</p></div>
          <div><p className="text-text-muted">Amount</p><p className="font-mono text-lg">{formatInr(tx.amount)}</p></div>
          <div><p className="text-text-muted">From</p><p>{tx.fromName}</p></div>
          <div><p className="text-text-muted">To</p><p>{tx.toName}</p></div>
          <div><p className="text-text-muted">Gateway</p><p className="font-mono">{tx.gatewayReference}</p></div>
          <div><p className="text-text-muted">Method</p><p>{tx.paymentMethod}</p></div>
          <div><p className="text-text-muted">Created</p><p>{new Date(tx.createdAt).toLocaleString('en-IN')}</p></div>
        </CardContent>
      </Card>
      <div className="flex gap-2">
        {tx.status === 'failed' ? <Button loading={retryMut.isPending} onClick={() => retryMut.mutate()}>Retry</Button> : null}
        {tx.status === 'completed' ? <Button variant="danger" loading={reverseMut.isPending} onClick={() => reverseMut.mutate()}>Reverse</Button> : null}
      </div>
    </div>
  )
}
