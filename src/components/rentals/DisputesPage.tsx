import { useMemo, useState } from 'react'
import { formatCurrency } from '../../utils/format'
import { Badge, type BadgeStatus } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'
import { PageHeader } from '../common/PageHeader'
import { Select } from '../common/Select'

type DisputeStatus = 'open' | 'review' | 'resolved' | 'rejected'

interface Dispute {
  id: string
  subject: string
  booking: string
  amount: number
  opened: string
  status: DisputeStatus
  thread: { by: string; at: string; text: string }[]
}

const INITIAL: Dispute[] = [
  {
    id: 'FI-118',
    subject: 'Deposit refund shortfall',
    booking: 'BK-5428',
    amount: 2500,
    opened: '27 Jul 2026',
    status: 'review',
    thread: [
      { by: 'You', at: '27 Jul', text: 'Renter claims full deposit but damage fee was applied correctly.' },
      { by: 'Support', at: '28 Jul', text: 'Reviewing photos from return inspection. Reply within 48h.' },
    ],
  },
  {
    id: 'FI-112',
    subject: 'Double platform fee charged',
    booking: 'BK-5430',
    amount: 675,
    opened: '20 Jul 2026',
    status: 'open',
    thread: [{ by: 'You', at: '20 Jul', text: 'Ledger shows fee applied twice on settlement TXN-9012.' }],
  },
  {
    id: 'FI-104',
    subject: 'Payout delay beyond SLA',
    booking: 'PO-421',
    amount: 8200,
    opened: '05 Jul 2026',
    status: 'resolved',
    thread: [
      { by: 'You', at: '05 Jul', text: 'Failed payout still not retried after bank update.' },
      { by: 'Support', at: '08 Jul', text: 'Retried successfully. Marking resolved.' },
    ],
  },
]

function badgeFor(s: DisputeStatus): { status: BadgeStatus; label: string } {
  if (s === 'open') return { status: 'pending', label: 'Open' }
  if (s === 'review') return { status: 'accepted', label: 'In review' }
  if (s === 'rejected') return { status: 'rejected', label: 'Rejected' }
  return { status: 'completed', label: 'Resolved' }
}

