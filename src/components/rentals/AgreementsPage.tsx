import { useMemo, useState } from 'react'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import {
  ExportButton,
  FilterSelect,
  OverviewFooter,
  OverviewPanel,
  OverviewSearch,
  OverviewShell,
  OverviewTabs,
  OverviewToolbar,
  PrimaryActionButton,
} from '../common/DataOverview'
import { FormInput, FormTextarea } from '../common/FormInput'
import { Select } from '../common/Select'
import { Sheet } from '../common/Sheet'
import { Switch } from '../common/Switch'
import { formatCurrency } from '../../utils/format'

type AgreementStatus = 'pending' | 'active' | 'completed'

interface Agreement {
  id: string
  renter: string
  equipment: string
  period: string
  status: AgreementStatus
  signed: boolean
  deposit?: number
  dailyRate?: number
}

const INITIAL: Agreement[] = [
  {
    id: 'AGR-8821',
    renter: 'ABC Farm',
    equipment: 'Mahindra 575 DI Tractor',
    period: '28–31 Jul 2026',
    status: 'active',
    signed: true,
    deposit: 15000,
    dailyRate: 2500,
  },
  {
    id: 'AGR-8814',
    renter: 'Farm Ltd',
    equipment: 'John Deere Harvester W70',
    period: '25–28 Jul 2026',
    status: 'active',
    signed: true,
    deposit: 40000,
    dailyRate: 8500,
  },
  {
    id: 'AGR-8802',
    renter: 'Green Fields Co-op',
    equipment: 'Cold store bay A',
    period: '01 Jul – 31 Aug 2026',
    status: 'pending',
    signed: false,
    deposit: 25000,
    dailyRate: 1200,
  },
  {
    id: 'AGR-8788',
    renter: 'Sunrise Agro',
    equipment: 'Rotavator 7 ft',
    period: '10–12 Jul 2026',
    status: 'completed',
    signed: true,
    deposit: 5000,
    dailyRate: 1800,
  },
]

const EQUIPMENT_OPTIONS = [
  { value: 'Mahindra 575 DI Tractor', label: 'Mahindra 575 DI Tractor' },
  { value: 'John Deere Harvester W70', label: 'John Deere Harvester W70' },
  { value: 'Rotavator 7 ft', label: 'Rotavator 7 ft' },
  { value: 'Boom Sprayer 400L', label: 'Boom Sprayer 400L' },
  { value: 'Cold store bay A', label: 'Cold store bay A' },
  { value: 'Power Tiller VST', label: 'Power Tiller VST' },
]

const emptyForm = {
  renterName: '',
  renterPhone: '',
  renterEmail: '',
  equipment: EQUIPMENT_OPTIONS[0]?.value ?? '',
  startDate: '',
  endDate: '',
  dailyRate: '2500',
  deposit: '15000',
  lateFeePerDay: '500',
  deliveryLocation: '',
  notes: '',
  sendForSignature: true,
  includeInsurance: true,
  damageClause: true,
}

function formatPeriod(start: string, end: string) {
  if (!start || !end) return '—'
  const s = new Date(start)
  const e = new Date(end)
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  return `${fmt(s)} – ${fmt(e)}`
}

function daysBetween(start: string, end: string) {
  if (!start || !end) return 0
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms < 0) return 0
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1)
}

