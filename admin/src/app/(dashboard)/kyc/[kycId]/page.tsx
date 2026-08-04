'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react'
import { getKycById, updateKycStatus } from '@/lib/api/kyc.api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/loading'
import { USER_ROLE_LABELS } from '@/lib/types'
import { formatPhone, relativeTime } from '@/lib/utils'

const schema = z.object({
  decision: z.enum(['approved', 'rejected', 'resubmit_requested']),
  reason: z.string().optional(),
  internalNotes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function KycDetailPage() {
  const { kycId } = useParams<{ kycId: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const { data: kyc, isLoading } = useQuery({
    queryKey: ['kyc', kycId],
    queryFn: () => getKycById(kycId),
  })

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { decision: 'approved', reason: '', internalNotes: '' },
  })
  const decision = form.watch('decision')

  const mut = useMutation({
    mutationFn: (data: FormData) =>
      updateKycStatus(kycId, {
        status: data.decision,
        reason: data.reason,
        internalNotes: data.internalNotes,
        adminName: 'Raj Kumar',
      }),
    onSuccess: () => {
      toast.success('KYC decision submitted')
      void qc.invalidateQueries({ queryKey: ['kyc'] })
      router.push('/kyc')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) return <Skeleton className="h-96 w-full" />
  if (!kyc) return <p>KYC not found</p>

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => router.push('/kyc')}>
        ← Back
      </Button>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">Review KYC: {kyc.userName}</h1>
        <Badge variant="pending">{kyc.status}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="font-semibold">Document Viewer</h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Rotate" onClick={() => setRotation((r) => r + 90)}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <a href={kyc.documentUrl} download target="_blank" rel="noreferrer">
                <Button variant="ghost" size="icon" aria-label="Download">
                  <Download className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </CardHeader>
          <CardContent className="flex min-h-[360px] items-center justify-center overflow-auto bg-bg-base">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={kyc.documentUrl}
              alt={`${kyc.documentType} document`}
              style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
              className="max-w-full transition-transform"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-semibold">Applicant & Decision</h2>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <dl className="space-y-2">
              <div className="flex justify-between"><dt className="text-text-muted">Name</dt><dd>{kyc.userName}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Role</dt><dd>{USER_ROLE_LABELS[kyc.userRole]}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Phone</dt><dd className="font-mono">{formatPhone(kyc.userPhone)}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Email</dt><dd className="truncate pl-4">{kyc.userEmail}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Location</dt><dd>{kyc.location.district}, {kyc.location.state}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Submitted</dt><dd>{relativeTime(kyc.submittedAt)}</dd></div>
            </dl>

            <ul className="space-y-1 text-xs">
              <li className={kyc.checklist.matchesPlatformData ? 'text-status-success' : 'text-status-error'}>
                {kyc.checklist.matchesPlatformData ? '✓' : '✗'} Matches Platform Data
              </li>
              <li className={kyc.checklist.addressVerified ? 'text-status-success' : 'text-status-error'}>
                {kyc.checklist.addressVerified ? '✓' : '✗'} Address Verified
              </li>
              <li className={kyc.checklist.nameMismatch ? 'text-status-warning' : 'text-status-success'}>
                {kyc.checklist.nameMismatch ? '✗ Name Mismatch (minor)' : '✓ Name matches'}
              </li>
            </ul>

            <form onSubmit={form.handleSubmit((d) => mut.mutate(d))} className="space-y-3">
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-text-secondary">Decision</legend>
                {(['approved', 'rejected', 'resubmit_requested'] as const).map((v) => (
                  <label key={v} className="flex items-center gap-2">
                    <input type="radio" value={v} {...form.register('decision')} />
                    <span className="capitalize">{v.replace('_', ' ')}</span>
                  </label>
                ))}
              </fieldset>
              {decision !== 'approved' ? (
                <select
                  {...form.register('reason')}
                  className="h-9 w-full rounded-lg border border-border-default bg-bg-base px-3 text-sm"
                >
                  <option value="">Select reason</option>
                  <option value="Invalid document">Invalid document</option>
                  <option value="Expired">Expired</option>
                  <option value="Fraud suspected">Fraud suspected</option>
                  <option value="Illegible">Illegible</option>
                  <option value="Poor photo quality">Poor photo quality</option>
                  <option value="Name mismatch">Name mismatch</option>
                </select>
              ) : null}
              <textarea
                {...form.register('internalNotes')}
                placeholder="Internal notes"
                className="h-20 w-full rounded-lg border border-border-default bg-bg-base p-2 text-sm"
              />
              <Button type="submit" className="w-full" loading={mut.isPending}>
                Submit Decision
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Audit Trail</h2>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {kyc.auditTrail.map((a, i) => (
            <div key={i} className="rounded-lg border border-border-light p-3">
              <p className="font-medium">{a.action}</p>
              <p className="text-xs text-text-muted">
                {new Date(a.timestamp).toLocaleString('en-IN')} · {a.actor}
                {a.details ? ` · ${a.details}` : ''}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
