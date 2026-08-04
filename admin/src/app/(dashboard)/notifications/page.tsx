'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  getNotifications,
  markNotificationRead,
  dismissNotification,
  previewAudience,
  sendBroadcast,
  getBroadcasts,
} from '@/lib/api/notifications.api'
import { ALL_USER_ROLES, USER_ROLE_LABELS, INDIAN_STATES } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { relativeTime } from '@/lib/utils'

const broadcastSchema = z.object({
  title: z.string().min(1).max(50),
  body: z.string().min(1).max(500),
  cta: z.string().max(40).optional(),
  link: z.string().optional(),
})

type BroadcastForm = z.infer<typeof broadcastSchema>

export default function NotificationsPage() {
  const [tab, setTab] = useState<'inbox' | 'broadcast'>('inbox')
  const [mode, setMode] = useState<'all' | 'role' | 'location' | 'subscription'>('all')
  const [roles, setRoles] = useState<string[]>([])
  const [states, setStates] = useState<string[]>([])
  const [channels, setChannels] = useState<string[]>(['push'])
  const qc = useQueryClient()

  const { data: inbox } = useQuery({ queryKey: ['notifications'], queryFn: getNotifications })
  const { data: broadcasts } = useQuery({ queryKey: ['broadcasts'], queryFn: getBroadcasts })
  const { data: audienceCount } = useQuery({
    queryKey: ['audience', mode, roles, states],
    queryFn: () => previewAudience({ mode, roles, states }),
  })

  const form = useForm<BroadcastForm>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: { title: '', body: '', cta: '', link: '' },
  })

  const readMut = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
  const dismissMut = useMutation({
    mutationFn: dismissNotification,
    onSuccess: () => {
      toast.success('Dismissed')
      void qc.invalidateQueries({ queryKey: ['notifications'] })
      void qc.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })
  const sendMut = useMutation({
    mutationFn: (data: BroadcastForm) =>
      sendBroadcast({
        title: data.title,
        body: data.body,
        channels,
        audience:
          mode === 'all'
            ? 'All users'
            : mode === 'role'
              ? `Roles: ${roles.join(', ')}`
              : mode === 'location'
                ? `States: ${states.join(', ')}`
                : 'Subscription segment',
        audienceCount: audienceCount ?? 0,
      }),
    onSuccess: (r) => {
      toast.success(`Sent to ${r.sent} users`)
      form.reset()
      void qc.invalidateQueries({ queryKey: ['broadcasts'] })
    },
  })

  const visible = (inbox ?? []).filter((n) => !n.dismissedAt)

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Notifications</h1>
      <div className="flex gap-2">
        {(['inbox', 'broadcast'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize ${
              tab === t ? 'bg-brand-lime text-text-inverse' : 'bg-bg-surfaceAlt text-text-secondary'
            }`}
          >
            {t === 'inbox' ? 'Inbox' : 'Broadcast Composer'}
          </button>
        ))}
      </div>

      {tab === 'inbox' ? (
        <div className="space-y-2">
          {visible.map((n) => (
            <Card key={n.id} className={!n.read ? 'border-brand-lime/40' : undefined}>
              <CardContent className="flex items-start justify-between gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 text-left"
                  onClick={() => {
                    readMut.mutate(n.id)
                    if (n.relatedHref) window.location.href = n.relatedHref
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={n.type === 'error' ? 'error' : n.type === 'warning' ? 'warning' : 'info'}>
                      {n.type}
                    </Badge>
                    {!n.read ? <span className="text-[10px] text-brand-limeAlt">UNREAD</span> : null}
                  </div>
                  <p className="mt-1 font-medium">{n.title}</p>
                  <p className="text-sm text-text-secondary">{n.message}</p>
                  <p className="mt-1 text-xs text-text-muted">{relativeTime(n.createdAt)}</p>
                </button>
                <Button size="sm" variant="ghost" onClick={() => dismissMut.mutate(n.id)}>
                  Dismiss
                </Button>
              </CardContent>
            </Card>
          ))}
          {visible.length === 0 ? (
            <p className="text-sm text-text-muted">Inbox clear</p>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><h2 className="font-semibold">Compose</h2></CardHeader>
            <CardContent className="space-y-4">
              <fieldset className="space-y-2 text-sm">
                <legend className="text-text-secondary">Audience</legend>
                {(['all', 'role', 'location', 'subscription'] as const).map((m) => (
                  <label key={m} className="flex items-center gap-2 capitalize">
                    <input type="radio" checked={mode === m} onChange={() => setMode(m)} />
                    {m === 'all' ? 'All users' : `By ${m}`}
                  </label>
                ))}
              </fieldset>
              {mode === 'role' ? (
                <div className="flex flex-wrap gap-2">
                  {ALL_USER_ROLES.slice(0, 8).map((r) => (
                    <label key={r} className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={roles.includes(r)}
                        onChange={(e) =>
                          setRoles((prev) =>
                            e.target.checked ? [...prev, r] : prev.filter((x) => x !== r)
                          )
                        }
                      />
                      {USER_ROLE_LABELS[r]}
                    </label>
                  ))}
                </div>
              ) : null}
              {mode === 'location' ? (
                <div className="flex flex-wrap gap-2">
                  {INDIAN_STATES.slice(0, 10).map((s) => (
                    <label key={s} className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={states.includes(s)}
                        onChange={(e) =>
                          setStates((prev) =>
                            e.target.checked ? [...prev, s] : prev.filter((x) => x !== s)
                          )
                        }
                      />
                      {s}
                    </label>
                  ))}
                </div>
              ) : null}
              <p className="text-sm text-brand-limeAlt">Preview audience: {audienceCount ?? 0} users</p>

              <fieldset className="flex flex-wrap gap-3 text-sm">
                <legend className="w-full text-text-secondary">Channels</legend>
                {['push', 'sms', 'email', 'in_app'].map((c) => (
                  <label key={c} className="flex items-center gap-1 capitalize">
                    <input
                      type="checkbox"
                      checked={channels.includes(c)}
                      onChange={(e) =>
                        setChannels((prev) =>
                          e.target.checked ? [...prev, c] : prev.filter((x) => x !== c)
                        )
                      }
                    />
                    {c.replace('_', ' ')}
                  </label>
                ))}
              </fieldset>

              <form
                onSubmit={form.handleSubmit((d) => sendMut.mutate(d))}
                className="space-y-3"
              >
                <input {...form.register('title')} placeholder="Title (50 max)" className="h-9 w-full rounded-lg border border-border-default bg-bg-base px-3 text-sm" />
                <textarea {...form.register('body')} placeholder="Body (500 max)" className="h-28 w-full rounded-lg border border-border-default bg-bg-base p-2 text-sm" />
                <input {...form.register('cta')} placeholder="CTA (optional)" className="h-9 w-full rounded-lg border border-border-default bg-bg-base px-3 text-sm" />
                <input {...form.register('link')} placeholder="Deep link (optional)" className="h-9 w-full rounded-lg border border-border-default bg-bg-base px-3 text-sm" />
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => toast.message(form.getValues('body') || 'Empty preview')}>
                    Preview
                  </Button>
                  <Button type="submit" loading={sendMut.isPending}>Send Now</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="font-semibold">Delivery history</h2></CardHeader>
            <CardContent className="space-y-3">
              {(broadcasts ?? []).map((b) => (
                <div key={b.id} className="rounded-lg border border-border-light p-3 text-sm">
                  <p className="font-medium">{b.title}</p>
                  <p className="text-text-secondary">{b.body}</p>
                  <p className="mt-2 text-xs text-text-muted">
                    Sent {b.sent} · Delivered {b.delivered} · Opened {b.opened} · Clicked {b.clicked}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
