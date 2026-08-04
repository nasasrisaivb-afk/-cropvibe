'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getSubscriptionById,
  getPlans,
  overrideSubscriptionPlan,
  cancelSubscription,
} from '@/lib/api/subscriptions.api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/loading'
import { formatInr } from '@/lib/utils'
import { useState } from 'react'

export default function SubscriptionDetailPage() {
  const { subscriptionId } = useParams<{ subscriptionId: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const [planId, setPlanId] = useState('')

  const { data: sub, isLoading } = useQuery({
    queryKey: ['subscriptions', subscriptionId],
    queryFn: () => getSubscriptionById(subscriptionId),
  })
  const { data: plans } = useQuery({ queryKey: ['plans'], queryFn: getPlans })

  const overrideMut = useMutation({
    mutationFn: () => overrideSubscriptionPlan(subscriptionId, planId || plans?.[0]?.id || ''),
    onSuccess: () => {
      toast.success('Plan overridden')
      void qc.invalidateQueries({ queryKey: ['subscriptions', subscriptionId] })
    },
  })

  const cancelMut = useMutation({
    mutationFn: () => cancelSubscription(subscriptionId, 'Admin override cancel'),
    onSuccess: () => {
      toast.success('Cancelled')
      router.push('/subscriptions')
    },
  })

  if (isLoading) return <Skeleton className="h-64 w-full" />
  if (!sub) return <p>Subscription not found</p>

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => router.push('/subscriptions')}>← Back</Button>
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">{sub.userName}</h1>
        <Badge>{sub.status}</Badge>
      </div>
      <Card>
        <CardHeader><h2 className="font-semibold">Subscription detail</h2></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <div><p className="text-text-muted">Plan</p><p>{sub.planName}</p></div>
          <div><p className="text-text-muted">Price</p><p className="font-mono">{formatInr(sub.monthlyPrice)}</p></div>
          <div><p className="text-text-muted">Start</p><p>{new Date(sub.startDate).toLocaleDateString('en-IN')}</p></div>
          <div><p className="text-text-muted">Renewal</p><p>{new Date(sub.renewalDate).toLocaleDateString('en-IN')}</p></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><h2 className="font-semibold">Override plan</h2></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <select
            value={planId || sub.planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="h-9 rounded-lg border border-border-default bg-bg-base px-3 text-sm"
          >
            {(plans ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {formatInr(p.monthlyPrice)}</option>
            ))}
          </select>
          <Button loading={overrideMut.isPending} onClick={() => overrideMut.mutate()}>Apply override</Button>
          <Button variant="danger" loading={cancelMut.isPending} onClick={() => cancelMut.mutate()}>Cancel subscription</Button>
        </CardContent>
      </Card>
    </div>
  )
}
