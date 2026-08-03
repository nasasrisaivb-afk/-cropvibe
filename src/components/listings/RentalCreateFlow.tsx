import { useMemo, useState, type ReactNode } from 'react'
import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  Cog6ToothIcon,
  MapIcon,
  PencilSquareIcon,
  TruckIcon,
  UserGroupIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import type { ComponentType, SVGProps } from 'react'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'
import { Select } from '../common/Select'
import { formatCurrency, cn } from '../../utils/format'
import {
  STEP_LABELS,
  getCategoryById,
  RENTAL_CATEGORIES,
  type AdaptiveField,
  type RentalCategory,
  type RentalCategoryId,
} from './rentalCategoryContent'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

const CATEGORY_ICONS: Record<RentalCategoryId, IconType> = {
  'farm-machinery': Cog6ToothIcon,
  vehicles: TruckIcon,
  tools: WrenchScrewdriverIcon,
  labour: UserGroupIcon,
  'driver-services': UserIcon,
  'agricultural-land': MapIcon,
  storage: BuildingStorefrontIcon,
}

type FieldValues = Record<string, string>
type ChecklistState = Record<string, boolean>

interface RentalFormState {
  categoryId: RentalCategoryId | ''
  name: string
  description: string
  fields: FieldValues
  checklist: ChecklistState
  rate: string
  unit: string
  depositEnabled: boolean
  deposit: string
  area: string
  photoCount: number
}

const INITIAL_FORM: RentalFormState = {
  categoryId: '',
  name: '',
  description: '',
  fields: {},
  checklist: {},
  rate: '',
  unit: 'day',
  depositEnabled: false,
  deposit: '',
  area: '25',
  photoCount: 0,
}

function StepProgress({ step, color }: { step: number; color: string }) {
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
                  done && 'text-white',
                  active && 'text-white ring-4',
                  !done && !active && 'bg-[var(--cv-elevated)] text-[var(--cv-muted)]',
                )}
                style={
                  done || active
                    ? {
                        backgroundColor: color,
                        ...(active ? { boxShadow: `0 0 0 4px ${color}33` } : {}),
                      }
                    : undefined
                }
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
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function parseMultiValue(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

function MultiSelectField({
  field,
  value,
  error,
  onChange,
}: {
  field: AdaptiveField
  value: string
  error?: string
  onChange: (v: string) => void
}) {
  const selected = new Set(parseMultiValue(value))
  const options = field.options ?? []

  const toggle = (optionValue: string) => {
    const next = new Set(selected)
    if (next.has(optionValue)) next.delete(optionValue)
    else next.add(optionValue)
    onChange([...next].join(','))
  }

  return (
    <div className="block w-full space-y-2 text-sm text-[var(--cv-muted)]">
      <span className="text-[var(--cv-text)]">
        {field.label}
        {field.required ? <span className="ml-1 text-[var(--cv-danger)]">*</span> : null}
      </span>
      <div className="flex flex-wrap gap-2 rounded-xl border border-[var(--cv-border)] p-3">
        {options.map((opt) => {
          const active = selected.has(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={cn(
                'rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition focus-ring',
                active
                  ? 'border-[var(--cv-primary)] bg-[var(--cv-primary-soft)] text-[var(--cv-primary)]'
                  : 'border-[var(--cv-border)] bg-[var(--cv-surface)] text-[var(--cv-text)] hover:border-[var(--cv-muted)]/50',
              )}
            >
              {active ? '✓ ' : ''}
              {opt.label}
            </button>
          )
        })}
      </div>
      {error ? <p className="text-xs text-[var(--cv-danger)]">{error}</p> : null}
      {!error && field.helperText ? <p className="text-xs text-[var(--cv-muted)]">{field.helperText}</p> : null}
    </div>
  )
}

function AdaptiveFieldInput({
  field,
  value,
  error,
  onChange,
}: {
  field: AdaptiveField
  value: string
  error?: string
  onChange: (v: string) => void
}) {
  if (field.type === 'multi-select' && field.options) {
    return <MultiSelectField field={field} value={value} error={error} onChange={onChange} />
  }
  if (field.type === 'select' && field.options) {
    return (
      <Select
        label={field.label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={field.options}
        required={field.required}
        error={error}
        helperText={field.helperText}
      />
    )
  }
  if (field.type === 'textarea') {
    return (
      <FormInput
        as="textarea"
        label={field.label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        error={error}
        helperText={field.helperText}
      />
    )
  }
  return (
    <FormInput
      label={field.label}
      type={field.type === 'number' ? 'number' : 'text'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      required={field.required}
      error={error}
      helperText={field.helperText}
    />
  )
}

function MarketReferenceBox({ category }: { category: RentalCategory }) {
  const { pricing, color } = category
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: `${color}44`, backgroundColor: category.softBg }}
    >
      <p className="text-sm font-semibold text-[var(--cv-text)]">Market reference rates</p>
      <p className="mt-0.5 text-xs text-[var(--cv-muted)]">Based on similar listings · per {pricing.unit}</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { label: 'Budget', value: pricing.budget },
          { label: 'Average', value: pricing.average },
          { label: 'Premium', value: pricing.premium },
        ].map((tier) => (
          <div
            key={tier.label}
            className="rounded-lg bg-[var(--cv-surface)] px-2 py-2.5 text-center shadow-sm"
          >
            <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--cv-muted)]">
              {tier.label}
            </p>
            <p className="mt-1 text-xs font-semibold leading-snug text-[var(--cv-text)] sm:text-sm">
              {tier.value}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-[var(--cv-muted)]">{pricing.note}</p>
    </div>
  )
}

