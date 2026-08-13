import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckIcon,
  ChevronLeftIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput, FormTextarea } from '../common/FormInput'
import { Select } from '../common/Select'
import { Switch } from '../common/Switch'
import { formatCurrency, cn } from '../../utils/format'

const STEP_LABELS = ['Renter', 'Asset & dates', 'Terms', 'Review']

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

type FormState = typeof emptyForm

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

function StepProgress({ step }: { step: number }) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1
          const done = n < step
          const active = n === step
          return (
            <div key={label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition',
                  done && 'bg-[var(--cv-nav-active-fg)] text-[var(--cv-nav-active-bg)]',
                  active &&
                    'bg-[var(--cv-nav-active-fg)] text-[var(--cv-nav-active-bg)] ring-4 ring-[color-mix(in_srgb,var(--cv-nav-active-fg)_25%,transparent)]',
                  !done && !active && 'bg-[var(--cv-elevated)] text-[var(--cv-muted)]',
                )}
              >
                {done ? <CheckIcon className="h-4 w-4" /> : n}
              </div>
              <span
                className={cn(
                  'hidden truncate text-[11px] font-medium sm:block',
                  active ? 'text-[var(--cv-text)]' : 'text-[var(--cv-muted)]',
                )}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--cv-elevated)]">
        <div
          className="h-full rounded-full bg-[var(--cv-nav-active-fg)] transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>
    </div>
  )
}

interface AgreementCreateFlowProps {
  onDone: () => void
  onBackToCategories?: () => void
}