export function AgreementsPage() {
  const [agreements, setAgreements] = useState(INITIAL)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof typeof emptyForm, string>>>({})
  const [createdId, setCreatedId] = useState<string | null>(null)

  const rows = useMemo(
    () =>
      agreements.filter((a) => {
        const matchQ =
          !q ||
          a.id.toLowerCase().includes(q.toLowerCase()) ||
          a.renter.toLowerCase().includes(q.toLowerCase()) ||
          a.equipment.toLowerCase().includes(q.toLowerCase())
        const matchS = status === 'all' || a.status === status
        return matchQ && matchS
      }),
    [agreements, q, status],
  )

  const rentalDays = daysBetween(form.startDate, form.endDate)
  const estimatedRent = rentalDays * (Number(form.dailyRate) || 0)
  const estimatedTotal = estimatedRent + (Number(form.deposit) || 0)

  const patch = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next: Partial<Record<keyof typeof emptyForm, string>> = {}
    if (!form.renterName.trim()) next.renterName = 'Renter name is required'
    if (!form.renterPhone.trim() || form.renterPhone.replace(/\D/g, '').length < 10) {
      next.renterPhone = 'Enter a valid 10-digit phone'
    }
    if (!form.equipment) next.equipment = 'Select equipment or asset'
    if (!form.startDate) next.startDate = 'Start date is required'
    if (!form.endDate) next.endDate = 'End date is required'
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      next.endDate = 'End date must be on or after start date'
    }
    if (!form.dailyRate || Number(form.dailyRate) <= 0) next.dailyRate = 'Enter a valid daily rate'
    if (!form.deposit || Number(form.deposit) < 0) next.deposit = 'Enter a valid deposit'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const resetAndClose = () => {
    setOpen(false)
    setForm(emptyForm)
    setErrors({})
    setCreatedId(null)
  }

  const handleCreate = () => {
    if (!validate()) return
    const id = `AGR-${8700 + agreements.length + Math.floor(Math.random() * 40)}`
    const next: Agreement = {
      id,
      renter: form.renterName.trim(),
      equipment: form.equipment,
      period: formatPeriod(form.startDate, form.endDate),
      status: form.sendForSignature ? 'pending' : 'active',
      signed: !form.sendForSignature,
      deposit: Number(form.deposit) || 0,
      dailyRate: Number(form.dailyRate) || 0,
    }
    setAgreements((prev) => [next, ...prev])
    setCreatedId(id)
  }

  return (
    <OverviewShell
      title="Agreements overview"
      subtitle="Digital rental agreements, e-signature status, and document history."
      actions={
        <>
          <ExportButton onClick={() => undefined} />
          <PrimaryActionButton
            onClick={() => {
              setCreatedId(null)
              setForm(emptyForm)
              setErrors({})
              setOpen(true)
            }}
          >
            Create agreement
          </PrimaryActionButton>
        </>
      }
    >
      <OverviewPanel>
        <OverviewTabs
          tabs={[
            { value: 'all', label: 'All agreements', count: agreements.length },
            {
              value: 'pending',
              label: 'Awaiting signature',
              count: agreements.filter((a) => a.status === 'pending').length,
            },
            {
              value: 'active',
              label: 'Active',
              count: agreements.filter((a) => a.status === 'active').length,
            },
            {
              value: 'completed',
              label: 'Completed',
              count: agreements.filter((a) => a.status === 'completed').length,
            },
          ]}
          value={status}
          onChange={setStatus}
        />
        <OverviewToolbar>
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'Status' },
              { value: 'pending', label: 'Awaiting signature' },
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
          <OverviewSearch
            placeholder="Agreement ID, renter, equipment"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </OverviewToolbar>

        {rows.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <p className="text-lg font-semibold text-[var(--cv-text)]">No agreements found</p>
            <p className="mt-1 text-sm text-[var(--cv-muted)]">
              Adjust filters or create a new rental agreement.
            </p>
            <div className="mt-4 flex justify-center">
              <PrimaryActionButton onClick={() => setOpen(true)}>Create agreement</PrimaryActionButton>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[var(--cv-border)]">
            {rows.map((a) => (
              <div key={a.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{a.id}</p>
                    <Badge status={a.status} />
                    <Badge status={a.signed ? 'verified' : 'pending'}>
                      {a.signed ? 'E-signed' : 'Signature pending'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-[var(--cv-muted)]">
                    {a.renter} · {a.equipment}
                  </p>
                  <p className="text-xs text-[var(--cv-muted)]">
                    {a.period}
                    {a.dailyRate != null ? ` · ${formatCurrency(a.dailyRate)}/day` : ''}
                    {a.deposit != null ? ` · Deposit ${formatCurrency(a.deposit)}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary">
                    Download PDF
                  </Button>
                  {!a.signed ? (
                    <Button size="sm">Send reminder</Button>
                  ) : (
                    <Button size="sm" variant="ghost">
                      View history
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <OverviewFooter countLabel={`${rows.length} results`} disablePrev disableNext />
      </OverviewPanel>

      <Sheet
        open={open}
        title={createdId ? 'Agreement created' : 'Create agreement'}
        onClose={resetAndClose}
        className="max-w-xl"
      >
        {createdId ? (
          <div className="space-y-4 pb-2">
            <div className="rounded-[12px] border border-[var(--cv-primary)]/30 bg-[var(--cv-primary-soft)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--cv-primary)]">{createdId} is ready</p>
              <p className="mt-1 text-sm text-[var(--cv-muted)]">
                {form.sendForSignature
                  ? `Signature request sent to ${form.renterName || 'the renter'}.`
                  : 'Agreement marked active without e-signature.'}
              </p>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--cv-muted)]">Renter</dt>
                <dd className="font-medium text-[var(--cv-text)]">{form.renterName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--cv-muted)]">Asset</dt>
                <dd className="text-right font-medium text-[var(--cv-text)]">{form.equipment}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--cv-muted)]">Period</dt>
                <dd className="font-medium text-[var(--cv-text)]">
                  {formatPeriod(form.startDate, form.endDate)}
                </dd>
              </div>
            </dl>
            <div className="flex gap-2 pt-2">
              <Button
                fullWidth
                onClick={() => {
                  setCreatedId(null)
                  setForm(emptyForm)
                }}
              >
                Create another
              </Button>
              <Button fullWidth variant="secondary" onClick={resetAndClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="space-y-5 pb-2"
            onSubmit={(e) => {
              e.preventDefault()
              handleCreate()
            }}
          >
            <section className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--cv-muted)]">
                Renter
              </p>
              <FormInput
                label="Full name / business"
                required
                value={form.renterName}
                error={errors.renterName}
                placeholder="e.g. ABC Farm"
                onChange={(e) => patch('renterName', e.target.value)}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <FormInput
                  label="Phone"
                  required
                  type="tel"
                  value={form.renterPhone}
                  error={errors.renterPhone}
                  placeholder="10-digit mobile"
                  onChange={(e) => patch('renterPhone', e.target.value)}
                />
                <FormInput
                  label="Email (optional)"
                  type="email"
                  value={form.renterEmail}
                  placeholder="for e-sign link"
                  onChange={(e) => patch('renterEmail', e.target.value)}
                />
              </div>
            </section>

            <section className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--cv-muted)]">
                Asset & period
              </p>
              <Select
                label="Equipment / asset"
                value={form.equipment}
                onChange={(e) => patch('equipment', e.target.value)}
                options={EQUIPMENT_OPTIONS}
              />
              {errors.equipment ? (
                <p className="text-xs text-[var(--cv-danger)]">{errors.equipment}</p>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                <FormInput
                  label="Start date"
                  required
                  type="date"
                  value={form.startDate}
                  error={errors.startDate}
                  onChange={(e) => patch('startDate', e.target.value)}
                />
                <FormInput
                  label="End date"
                  required
                  type="date"
                  value={form.endDate}
                  error={errors.endDate}
                  onChange={(e) => patch('endDate', e.target.value)}
                />
              </div>
              <FormInput
                label="Pickup / delivery location"
                value={form.deliveryLocation}
                placeholder="Village, farm gate, or warehouse"
                onChange={(e) => patch('deliveryLocation', e.target.value)}
              />
            </section>

            <section className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--cv-muted)]">
                Commercials
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <FormInput
                  label="Daily rate (₹)"
                  required
                  type="number"
                  min={0}
                  value={form.dailyRate}
                  error={errors.dailyRate}
                  onChange={(e) => patch('dailyRate', e.target.value)}
                />
                <FormInput
                  label="Security deposit (₹)"
                  required
                  type="number"
                  min={0}
                  value={form.deposit}
                  error={errors.deposit}
                  onChange={(e) => patch('deposit', e.target.value)}
                />
                <FormInput
                  label="Late fee / day (₹)"
                  type="number"
                  min={0}
                  value={form.lateFeePerDay}
                  onChange={(e) => patch('lateFeePerDay', e.target.value)}
                />
              </div>
              {rentalDays > 0 ? (
                <div className="rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface)] px-4 py-3 text-sm">
                  <div className="flex justify-between text-[var(--cv-muted)]">
                    <span>
                      Estimated rent · {rentalDays} day{rentalDays === 1 ? '' : 's'}
                    </span>
                    <span className="font-medium text-[var(--cv-text)]">
                      {formatCurrency(estimatedRent)}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-[var(--cv-muted)]">
                    <span>Deposit held in escrow</span>
                    <span className="font-medium text-[var(--cv-text)]">
                      {formatCurrency(Number(form.deposit) || 0)}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-[var(--cv-border)] pt-2 font-semibold text-[var(--cv-text)]">
                    <span>Total at booking</span>
                    <span className="text-[var(--cv-primary)]">{formatCurrency(estimatedTotal)}</span>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--cv-muted)]">
                Terms
              </p>
              <div className="space-y-1 rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface)] px-3 py-2">
                <div className="flex items-center justify-between gap-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--cv-text)]">Damage liability clause</p>
                    <p className="text-xs text-[var(--cv-muted)]">
                      Deduct repair costs from deposit after inspection
                    </p>
                  </div>
                  <Switch
                    checked={form.damageClause}
                    onChange={(v) => patch('damageClause', v)}
                    aria-label="Damage liability clause"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-[var(--cv-border)] py-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--cv-text)]">Require insurance proof</p>
                    <p className="text-xs text-[var(--cv-muted)]">
                      Renter uploads valid cover before pickup
                    </p>
                  </div>
                  <Switch
                    checked={form.includeInsurance}
                    onChange={(v) => patch('includeInsurance', v)}
                    aria-label="Require insurance proof"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-[var(--cv-border)] py-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--cv-text)]">Send for e-signature</p>
                    <p className="text-xs text-[var(--cv-muted)]">
                      SMS / email link to renter — stays pending until signed
                    </p>
                  </div>
                  <Switch
                    checked={form.sendForSignature}
                    onChange={(v) => patch('sendForSignature', v)}
                    aria-label="Send for e-signature"
                  />
                </div>
              </div>
              <FormTextarea
                label="Additional notes"
                value={form.notes}
                placeholder="Special conditions, operator included, fuel policy…"
                onChange={(e) => patch('notes', e.target.value)}
              />
            </section>

            <div className="flex gap-2 pt-1">
              <Button type="submit" fullWidth>
                {form.sendForSignature ? 'Create & send for signature' : 'Create agreement'}
              </Button>
              <Button type="button" variant="ghost" onClick={resetAndClose}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Sheet>
    </OverviewShell>
  )
}