function suggestRate(category: RentalCategory, checklist: ChecklistState): { min: number; max: number; label: string } {
  const checked = Object.values(checklist).filter(Boolean).length
  const total = category.conditionItems.length || 1
  const score = checked / total

  const defaults: Record<string, [number, number, number]> = {
    'farm-machinery': [550, 1000, 1550],
    vehicles: [750, 1250, 1900],
    tools: [80, 275, 500],
    labour: [475, 950, 2000],
    'driver-services': [2000, 3000, 4500],
    'agricultural-land': [10000, 17500, 37500],
    storage: [15, 28, 70],
  }
  const [budget, avg, premium] = defaults[category.id] ?? [500, 1000, 1500]
  if (score > 0.8) return { min: Math.round(premium * 0.9), max: Math.round(premium * 1.1), label: 'premium' }
  if (score > 0.5) return { min: Math.round(avg * 0.9), max: Math.round(avg * 1.1), label: 'average' }
  return { min: Math.round(budget * 0.9), max: Math.round(budget * 1.1), label: 'budget' }
}

function unitOptions(category: RentalCategory) {
  const unit = category.pricing.unit
  if (unit === 'season') {
    return [
      { value: 'season', label: 'Per season' },
      { value: 'year', label: 'Per year' },
      { value: 'acre-season', label: 'Per acre / season' },
    ]
  }
  if (unit === 'month') {
    return [
      { value: 'month', label: 'Per month' },
      { value: 'sqft-month', label: 'Per sq.ft / month' },
      { value: 'season', label: 'Per season' },
    ]
  }
  if (category.id === 'labour' || category.id === 'driver-services') {
    return [
      { value: 'day', label: 'Per day' },
      { value: 'hour', label: 'Per hour' },
      { value: 'project', label: 'Per project' },
    ]
  }
  return [
    { value: 'day', label: 'Per day' },
    { value: 'hour', label: 'Per hour' },
    { value: 'shift', label: 'Per shift' },
  ]
}

