import { useMemo, useState } from 'react'
import { formatCurrency } from '../../utils/format'
import { Badge, type BadgeStatus } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'
import { PageHeader } from '../common/PageHeader'
import { Select } from '../common/Select'

type PayoutStatus = 'pending' | 'approved' | 'transit' | 'completed' | 'failed'

interface Payout {
  id: string
  amount: number
  requested: string
  method: string
  status: PayoutStatus
  note?: string
}

const INITIAL: Payout[] = [
  {
    id: 'PO-441',
    amount: 18600,
    requested: '28 Jul 2026',
    method: 'HDFC ****4521',
    status: 'pending',
    note: 'Awaiting bank verify window',
  },
  {
    id: 'PO-438',
    amount: 10000,
    requested: '22 Jul 2026',
    method: 'HDFC ****4521',
    status: 'transit',
  },
  {
    id: 'PO-430',
    amount: 25000,
    requested: '12 Jul 2026',
    method: 'HDFC ****4521',
    status: 'completed',
  },
  {
    id: 'PO-421',
    amount: 8200,
    requested: '02 Jul 2026',
    method: 'HDFC ****4521',
    status: 'failed',
    note: 'Account mismatch — update bank details',
  },
]

function statusBadge(s: PayoutStatus): { status: BadgeStatus; label: string } {
  if (s === 'pending') return { status: 'pending', label: 'Pending' }
  if (s === 'approved') return { status: 'accepted', label: 'Approved' }
  if (s === 'transit') return { status: 'shipped', label: 'In transit' }
  if (s === 'failed') return { status: 'rejected', label: 'Failed' }
  return { status: 'completed', label: 'Completed' }
}

export function PayoutsPage() {
  const [payouts, setPayouts] = useState(INITIAL)
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('10000')

  const filtered = useMemo(
    () => payouts.filter((p) => filter === 'all' || p.status === filter),
    [payouts, filter],
  )

  const pendingTotal = payouts
    .filter((p) => p.status === 'pending' || p.status === 'transit' || p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payouts & settlements"
        subtitle="Track settlement requests, bank transfers, and receipt history."
        actions={<Button onClick={() => setOpen(true)}>Request payout</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="!rounded-[12px]">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">Available balance</p>
          <p className="mt-2 text-3xl font-bold text-[var(--cv-primary)]">{formatCurrency(68420)}</p>
        </Card>
        <Card className="!rounded-[12px]">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">In flight</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(pendingTotal)}</p>
          <p className="mt-1 text-xs text-[var(--cv-muted)]">Pending + in transit</p>
        </Card>
        <Card className="!rounded-[12px]">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">Bank account</p>
          <p className="mt-2 text-lg font-semibold">HDFC ****4521</p>
          <p className="mt-1 text-xs text-[var(--cv-muted)]">Verified · primary payout method</p>
        </Card>
      </div>

      {open ? (
        <Card className="!rounded-[12px]" title="Request payout">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <FormInput
              label="Amount (₹)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              helperText="Min ₹500. Settles to verified bank account."
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const value = Math.max(500, Number(amount) || 0)
                  setPayouts((prev) => [
                    {
                      id: `PO-${440 + prev.length}`,
                      amount: value,
                      requested: 'Today',
                      method: 'HDFC ****4521',
                      status: 'pending',
                    },
                    ...prev,
                  ])
                  setOpen(false)
                }}
              >
                Submit request
              </Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="max-w-xs">
        <Select
          label="Filter status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All payouts' },
            { value: 'pending', label: 'Pending' },
            { value: 'transit', label: 'In transit' },
            { value: 'completed', label: 'Completed' },
            { value: 'failed', label: 'Failed' },
          ]}
        />
      </div>

      <Card className="!rounded-[12px] !p-0 overflow-hidden">
        <div className="border-b border-[var(--cv-border)] px-5 py-4">
          <h3 className="font-semibold">Settlement history</h3>
          <p className="text-xs text-[var(--cv-muted)]">Status timeline for each payout request</p>
        </div>
        <div className="divide-y divide-[var(--cv-border)]">
          {filtered.map((p) => {
            const badge = statusBadge(p.status)
            return (
              <div
                key={p.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{p.id}</p>
                    <Badge status={badge.status}>{badge.label}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-[var(--cv-muted)]">
                    Requested {p.requested} · {p.method}
                  </p>
                  {p.note ? <p className="mt-1 text-xs text-[var(--cv-warning)]">{p.note}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{formatCurrency(p.amount)}</span>
                  {p.status === 'completed' ? (
                    <Button size="sm" variant="secondary">
                      Receipt
                    </Button>
                  ) : null}
                  {p.status === 'failed' ? (
                    <Button size="sm" variant="secondary">
                      Fix bank details
                    </Button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