export function AgreementCreateFlow({ onDone, onBackToCategories }: AgreementCreateFlowProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [createdId, setCreatedId] = useState<string | null>(null)

  const rentalDays = daysBetween(form.startDate, form.endDate)
  const estimatedRent = rentalDays * (Number(form.dailyRate) || 0)
  const estimatedTotal = estimatedRent + (Number(form.deposit) || 0)

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validateStep = (s: number) => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (s === 1) {
      if (!form.renterName.trim()) next.renterName = 'Renter name is required'
      if (!form.renterPhone.trim() || form.renterPhone.replace(/\D/g, '').length < 10) {
        next.renterPhone = 'Enter a valid 10-digit phone'
      }
    }
    if (s === 2) {
      if (!form.equipment) next.equipment = 'Select equipment or asset'
      if (!form.startDate) next.startDate = 'Start date is required'
      if (!form.endDate) next.endDate = 'End date is required'
      if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
        next.endDate = 'End date must be on or after start date'
      }
    }
    if (s === 3) {
      if (!form.dailyRate || Number(form.dailyRate) <= 0) next.dailyRate = 'Enter a valid daily rate'
      if (!form.deposit || Number(form.deposit) < 0) next.deposit = 'Enter a valid deposit'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const goNext = () => {
    if (!validateStep(step)) return
    if (step === 4) {
      const id = `AGR-${8700 + Math.floor(Math.random() * 200)}`
      setCreatedId(id)
      return
    }
    setStep((s) => s + 1)
  }

  const goBack = () => {
    if (step === 1 && onBackToCategories) {
      onBackToCategories()
      return
    }
    setStep((s) => Math.max(1, s - 1))
  }

  const summary = useMemo(
    () => [
      { label: 'Renter', value: form.renterName || '—' },
      { label: 'Phone', value: form.renterPhone || '—' },
      { label: 'Asset', value: form.equipment || '—' },
      { label: 'Period', value: formatPeriod(form.startDate, form.endDate) },
      { label: 'Days', value: rentalDays ? String(rentalDays) : '—' },
      { label: 'Daily rate', value: formatCurrency(Number(form.dailyRate) || 0) },
      { label: 'Deposit', value: formatCurrency(Number(form.deposit) || 0) },
      { label: 'Est. total', value: formatCurrency(estimatedTotal) },
    ],
    [form, rentalDays, estimatedTotal],
  )

  if (createdId) {
    return (
      <Card className="!p-5 sm:!p-6">
        <div className="mx-auto max-w-lg space-y-5 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--cv-primary-soft)] text-[var(--cv-nav-active-bg)]">
            <DocumentTextIcon className="h-7 w-7" strokeWidth={1.5} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-[var(--cv-text)]">Agreement created</h1>
            <p className="mt-2 text-sm text-[var(--cv-muted)]">
              <span className="font-semibold text-[var(--cv-text)]">{createdId}</span> is ready.
              {form.sendForSignature
                ? ` Signature request sent to ${form.renterName || 'the renter'}.`
                : ' Marked active without e-signature.'}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] px-4 py-3 text-left text-sm">
            <p className="font-medium text-[var(--cv-text)]">{form.equipment}</p>
            <p className="mt-1 text-[var(--cv-muted)]">
              {form.renterName} · {formatPeriod(form.startDate, form.endDate)}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button fullWidth onClick={() => navigate('/dashboard/agreements')}>
              View agreements
            </Button>
            <Button fullWidth variant="secondary" onClick={onDone}>
              Done
            </Button>
          </div>
          <button
            type="button"
            className="text-sm font-medium text-[var(--cv-muted)] hover:text-[var(--cv-text)]"
            onClick={() => {
              setCreatedId(null)
              setForm(emptyForm)
              setStep(1)
              setErrors({})
            }}
          >
            Create another agreement
          </button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="!p-5 sm:!p-6">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          {onBackToCategories && step === 1 ? (
            <button
              type="button"
              onClick={onBackToCategories}
              className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-[var(--cv-muted)] hover:text-[var(--cv-text)]"
            >
              <ChevronLeftIcon className="h-4 w-4" /> Back to categories
            </button>
          ) : null}
          <h1 className="text-2xl font-bold tracking-tight text-[var(--cv-text)]">Create agreement</h1>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">
            {step === 1 && 'Who is renting from you?'}
            {step === 2 && 'Which asset and for how long?'}
            {step === 3 && 'Commercials, clauses, and signature'}
            {step === 4 && 'Confirm details before creating'}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--cv-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--cv-nav-active-bg)]">
          <DocumentTextIcon className="h-3.5 w-3.5" />
          Agreements
        </span>
      </div>

      <StepProgress step={step} />

      {step === 1 ? (
        <div className="space-y-4">
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
              placeholder="renter@email.com"
              onChange={(e) => patch('renterEmail', e.target.value)}
            />
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <Select
            label="Equipment / asset"
            required
            value={form.equipment}
            error={errors.equipment}
            options={EQUIPMENT_OPTIONS}
            onChange={(e) => patch('equipment', e.target.value)}
          />
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
            label="Delivery / pickup location"
            value={form.deliveryLocation}
            placeholder="Farm address or landmark"
            onChange={(e) => patch('deliveryLocation', e.target.value)}
          />
          {rentalDays > 0 ? (
            <p className="rounded-xl bg-[var(--cv-elevated)] px-3 py-2.5 text-sm text-[var(--cv-muted)]">
              Rental period: <strong className="text-[var(--cv-text)]">{rentalDays} days</strong>
            </p>
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <FormInput
              label="Daily rate (₹)"
              required
              type="number"
              value={form.dailyRate}
              error={errors.dailyRate}
              onChange={(e) => patch('dailyRate', e.target.value)}
            />
            <FormInput
              label="Security deposit (₹)"
              required
              type="number"
              value={form.deposit}
              error={errors.deposit}
              onChange={(e) => patch('deposit', e.target.value)}
            />
            <FormInput
              label="Late fee / day (₹)"
              type="number"
              value={form.lateFeePerDay}
              onChange={(e) => patch('lateFeePerDay', e.target.value)}
            />
          </div>
          <div className="space-y-1 rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] px-4">
            <div className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-medium text-[var(--cv-text)]">Send for e-signature</p>
                <p className="text-xs text-[var(--cv-muted)]">Renter receives a signing link by SMS / email</p>
              </div>
              <Switch
                checked={form.sendForSignature}
                onChange={(v) => patch('sendForSignature', v)}
                aria-label="Send for e-signature"
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-[var(--cv-border)] py-3">
              <div>
                <p className="text-sm font-medium text-[var(--cv-text)]">Include insurance clause</p>
              </div>
              <Switch
                checked={form.includeInsurance}
                onChange={(v) => patch('includeInsurance', v)}
                aria-label="Include insurance clause"
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-[var(--cv-border)] py-3">
              <div>
                <p className="text-sm font-medium text-[var(--cv-text)]">Include damage & overdue clauses</p>
              </div>
              <Switch
                checked={form.damageClause}
                onChange={(v) => patch('damageClause', v)}
                aria-label="Include damage and overdue clauses"
              />
            </div>
          </div>
          <FormTextarea
            label="Notes (optional)"
            value={form.notes}
            placeholder="Special terms, operator requirements…"
            onChange={(e) => patch('notes', e.target.value)}
          />
          {rentalDays > 0 ? (
            <div className="rounded-2xl border border-[color-mix(in_srgb,var(--cv-nav-active-fg)_35%,transparent)] bg-[var(--cv-primary-soft)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--cv-text)]">Estimate</p>
              <p className="mt-1 text-sm text-[var(--cv-muted)]">
                Rent {formatCurrency(estimatedRent)} + deposit {formatCurrency(Number(form.deposit) || 0)} ={' '}
                <strong className="text-[var(--cv-text)]">{formatCurrency(estimatedTotal)}</strong>
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <dl className="divide-y divide-[var(--cv-border)] rounded-2xl border border-[var(--cv-border)]">
            {summary.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <dt className="text-[var(--cv-muted)]">{row.label}</dt>
                <dd className="text-right font-medium text-[var(--cv-text)]">{row.value}</dd>
              </div>
            ))}
          </dl>
          <ul className="space-y-1.5 text-sm text-[var(--cv-muted)]">
            <li>· E-signature: {form.sendForSignature ? 'Yes' : 'No — activate directly'}</li>
            <li>· Insurance clause: {form.includeInsurance ? 'Included' : 'Not included'}</li>
            <li>· Damage / overdue clauses: {form.damageClause ? 'Included' : 'Not included'}</li>
            {form.notes.trim() ? <li>· Notes: {form.notes.trim()}</li> : null}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-between gap-2">
        <Button variant="secondary" onClick={goBack} disabled={step === 1 && !onBackToCategories}>
          Back
        </Button>
        <Button onClick={goNext}>
          {step === 4
            ? form.sendForSignature
              ? 'Create & send for signature'
              : 'Create agreement'
            : 'Continue'}
        </Button>
      </div>
    </Card>
  )
}