export function RentalCreateFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<RentalFormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [editingSection, setEditingSection] = useState<'details' | 'pricing' | null>(null)

  const category = getCategoryById(form.categoryId)
  const accent = category?.color ?? '#6B4423'
  const rate = Number(form.rate) || 0
  const suggestion = useMemo(
    () => (category ? suggestRate(category, form.checklist) : null),
    [category, form.checklist],
  )

  const update = <K extends keyof RentalFormState>(key: K, value: RentalFormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }))
    setErrors((p) => {
      const next = { ...p }
      delete next[key]
      return next
    })
  }

  const updateField = (id: string, value: string) => {
    setForm((p) => ({ ...p, fields: { ...p.fields, [id]: value } }))
    setErrors((p) => {
      const next = { ...p }
      delete next[id]
      return next
    })
  }

  const toggleCheck = (item: string) => {
    setForm((p) => ({
      ...p,
      checklist: { ...p.checklist, [item]: !p.checklist[item] },
    }))
  }

  const selectCategory = (id: RentalCategoryId) => {
    const cat = getCategoryById(id)
    setForm((p) => ({
      ...p,
      categoryId: id,
      fields: {},
      checklist: {},
      unit: cat?.pricing.unit ?? 'day',
      name: '',
      description: '',
    }))
    setErrors({})
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (step === 1 && !form.categoryId) e.categoryId = 'Select a category to continue'
    if (step === 2 && category) {
      if (!form.name.trim()) e.name = 'Required'
      for (const field of category.adaptiveFields) {
        if (field.required && !form.fields[field.id]?.trim()) {
          e[field.id] = 'Required'
        }
      }
      if (form.photoCount < 1) e.photos = `Add at least 1 photo (${category.minPhotos} recommended)`
    }
    if (step === 3) {
      if (!form.rate || Number(form.rate) <= 0) e.rate = 'Enter a valid rate'
      if (!form.area) e.area = 'Required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const goNext = () => {
    if (!validate()) return
    if (step === 4) {
      onDone()
      return
    }
    setStep((s) => s + 1)
    setEditingSection(null)
  }

  const goBack = () => {
    if (editingSection) {
      setEditingSection(null)
      return
    }
    setStep((s) => Math.max(1, s - 1))
  }

  const applySuggestion = () => {
    if (!suggestion) return
    update('rate', String(Math.round((suggestion.min + suggestion.max) / 2)))
  }

  const checklistDone = category
    ? category.conditionItems.filter((i) => form.checklist[i]).length
    : 0
  const checklistTotal = category?.conditionItems.length ?? 0
  const readiness =
    checklistTotal === 0
      ? 100
      : Math.round(
          ((form.name ? 1 : 0) +
            (form.photoCount >= 1 ? 1 : 0) +
            (rate > 0 ? 1 : 0) +
            checklistDone / Math.max(checklistTotal, 1)) /
            4 *
            100,
        )

  // Inline edit from review
  if (editingSection === 'details' && category) {
    return (
      <Card className="!p-5 sm:!p-6">
        <button
          type="button"
          onClick={() => setEditingSection(null)}
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--cv-muted)] hover:text-[var(--cv-text)]"
        >
          <ChevronLeftIcon className="h-4 w-4" /> Back to review
        </button>
        <h2 className="mb-4 text-lg font-bold">Edit details</h2>
        <DetailsStep
          form={form}
          category={category}
          errors={errors}
          update={update}
          updateField={updateField}
          toggleCheck={toggleCheck}
        />
        <div className="mt-6 flex justify-end">
          <Button roleColor="rental" onClick={() => setEditingSection(null)}>
            Save changes
          </Button>
        </div>
      </Card>
    )
  }

  if (editingSection === 'pricing' && category) {
    return (
      <Card className="!p-5 sm:!p-6">
        <button
          type="button"
          onClick={() => setEditingSection(null)}
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--cv-muted)] hover:text-[var(--cv-text)]"
        >
          <ChevronLeftIcon className="h-4 w-4" /> Back to review
        </button>
        <h2 className="mb-4 text-lg font-bold">Edit pricing</h2>
        <PricingStep
          form={form}
          category={category}
          errors={errors}
          suggestion={suggestion}
          update={update}
          applySuggestion={applySuggestion}
        />
        <div className="mt-6 flex justify-end">
          <Button roleColor="rental" onClick={() => setEditingSection(null)}>
            Save changes
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="!p-5 sm:!p-6">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--cv-text)]">Add Equipment</h1>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">
            {step === 1 && 'Choose what you want to list'}
            {step === 2 && category && `Tell renters about your ${category.title.toLowerCase()}`}
            {step === 3 && 'Set competitive rates with market guidance'}
            {step === 4 && 'Preview how renters will see your listing'}
          </p>
        </div>
        {category && step > 1 ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: category.softBg, color: category.color }}
          >
            {category.title}
          </span>
        ) : null}
      </div>

      <StepProgress step={step} color={accent} />

      {step === 1 && (
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {RENTAL_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id]
              const selected = form.categoryId === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => selectCategory(cat.id)}
                  className={cn(
                    'rounded-xl border-2 p-4 text-left transition focus-ring',
                    selected
                      ? 'shadow-sm'
                      : 'border-[var(--cv-border)] bg-[var(--cv-surface)] hover:border-[var(--cv-muted)]/40',
                  )}
                  style={
                    selected
                      ? { borderColor: cat.color, backgroundColor: cat.softBg }
                      : undefined
                  }
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: selected ? cat.color : cat.softBg, color: selected ? '#fff' : cat.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-[var(--cv-text)]">{cat.title}</p>
                        {selected ? (
                          <CheckCircleIcon className="h-5 w-5 shrink-0" style={{ color: cat.color }} />
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs leading-snug text-[var(--cv-muted)]">{cat.tagline}</p>
                      <ul className="mt-2.5 space-y-0.5">
                        {cat.examples.slice(0, 3).map((ex) => (
                          <li key={ex} className="flex items-start gap-1.5 text-xs text-[var(--cv-text)]/80">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
                            {ex}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          {errors.categoryId ? <p className="mt-3 text-sm text-[var(--cv-danger)]">{errors.categoryId}</p> : null}
          {category ? (
            <p className="mt-4 rounded-lg bg-[var(--cv-elevated)] px-3 py-2.5 text-sm text-[var(--cv-muted)]">
              {category.description}
            </p>
          ) : null}
        </div>
      )}

      {step === 2 && category && (
        <DetailsStep
          form={form}
          category={category}
          errors={errors}
          update={update}
          updateField={updateField}
          toggleCheck={toggleCheck}
        />
      )}

      {step === 3 && category && (
        <PricingStep
          form={form}
          category={category}
          errors={errors}
          suggestion={suggestion}
          update={update}
          applySuggestion={applySuggestion}
        />
      )}

      {step === 4 && category && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[var(--cv-text)]">Listing readiness</p>
              <p className="text-xs text-[var(--cv-muted)]">
                {checklistDone}/{checklistTotal} checks · {form.photoCount} photo{form.photoCount === 1 ? '' : 's'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: accent }}>
                {readiness}%
              </p>
              <p className="text-[10px] uppercase tracking-wide text-[var(--cv-muted)]">ready</p>
            </div>
          </div>

          <section className="rounded-xl border border-[var(--cv-border)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-[var(--cv-text)]">Details</h3>
              <button
                type="button"
                onClick={() => setEditingSection('details')}
                className="inline-flex items-center gap-1 text-xs font-semibold"
                style={{ color: accent }}
              >
                <PencilSquareIcon className="h-3.5 w-3.5" /> Edit
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-[var(--cv-muted)]">Category:</span>{' '}
                <strong>{category.title}</strong>
              </p>
              <p>
                <span className="text-[var(--cv-muted)]">Name:</span> <strong>{form.name}</strong>
              </p>
              {form.description ? (
                <p className="text-[var(--cv-muted)]">{form.description}</p>
              ) : null}
              {category.adaptiveFields.map((f) => {
                const raw = form.fields[f.id]
                if (!raw) return null
                const display =
                  f.type === 'multi-select' || f.type === 'select'
                    ? parseMultiValue(raw)
                        .map((v) => f.options?.find((o) => o.value === v)?.label ?? v)
                        .join(', ')
                    : raw
                return (
                  <p key={f.id}>
                    <span className="text-[var(--cv-muted)]">{f.label}:</span> {display}
                  </p>
                )
              })}
              <p>
                <span className="text-[var(--cv-muted)]">Photos:</span> {form.photoCount} uploaded
              </p>
              {checklistTotal > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {category.conditionItems.map((item) => (
                    <span
                      key={item}
                      className={cn(
                        'rounded-md px-2 py-0.5 text-[11px]',
                        form.checklist[item]
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-[var(--cv-elevated)] text-[var(--cv-muted)]',
                      )}
                    >
                      {form.checklist[item] ? '✓ ' : '○ '}
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-xl border border-[var(--cv-border)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-[var(--cv-text)]">Pricing & reach</h3>
              <button
                type="button"
                onClick={() => setEditingSection('pricing')}
                className="inline-flex items-center gap-1 text-xs font-semibold"
                style={{ color: accent }}
              >
                <PencilSquareIcon className="h-3.5 w-3.5" /> Edit
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-[var(--cv-muted)]">Rate:</span>{' '}
                <strong>
                  {formatCurrency(rate)}/{form.unit}
                </strong>
              </p>
              {form.depositEnabled && form.deposit ? (
                <p>
                  <span className="text-[var(--cv-muted)]">Deposit:</span> {formatCurrency(Number(form.deposit))}
                </p>
              ) : (
                <p className="text-[var(--cv-muted)]">No security deposit</p>
              )}
              <p>
                <span className="text-[var(--cv-muted)]">Service area:</span> {form.area} km
              </p>
              {rate > 0 ? (
                <div className="mt-2 rounded-lg bg-[var(--cv-elevated)] p-3 text-xs">
                  <p>Platform fee: {formatCurrency(rate * 0.15)} (15%)</p>
                  <p className="font-semibold" style={{ color: accent }}>
                    Your earnings: {formatCurrency(rate * 0.85)} (85%)
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          <p className="rounded-lg bg-[var(--cv-elevated)] px-3 py-2.5 text-xs text-[var(--cv-muted)]">
            Your listing goes live after a quick review (usually under 1 hour). Honest details and clear photos get booked faster.
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-between gap-3">
        <Button variant="secondary" roleColor="rental" disabled={step === 1} onClick={goBack}>
          Previous
        </Button>
        <div className="flex gap-2">
          {step === 4 ? (
            <Button variant="secondary" roleColor="rental" onClick={onDone}>
              Save draft
            </Button>
          ) : null}
          <Button roleColor="rental" onClick={goNext}>
            {step === 4 ? 'Publish listing' : 'Continue'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

function DetailSection({
  step,
  title,
  subtitle,
  color,
  children,
}: {
  step: number
  title: string
  subtitle: string
  color: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-[var(--cv-border)] p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {step}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-[var(--cv-text)]">{title}</h3>
          <p className="text-xs text-[var(--cv-muted)]">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function DetailsStep({
  form,
  category,
  errors,
  update,
  updateField,
  toggleCheck,
}: {
  form: RentalFormState
  category: RentalCategory
  errors: Record<string, string>
  update: <K extends keyof RentalFormState>(key: K, value: RentalFormState[K]) => void
  updateField: (id: string, value: string) => void
  toggleCheck: (item: string) => void
}) {
  const isProfile = category.id === 'labour' || category.id === 'driver-services'
  const checkedCount = category.conditionItems.filter((i) => form.checklist[i]).length
  const allChecked =
    category.conditionItems.length > 0 && checkedCount === category.conditionItems.length

  const toggleAllChecks = () => {
    const next: ChecklistState = {}
    for (const item of category.conditionItems) next[item] = !allChecked
    update('checklist', next)
  }

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border px-4 py-3 text-sm"
        style={{ borderColor: `${category.color}44`, backgroundColor: category.softBg }}
      >
        <p className="font-medium text-[var(--cv-text)]">Tip for {category.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--cv-muted)]">
          Fill only what renters need to decide. Honest condition checks build more trust than perfect
          photos alone.
        </p>
      </div>

      <DetailSection
        step={1}
        title="Name your listing"
        subtitle="Renters see this first in search results"
        color={category.color}
      >
        <div className="space-y-4">
          <FormInput
            label={category.nameLabel}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder={category.namePlaceholder}
            required
            error={errors.name}
            helperText="Include model, size, or location if it helps matching"
          />
          <FormInput
            as="textarea"
            label="What renters get (optional)"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Highlight recent servicing, special features, or delivery options…"
            helperText="Benefit-focused details help renters decide faster"
          />
        </div>
      </DetailSection>

      <DetailSection
        step={2}
        title="Asset specifics"
        subtitle="Only questions that matter for this category"
        color={category.color}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {category.adaptiveFields.map((field) => (
            <div
              key={field.id}
              className={
                field.type === 'textarea' || field.type === 'multi-select' ? 'sm:col-span-2' : undefined
              }
            >
              <AdaptiveFieldInput
                field={field}
                value={form.fields[field.id] ?? ''}
                error={errors[field.id]}
                onChange={(v) => updateField(field.id, v)}
              />
            </div>
          ))}
        </div>
      </DetailSection>

      <DetailSection
        step={3}
        title="Photos"
        subtitle={`Min ${category.minPhotos} recommended`}
        color={category.color}
      >
        <div className="rounded-xl border-2 border-dashed border-[var(--cv-border)] bg-[var(--cv-elevated)]/40 p-5 text-center">
          <p className="text-sm font-medium text-[var(--cv-text)]">
            Upload photos <span className="text-[var(--cv-danger)]">*</span>
          </p>
          <p className="mt-1 text-xs text-[var(--cv-muted)]">{category.photoGuidance}</p>
          <input
            type="file"
            accept="image/*"
            multiple
            className="mx-auto mt-3 block max-w-full text-sm"
            onChange={(e) => update('photoCount', e.target.files?.length ?? 0)}
          />
          {form.photoCount > 0 ? (
            <p className="mt-2 text-xs font-medium text-emerald-700">
              {form.photoCount} file{form.photoCount === 1 ? '' : 's'} selected
            </p>
          ) : null}
        </div>
        {errors.photos ? <p className="mt-2 text-sm text-[var(--cv-danger)]">{errors.photos}</p> : null}
      </DetailSection>

      {category.hasConditionChecklist && category.conditionItems.length > 0 ? (
        <DetailSection
          step={4}
          title={isProfile ? 'Profile checklist' : 'Condition verification'}
          subtitle="Check only what is true — builds trust with renters"
          color={category.color}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs text-[var(--cv-muted)]">
              {checkedCount} of {category.conditionItems.length} confirmed
            </p>
            <button
              type="button"
              onClick={toggleAllChecks}
              className="text-xs font-semibold focus-ring"
              style={{ color: category.color }}
            >
              {allChecked ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {category.conditionItems.map((item) => (
              <label
                key={item}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition',
                  form.checklist[item]
                    ? 'border-transparent'
                    : 'border-[var(--cv-border)] hover:bg-[var(--cv-elevated)]',
                )}
                style={
                  form.checklist[item]
                    ? { backgroundColor: category.softBg, borderColor: `${category.color}33` }
                    : undefined
                }
              >
                <input
                  type="checkbox"
                  checked={!!form.checklist[item]}
                  onChange={() => toggleCheck(item)}
                  className="mt-0.5 h-4 w-4 rounded border-[var(--cv-border)]"
                  style={{ accentColor: category.color }}
                />
                <span className="text-[var(--cv-text)]">{item}</span>
              </label>
            ))}
          </div>
        </DetailSection>
      ) : null}
    </div>
  )
}

function PricingStep({
  form,
  category,
  errors,
  suggestion,
  update,
  applySuggestion,
}: {
  form: RentalFormState
  category: RentalCategory
  errors: Record<string, string>
  suggestion: { min: number; max: number; label: string } | null
  update: <K extends keyof RentalFormState>(key: K, value: RentalFormState[K]) => void
  applySuggestion: () => void
}) {
  const rate = Number(form.rate) || 0

  return (
    <div className="space-y-5">
      <MarketReferenceBox category={category} />

      {suggestion ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--cv-border)] px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[var(--cv-text)]">
              Suggested {formatCurrency(suggestion.min)}–{formatCurrency(suggestion.max)}
            </p>
            <p className="text-xs text-[var(--cv-muted)]">
              Based on {suggestion.label} condition for {category.title.toLowerCase()}
            </p>
          </div>
          <Button type="button" size="sm" variant="secondary" roleColor="rental" onClick={applySuggestion}>
            Use suggestion
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          label="Your rate"
          type="number"
          value={form.rate}
          onChange={(e) => update('rate', e.target.value)}
          required
          error={errors.rate}
          placeholder="e.g., 950"
        />
        <Select
          label="Time unit"
          value={form.unit}
          onChange={(e) => update('unit', e.target.value)}
          options={unitOptions(category)}
        />
      </div>

      <div className="rounded-xl border border-[var(--cv-border)] p-4">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--cv-text)]">Security deposit</p>
            <p className="text-xs text-[var(--cv-muted)]">Optional — lower friction without one</p>
          </div>
          <input
            type="checkbox"
            checked={form.depositEnabled}
            onChange={(e) => update('depositEnabled', e.target.checked)}
            className="h-4 w-4"
            style={{ accentColor: category.color }}
          />
        </label>
        {form.depositEnabled ? (
          <div className="mt-3">
            <FormInput
              label="Deposit amount"
              type="number"
              value={form.deposit}
              onChange={(e) => update('deposit', e.target.value)}
              placeholder="e.g., 2000"
            />
          </div>
        ) : null}
      </div>

      <FormInput
        label="Service area (km)"
        type="number"
        value={form.area}
        onChange={(e) => update('area', e.target.value)}
        required
        error={errors.area}
        helperText="How far will you travel or deliver?"
      />

      {rate > 0 ? (
        <div className="rounded-xl bg-[var(--cv-elevated)] p-4 text-sm">
          <p>
            Rate: {formatCurrency(rate)}/{form.unit}
          </p>
          <p className="text-[var(--cv-muted)]">Platform fee: {formatCurrency(rate * 0.15)} (15%)</p>
          <p className="mt-1 font-semibold" style={{ color: category.color }}>
            Your earnings: {formatCurrency(rate * 0.85)} (85%)
          </p>
        </div>
      ) : null}
    </div>
  )
}
