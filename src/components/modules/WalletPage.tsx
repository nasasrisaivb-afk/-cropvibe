import { useMemo, useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { formatCurrency } from '../../utils/format'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'
import { PageHeader } from '../common/PageHeader'

const TXNS = [
  { id: 'TXN-9021', type: 'Credit', label: 'Order PO-8923 settlement', amount: 8450, date: '28 Jul 2026', status: 'completed' as const },
  { id: 'TXN-9018', type: 'Debit', label: 'Payout to HDFC ****4521', amount: -25000, date: '26 Jul 2026', status: 'completed' as const },
  { id: 'TXN-9012', type: 'Credit', label: 'Booking BK-5430 rental', amount: 13500, date: '25 Jul 2026', status: 'pending' as const },
  { id: 'TXN-9004', type: 'Credit', label: 'Course enrollment · Organic 101', amount: 849, date: '24 Jul 2026', status: 'completed' as const },
  { id: 'TXN-8991', type: 'Debit', label: 'Platform fee', amount: -1275, date: '22 Jul 2026', status: 'completed' as const },
]

export function WalletPage() {
  const role = useAppStore((s) => s.user?.activeRole ?? 'seller')
  const [payoutOpen, setPayoutOpen] = useState(false)
  const [amount, setAmount] = useState('10000')
  const balance = 68420
  const pending = 13500
  const canPayout = role !== 'buyer'

  const filtered = useMemo(() => TXNS, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet"
        subtitle="Escrow-aware ledger, payouts, and GST-ready invoices."
        actions={
          canPayout ? (
            <Button onClick={() => setPayoutOpen(true)}>Withdraw</Button>
          ) : (
            <Button variant="secondary">Add wallet balance</Button>
          )
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="!rounded-[12px] ring-1 ring-[var(--cv-primary)]/15">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">Available</p>
          <p className="mt-2 text-3xl font-bold text-[var(--cv-primary)]">{formatCurrency(balance)}</p>
          <p className="mt-1 text-xs text-[var(--cv-muted)]">{canPayout ? 'Ready to withdraw after verification' : 'Credit on file'}</p>
        </Card>
        <Card className="!rounded-[12px]">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">Pending</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(pending)}</p>
          <p className="mt-1 text-xs text-[var(--cv-muted)]">In the buyer acceptance window</p>
        </Card>
        <Card className="!rounded-[12px]">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">On hold</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(4200)}</p>
          <p className="mt-1 text-xs text-[var(--cv-muted)]">Open dispute PO-8901</p>
        </Card>
        <Card className="!rounded-[12px] sm:col-span-3 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">Lifetime</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(582300)}</p>
          <p className="mt-1 text-xs text-[var(--cv-muted)]">Seller ₹4.1L · Rental ₹1.2L · Service ₹0.5L</p>
        </Card>
      </div>

      {payoutOpen ? (
        <Card className="!rounded-[12px]" title="Request payout">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <FormInput
              label="Amount (₹)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              helperText="Bank account required before first payout. Min ₹500."
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setPayoutOpen(false)
                }}
              >
                Submit request
              </Button>
              <Button variant="ghost" onClick={() => setPayoutOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="!rounded-[12px] !p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--cv-border)] px-5 py-4">
          <div>
            <h3 className="font-semibold">Transaction history</h3>
            <p className="text-xs text-[var(--cv-muted)]">Wallet ledger with invoice links</p>
          </div>
          <Button size="sm" variant="secondary">
            Download statement
          </Button>
        </div>
        <div className="divide-y divide-[var(--cv-border)]">
          {filtered.map((t) => (
            <div key={t.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{t.label}</p>
                <p className="text-xs text-[var(--cv-muted)]">
                  {t.id} · {t.date} · {t.type}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge status={t.status} />
                <span
                  className={`font-semibold ${
                    t.amount >= 0 ? 'text-[var(--cv-primary)]' : 'text-[var(--cv-danger)]'
                  }`}
                >
                  {t.amount >= 0 ? '+' : ''}
                  {formatCurrency(Math.abs(t.amount))}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