export function DisputesPage() {
  const [items, setItems] = useState(INITIAL)
  const [selected, setSelected] = useState(INITIAL[0]?.id ?? null)
  const [filter, setFilter] = useState('all')
  const [creating, setCreating] = useState(false)
  const [note, setNote] = useState('')
  const [form, setForm] = useState({ subject: '', booking: '', amount: '', detail: '' })

  const filtered = useMemo(
    () => items.filter((d) => filter === 'all' || d.status === filter),
    [items, filter],
  )
  const active = items.find((d) => d.id === selected) ?? filtered[0]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance issues"
        subtitle="Raise payment discrepancies, track disputes, and keep a thread per case."
        actions={<Button onClick={() => setCreating(true)}>Raise issue</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="!rounded-[12px]">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">Open</p>
          <p className="mt-1 text-2xl font-bold text-[var(--cv-warning)]">
            {items.filter((d) => d.status === 'open' || d.status === 'review').length}
          </p>
        </Card>
        <Card className="!rounded-[12px]">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">In review</p>
          <p className="mt-1 text-2xl font-bold">{items.filter((d) => d.status === 'review').length}</p>
        </Card>
        <Card className="!rounded-[12px]">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">Resolved</p>
          <p className="mt-1 text-2xl font-bold text-[var(--cv-primary)]">
            {items.filter((d) => d.status === 'resolved').length}
          </p>
        </Card>
      </div>

      {creating ? (
        <Card className="!rounded-[12px]" title="New finance issue">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormInput
              label="Subject"
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              placeholder="e.g. Incorrect settlement amount"
            />
            <FormInput
              label="Related booking / payout"
              value={form.booking}
              onChange={(e) => setForm((p) => ({ ...p, booking: e.target.value }))}
              placeholder="BK-5430 or PO-441"
            />
            <FormInput
              label="Disputed amount (₹)"
              type="number"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            />
            <FormInput
              label="Details"
              as="textarea"
              value={form.detail}
              onChange={(e) => setForm((p) => ({ ...p, detail: e.target.value }))}
              placeholder="What went wrong and what outcome you expect"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => {
                if (!form.subject.trim()) return
                const id = `FI-${100 + items.length}`
                const next: Dispute = {
                  id,
                  subject: form.subject.trim(),
                  booking: form.booking.trim() || '—',
                  amount: Number(form.amount) || 0,
                  opened: 'Today',
                  status: 'open',
                  thread: form.detail.trim()
                    ? [{ by: 'You', at: 'Just now', text: form.detail.trim() }]
                    : [],
                }
                setItems((prev) => [next, ...prev])
                setSelected(id)
                setForm({ subject: '', booking: '', amount: '', detail: '' })
                setCreating(false)
              }}
            >
              Submit issue
            </Button>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="max-w-xs">
        <Select
          label="Filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All issues' },
            { value: 'open', label: 'Open' },
            { value: 'review', label: 'In review' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'rejected', label: 'Rejected' },
          ]}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <Card title={`Issues (${filtered.length})`} className="!rounded-[12px]">
          <ul className="space-y-2">
            {filtered.map((d) => {
              const badge = badgeFor(d.status)
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    className={`w-full rounded-[10px] border px-3 py-2.5 text-left text-sm ${
                      active?.id === d.id
                        ? 'border-[var(--cv-primary)] bg-[var(--cv-primary-soft)]'
                        : 'border-[var(--cv-border)]'
                    }`}
                    onClick={() => setSelected(d.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{d.id}</span>
                      <Badge status={badge.status}>{badge.label}</Badge>
                    </div>
                    <p className="mt-1 truncate text-xs text-[var(--cv-muted)]">{d.subject}</p>
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>

        {active ? (
          <Card className="!rounded-[12px]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{active.subject}</h2>
                <p className="text-sm text-[var(--cv-muted)]">
                  {active.id} · {active.booking} · opened {active.opened}
                </p>
              </div>
              <Badge status={badgeFor(active.status).status}>{badgeFor(active.status).label}</Badge>
            </div>
            <p className="mt-3 text-sm">
              <strong>Amount:</strong> {formatCurrency(active.amount)}
            </p>

            <div className="mt-5 space-y-3">
              <p className="text-sm font-semibold">Thread</p>
              {active.thread.length === 0 ? (
                <p className="text-sm text-[var(--cv-muted)]">No messages yet.</p>
              ) : (
                active.thread.map((m, i) => (
                  <div key={`${m.at}-${i}`} className="rounded-[10px] border border-[var(--cv-border)] bg-[var(--cv-elevated)] p-3">
                    <p className="text-xs font-medium text-[var(--cv-muted)]">
                      {m.by} · {m.at}
                    </p>
                    <p className="mt-1 text-sm">{m.text}</p>
                  </div>
                ))
              )}
            </div>

            {active.status === 'open' || active.status === 'review' ? (
              <div className="mt-4 space-y-3">
                <FormInput
                  label="Add note"
                  as="textarea"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Update support or escalate with more detail"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      if (!note.trim()) return
                      setItems((prev) =>
                        prev.map((d) =>
                          d.id === active.id
                            ? {
                                ...d,
                                status: 'review',
                                thread: [...d.thread, { by: 'You', at: 'Just now', text: note.trim() }],
                              }
                            : d,
                        ),
                      )
                      setNote('')
                    }}
                  >
                    Send note
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setItems((prev) =>
                        prev.map((d) => (d.id === active.id ? { ...d, status: 'resolved' } : d)),
                      )
                    }
                  >
                    Mark resolved
                  </Button>
                  <Button variant="ghost">Escalate</Button>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[var(--cv-muted)]">This issue is closed.</p>
            )}
          </Card>
        ) : null}
      </div>
    </div>
  )
}
