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
      }),
    onSuccess: () => {
      toast.success('Settings saved')
      void qc.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  const flagMut = useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      toggleFeatureFlag(key, enabled),
    onSuccess: () => {
      toast.success('Feature flag updated')
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
      <h1 className="text-3xl font-bold">Settings</h1>

      <form
        onSubmit={form.handleSubmit((v) => saveMut.mutate(v))}
        className="space-y-4"
      >
        <Card>
          <CardHeader><h2 className="font-semibold">Platform configuration</h2></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {(['crop', 'rental', 'warehouse', 'logistics'] as const).map((k) => (
              <label key={k} className="text-sm capitalize text-text-secondary">
                {k} commission %
                <input type="number" step="0.1" {...form.register(k)} className="mt-1 h-9 w-full rounded-lg border border-border-default bg-bg-base px-3 text-text-primary" />
              </label>
            ))}
            <label className="text-sm text-text-secondary">
              Dispute SLA (hours)
              <input type="number" {...form.register('disputeSlaHours')} className="mt-1 h-9 w-full rounded-lg border border-border-default bg-bg-base px-3 text-text-primary" />
            </label>
            <div className="space-y-2 text-sm">
              <p className="text-text-secondary">KYC requirements</p>
              {(['aadhaar', 'pan', 'gst'] as const).map((k) => (
                <label key={k} className="flex items-center gap-2 capitalize">
                  <input type="checkbox" {...form.register(k)} />
                  {k} required
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold">General</h2></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-text-secondary">App name<input {...form.register('appName')} className="mt-1 h-9 w-full rounded-lg border border-border-default bg-bg-base px-3 text-text-primary" /></label>
            <label className="text-sm text-text-secondary">Version<input {...form.register('appVersion')} className="mt-1 h-9 w-full rounded-lg border border-border-default bg-bg-base px-3 text-text-primary" /></label>
            <label className="text-sm text-text-secondary">Support email<input {...form.register('supportEmail')} className="mt-1 h-9 w-full rounded-lg border border-border-default bg-bg-base px-3 text-text-primary" /></label>
            <label className="text-sm text-text-secondary">Support phone<input {...form.register('supportPhone')} className="mt-1 h-9 w-full rounded-lg border border-border-default bg-bg-base px-3 text-text-primary" /></label>
          </CardContent>
        </Card>

        <Button type="submit" loading={saveMut.isPending}>Save settings</Button>
      </form>

      <Card>
        <CardHeader><h2 className="font-semibold">Feature flags</h2></CardHeader>
        <CardContent className="space-y-3">
          {data.featureFlags.map((f) => (
            <label key={f.key} className="flex items-start justify-between gap-4 rounded-lg border border-border-light p-3">
              <div>
                <p className="font-medium">{f.label}</p>
                <p className="text-xs text-text-muted">{f.description}</p>
              </div>
              <input
                type="checkbox"
                checked={f.enabled}
                onChange={(e) => flagMut.mutate({ key: f.key, enabled: e.target.checked })}
                aria-label={f.label}
              />
            </label>
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
      <input {...form.register('subject')} className="h-9 w-full rounded-lg border border-border-default bg-bg-base px-3 text-sm" />
      <textarea {...form.register('body')} className="h-20 w-full rounded-lg border border-border-default bg-bg-base p-2 text-sm" />
      <Button size="sm" loading={saving} onClick={form.handleSubmit((v) => onSave(v.subject, v.body))}>
        Save template
      </Button>
    </div>
  )
}
