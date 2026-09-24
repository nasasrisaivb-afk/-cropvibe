'use client'

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  getSettings,
  updateSettings,
  toggleFeatureFlag,
  updateTemplate,
} from '@/lib/api/settings.api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/loading'
import { SwitchRow } from '@/components/ui/switch'
import { cn } from '@/lib/cn'
import { useActor } from '@/lib/rbac'

type SettingsForm = {
  crop: number
  rental: number
  warehouse: number
  logistics: number
  disputeSlaHours: number
  aadhaar: boolean
  pan: boolean
  gst: boolean
  supportEmail: string
  supportPhone: string
  appName: string
  appVersion: string
}

export default function SettingsPage() {
  const qc = useQueryClient()
  const actor = useActor()
  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: getSettings })
  const form = useForm<SettingsForm>({
    defaultValues: {
      crop: 5,
      rental: 8,
      warehouse: 6,
      logistics: 10,
      disputeSlaHours: 168,
      aadhaar: true,
      pan: true,
      gst: false,
      supportEmail: '',
      supportPhone: '',
      appName: '',
      appVersion: '',
    },
  })

  useEffect(() => {
    if (!data) return
    form.reset({
      crop: data.commissionRates.crop,
      rental: data.commissionRates.rental,
      warehouse: data.commissionRates.warehouse,
      logistics: data.commissionRates.logistics,
      disputeSlaHours: data.disputeSlaHours,
      aadhaar: data.kycRequirements.aadhaar,
      pan: data.kycRequirements.pan,
      gst: data.kycRequirements.gst,
      supportEmail: data.supportEmail,
      supportPhone: data.supportPhone,
      appName: data.appName,
      appVersion: data.appVersion,
    })
  }, [data, form])

  const saveMut = useMutation({
    mutationFn: (values: SettingsForm) =>
      updateSettings({
        commissionRates: {
          crop: Number(values.crop),
          rental: Number(values.rental),
          warehouse: Number(values.warehouse),
          logistics: Number(values.logistics),
        },
        disputeSlaHours: Number(values.disputeSlaHours),
        kycRequirements: {
          aadhaar: values.aadhaar,
          pan: values.pan,
          gst: values.gst,
        },
        supportEmail: values.supportEmail,
        supportPhone: values.supportPhone,
        appName: values.appName,
        appVersion: values.appVersion,
      }, actor),
    onSuccess: (_, values) => {
      toast.success('Settings saved')
      form.reset(values)
      void qc.invalidateQueries({ queryKey: ['settings'] })
      void qc.invalidateQueries({ queryKey: ['audit-log'] })
    },
  })

  const flagMut = useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      toggleFeatureFlag(key, enabled, actor),
    onSuccess: (_, v) => {
      toast.success(`Feature flag ${v.enabled ? 'enabled' : 'disabled'}`)
      void qc.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  const tplMut = useMutation({
    mutationFn: ({ id, subject, body }: { id: string; subject: string; body: string }) =>
      updateTemplate(id, { subject, body }),
    onSuccess: () => toast.success('Template saved'),
  })

  if (isLoading || !data) return <Skeleton className="h-96 w-full" />

  return (
    <div className="space-y-4">

      <form
        onSubmit={form.handleSubmit((v) => saveMut.mutate(v))}
        className="space-y-4"
      >
        <Card>
          <CardHeader><h2 className="font-semibold">Platform configuration</h2></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {(['crop', 'rental', 'warehouse', 'logistics'] as const).map((k) => (
              <label key={k} className="text-sm text-text-secondary">
                {k.charAt(0).toUpperCase() + k.slice(1)} commission %
                <input type="number" step="0.1" {...form.register(k)} className="cv-control mt-1 h-9" />
              </label>
            ))}
            <label className="text-sm text-text-secondary">
              Dispute SLA (hours)
              <input type="number" {...form.register('disputeSlaHours')} className="cv-control mt-1 h-9" />
            </label>
            <div className="sm:col-span-2">
              <p className="mt-2 text-sm font-medium text-text-secondary">KYC requirements</p>
              <div className="divide-y divide-border-light">
                {(
                  [
                    ['aadhaar', 'Aadhaar required', 'Every account must verify Aadhaar (or DigiLocker) before transacting.'],
                    ['pan', 'PAN required', 'Needed for payouts above ₹50,000 a year (TDS compliance).'],
                    ['gst', 'GST required', 'Sellers and warehouse owners above the GST threshold must add a GSTIN.'],
                  ] as const
                ).map(([k, label, description]) => (
                  <SwitchRow
                    key={k}
                    label={label}
                    description={description}
                    checked={Boolean(form.watch(k))}
                    onCheckedChange={(v) => form.setValue(k, v, { shouldDirty: true })}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold">General</h2></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-text-secondary">App name<input {...form.register('appName')} className="cv-control mt-1 h-9" /></label>
            <label className="text-sm text-text-secondary">Version<input {...form.register('appVersion')} className="cv-control mt-1 h-9" /></label>
            <label className="text-sm text-text-secondary">Support email<input {...form.register('supportEmail')} className="cv-control mt-1 h-9" /></label>
            <label className="text-sm text-text-secondary">Support phone<input {...form.register('supportPhone')} className="cv-control mt-1 h-9" /></label>
          </CardContent>
        </Card>

        <div
          className={cn(
            'sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-5 py-3 shadow-pop transition',
            form.formState.isDirty ? 'border-brand-lime/50 bg-bg-surfaceAlt' : 'border-border-default bg-bg-surface'
          )}
        >
          <p className="text-sm text-text-secondary" aria-live="polite">
            {form.formState.isDirty
              ? 'You have unsaved changes. Commission changes apply to new orders only.'
              : 'All changes saved.'}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" disabled={!form.formState.isDirty} onClick={() => form.reset()}>
              Discard
            </Button>
            <Button type="submit" loading={saveMut.isPending} disabled={!form.formState.isDirty}>
              Save settings
            </Button>
          </div>
        </div>
      </form>

      <Card>
        <CardHeader><h2 className="font-semibold">Feature flags</h2></CardHeader>
        <CardContent className="divide-y divide-border-light py-2">
          {data.featureFlags.map((f) => (
            <SwitchRow
              key={f.key}
              label={f.label}
              description={f.description}
              checked={f.enabled}
              disabled={flagMut.isPending}
              onCheckedChange={(enabled) => flagMut.mutate({ key: f.key, enabled })}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="font-semibold">Notification templates</h2></CardHeader>
        <CardContent className="space-y-4">
          {data.notificationTemplates.map((t) => (
            <TemplateEditor
              key={t.id}
              id={t.id}
              name={t.name}
              channel={t.channel}
              subject={t.subject}
              body={t.body}
              onSave={(subject, body) => tplMut.mutate({ id: t.id, subject, body })}
              saving={tplMut.isPending}
            />
          ))}
          <p className="text-xs text-text-muted">
            Variables: {'{{userName}}'}, {'{{amount}}'}, {'{{link}}'}, {'{{disputeId}}'}, {'{{resolution}}'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function TemplateEditor({
  name,
  channel,
  subject,
  body,
  onSave,
  saving,
}: {
  id: string
  name: string
  channel: string
  subject: string
  body: string
  onSave: (subject: string, body: string) => void
  saving: boolean
}) {
  const form = useForm({ defaultValues: { subject, body } })
  return (
    <div className="rounded-lg border border-border-light p-3 space-y-2">
      <p className="text-sm font-medium">{name} <span className="text-text-muted">({channel})</span></p>
      <input {...form.register('subject')} className="cv-control h-9" />
      <textarea {...form.register('body')} className="cv-control h-20 py-2" />
      <Button size="sm" loading={saving} onClick={form.handleSubmit((v) => onSave(v.subject, v.body))}>
        Save template
      </Button>
    </div>
  )
}
