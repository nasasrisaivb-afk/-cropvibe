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
import { useActor } from '@/lib/rbac'
import { cn } from '@/lib/cn'

const schema = z
  .object({
    decision: z.enum(['approved', 'rejected', 'resubmit_requested'], {
      errorMap: () => ({ message: 'Choose a decision' }),
    }),
    reason: z.string().optional(),
    internalNotes: z.string().optional(),
  })
  .refine((d) => d.decision === 'approved' || Boolean(d.reason), {
    path: ['reason'],
    message: 'A reason is required — the applicant sees it',
  })

const DECISIONS = [
  { value: 'approved', label: 'Approve', hint: 'Documents match and are valid', cta: 'Approve KYC' },
  { value: 'resubmit_requested', label: 'Request resubmission', hint: 'Fixable issue, e.g. blurry photo', cta: 'Request resubmission' },
  { value: 'rejected', label: 'Reject', hint: 'Invalid, expired or fraudulent', cta: 'Reject KYC' },
] as const

type FormData = z.infer<typeof schema>

export default function KycDetailPage() {
  const { kycId } = useParams<{ kycId: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const actor = useActor()
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const { data: kyc, isLoading } = useQuery({
    queryKey: ['kyc', kycId],
    queryFn: () => getKycById(kycId),
  })

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { decision: undefined, reason: '', internalNotes: '' },
  })
  const decision = form.watch('decision')

  const mut = useMutation({
    mutationFn: (data: FormData) =>
      updateKycStatus(kycId, {
        status: data.decision,
        reason: data.reason,
        internalNotes: data.internalNotes,
        adminName: actor.name,
        adminRole: actor.role,
      }),
    onSuccess: (_, d) => {
      toast.success(`${DECISIONS.find((x) => x.value === d.decision)?.label ?? 'Decision'} recorded for ${kyc?.userName ?? 'applicant'}`)
      void qc.invalidateQueries({ queryKey: ['kyc'] })
      void qc.invalidateQueries({ queryKey: ['nav-badges'] })
      void qc.invalidateQueries({ queryKey: ['audit-log'] })
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
        <h2 className="text-2xl font-bold text-text-primary">Review KYC: {kyc.userName}</h2>
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
                <legend className="mb-2 text-sm font-medium text-text-secondary">Decision</legend>
                {DECISIONS.map((d) => (
                  <label
                    key={d.value}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 transition',
                      decision === d.value
                        ? d.value === 'rejected'
                          ? 'border-status-error/60 bg-status-error/10'
                          : 'border-brand-lime bg-brand-lime/10'
                        : 'border-border-default hover:border-border-strong'
                    )}
                  >
                    <input type="radio" value={d.value} {...form.register('decision')} className="mt-1 accent-brand-lime" />
                    <span>
                      <span className="block text-sm font-medium text-text-primary">{d.label}</span>
                      <span className="block text-xs text-text-muted">{d.hint}</span>
                    </span>
                  </label>
                ))}
                {form.formState.errors.decision ? (
                  <p className="text-xs text-status-error">{form.formState.errors.decision.message}</p>
                ) : null}
              </fieldset>
              {decision && decision !== 'approved' ? (
                <select
                  {...form.register('reason')}
                  className="cv-control h-9"
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
              {form.formState.errors.reason ? (
                <p className="text-xs text-status-error">{form.formState.errors.reason.message}</p>
              ) : null}
              <textarea
                {...form.register('internalNotes')}
                placeholder="Internal notes"
                className="cv-control h-20 py-2"
              />
              <Button
                type="submit"
                variant={decision === 'rejected' ? 'danger' : 'primary'}
                className="w-full"
                loading={mut.isPending}
              >
                {DECISIONS.find((d) => d.value === decision)?.cta ?? 'Submit decision'}
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
