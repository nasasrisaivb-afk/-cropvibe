'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, MessageSquarePlus } from 'lucide-react'
import { Drawer } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Timeline } from '@/components/ui/timeline'
import type { BaseRecord, ResourceAction, ResourceConfig } from '@/lib/resources/types'
import { CellValue } from './cells'
import { cn } from '@/lib/cn'

/**
 * Detail panel for a record: summary → actions → sections → related → timeline.
 * The primary action always sits bottom-right so the likely next step is in the same place.
 */
export function RecordDrawer<T extends BaseRecord>({
  config,
  row,
  open,
  onOpenChange,
  actions,
  onAction,
  onAddNote,
  notePending,
  canEdit,
}: {
  config: ResourceConfig<T>
  row: T | null
  open: boolean
  onOpenChange: (open: boolean) => void
  actions: ResourceAction<T>[]
  onAction: (action: ResourceAction<T>) => void
  onAddNote: (note: string) => void
  notePending?: boolean
  canEdit: boolean
}) {
  const [note, setNote] = useState('')
  if (!row) return null

  const status = config.status ? config.status.value(row) : undefined
  const statusDef = status ? config.status!.map[status] : undefined
  const related = config.related?.(row) ?? []
  const ordered = [...actions].sort((a, b) => rank(a) - rank(b))

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      eyebrow={
        <span className="flex items-center gap-2">
          <span>{config.entity}</span>
          <span aria-hidden>·</span>
          <span className="font-mono">{row.id}</span>
        </span>
      }
      title={config.title(row)}
      description={config.subtitle?.(row)}
      headerExtra={
        statusDef ? (
          <Badge variant={statusDef.tone} showIcon={statusDef.tone !== 'default' && statusDef.tone !== 'accent'}>
            {statusDef.label}
          </Badge>
        ) : null
      }
      footer={
        ordered.length > 0 ? (
          <>
            {ordered.map((a) => {
              const Icon = a.icon
              return (
                <Button
                  key={a.id}
                  variant={a.tone === 'primary' ? 'primary' : a.tone === 'danger' ? 'danger' : 'secondary'}
                  onClick={() => onAction(a)}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {a.label}
                </Button>
              )
            })}
          </>
        ) : !canEdit ? (
          <p className="mr-auto text-sm text-text-muted">You have view-only access to this module.</p>
        ) : undefined
      }
    >
      <div className="space-y-6">
        {config.drawerHero ? <div>{config.drawerHero(row)}</div> : null}

        {config.detail.map((section) => (
          <section key={section.title} aria-labelledby={`sec-${section.title}`}>
            <h3
              id={`sec-${section.title}`}
              className="mb-3 text-2xs font-semibold uppercase tracking-wider text-text-muted"
            >
              {section.title}
            </h3>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-xl border border-border-default bg-bg-inset p-4 sm:grid-cols-2">
              {section.fields.map((f) => (
                <div key={f.label} className={cn('min-w-0', f.span === 2 && 'sm:col-span-2')}>
                  <dt className="text-xs text-text-muted">{f.label}</dt>
                  <dd className="mt-1 break-words text-sm">
                    <CellValue kind={f.kind} value={f.value(row)} statusMap={f.statusMap} href={f.href?.(row)} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        {related.length > 0 ? (
          <section>
            <h3 className="mb-3 text-2xs font-semibold uppercase tracking-wider text-text-muted">Related</h3>
            <div className="flex flex-wrap gap-2">
              {related.map((r) => (
                <Link
                  key={r.href + r.label}
                  href={r.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border-default px-3 py-1.5 text-sm text-text-secondary transition hover:border-brand-lime/50 hover:text-text-primary"
                >
                  {r.label}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <h3 className="mb-3 text-2xs font-semibold uppercase tracking-wider text-text-muted">Activity</h3>
          {canEdit ? (
            <form
              className="mb-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (!note.trim()) return
                onAddNote(note.trim())
                setNote('')
              }}
            >
              <label htmlFor="drawer-note" className="sr-only">
                Add internal note
              </label>
              <input
                id="drawer-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add an internal note…"
                className="cv-control"
              />
              <Button type="submit" variant="secondary" loading={notePending} disabled={!note.trim()}>
                <MessageSquarePlus className="h-4 w-4" />
                Add
              </Button>
            </form>
          ) : null}
          <Timeline
            items={(row.history ?? []).map((h, i) => ({
              id: `${h.at}-${i}`,
              title: (
                <>
                  <span className="font-medium">{h.actor}</span>{' '}
                  <span className="text-text-secondary">{h.action.charAt(0).toLowerCase() + h.action.slice(1)}</span>
                </>
              ),
              body: h.note,
              at: h.at,
              tone: i === 0 ? 'accent' : 'default',
            }))}
          />
        </section>
      </div>
    </Drawer>
  )
}

/** Footer reads left→right: destructive, secondary, then the primary action nearest the thumb. */
function rank<T>(a: ResourceAction<T>) {
  return a.tone === 'danger' ? 0 : a.tone === 'primary' ? 2 : 1
}
