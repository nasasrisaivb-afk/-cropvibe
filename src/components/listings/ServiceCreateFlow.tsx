import { useMemo, useState, type ReactNode } from 'react'
import {
  BeakerIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ClipboardDocumentCheckIcon,
  CloudIcon,
  Cog6ToothIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import type { ComponentType, SVGProps } from 'react'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'
import { Select } from '../common/Select'
import { formatCurrency, cn } from '../../utils/format'
import {
  SERVICE_CATEGORIES,
  SERVICE_STEP_LABELS,
  getServiceCategoryById,
  type AdaptiveField,
  type ServiceCategory,
  type ServiceCategoryId,
} from './serviceCategoryContent'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

const CATEGORY_ICONS: Record<ServiceCategoryId, IconType> = {
  'soil-testing': BeakerIcon,
  'farm-consultancy': ChatBubbleLeftRightIcon,
  mechanic: WrenchScrewdriverIcon,
  irrigation: CloudIcon,
  'equipment-repair': Cog6ToothIcon,
  'drone-spraying': PaperAirplaneIcon,
  'crop-inspection': ClipboardDocumentCheckIcon,
}

type FieldValues = Record<string, string>
type ChecklistState = Record<string, boolean>

interface ServiceFormState {
  categoryId: ServiceCategoryId | ''
  name: string
  description: string
  fields: FieldValues
  includes: ChecklistState
  price: string
  unit: string
  duration: string
  area: string
  availability: string
  photoCount: number
}

const INITIAL_FORM: ServiceFormState = {
  categoryId: '',
  name: '',
  description: '',
  fields: {},
  includes: {},
  price: '',
  unit: 'session',
  duration: '',
  area: '25',
  availability: 'weekdays',
  photoCount: 0,
}

function StepProgress({ step, color }: { step: number; color: string }) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        {SERVICE_STEP_LABELS.map((label, i) => {
          const n = i + 1
          const done = n < step
          const active = n === step
          return (
            <div key={label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition',
                  done && 'text-white',
                  active && 'text-white',
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

function simpleSuggest(
  category: ServiceCategory,
  includes: ChecklistState,
): { min: number; max: number; mid: number; label: string } {
  const defaults: Record<ServiceCategoryId, [number, number, number]> = {
    'soil-testing': [300, 500, 650],
    'farm-consultancy': [2000, 4000, 6000],
    mechanic: [750, 1500, 3000],
    irrigation: [3000, 10000, 40000],
    'equipment-repair': [1500, 3000, 8000],
    'drone-spraying': [300, 400, 600],
    'crop-inspection': [500, 750, 1500],
  }
  const [budget, avg, premium] = defaults[category.id]
  const total = category.includes.length || 1
  const score = Object.values(includes).filter(Boolean).length / total
  if (score > 0.7) return { min: Math.round(premium * 0.9), max: Math.round(premium * 1.1), mid: premium, label: 'full package' }
  if (score > 0.35) return { min: Math.round(avg * 0.9), max: Math.round(avg * 1.1), mid: avg, label: 'typical' }
  return { min: Math.round(budget * 0.9), max: Math.round(budget * 1.1), mid: budget, label: 'starter' }
}

function unitOptions(category: ServiceCategory) {
  const u = category.pricing.unit
  if (u === 'acre') {
    return [
      { value: 'acre', label: 'Per acre' },
      { value: 'hectare', label: 'Per hectare' },
      { value: 'day', label: 'Per day' },
    ]
  }
  if (u === 'sample') {
    return [
      { value: 'sample', label: 'Per sample' },
      { value: 'visit', label: 'Per visit' },
    ]
  }
  return [
    { value: 'session', label: 'Per session' },
    { value: 'visit', label: 'Per visit' },
    { value: 'hour', label: 'Per hour' },
    { value: 'day', label: 'Per day' },
  ]
}

export function ServiceCreateFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<ServiceFormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [editingSection, setEditingSection] = useState<'details' | 'pricing' | null>(null)

  const category = getServiceCategoryById(form.categoryId)
  const accent = category?.color ?? '#2F6F4E'
  const price = Number(form.price) || 0
  const suggestion = useMemo(
    () => (category ? simpleSuggest(category, form.includes) : null),
    [category, form.includes],
  )

  const update = <K extends keyof ServiceFormState>(key: K, value: ServiceFormState[K]) => {
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

  const toggleInclude = (item: string) => {
    setForm((p) => ({
      ...p,
      includes: { ...p.includes, [item]: !p.includes[item] },
    }))
  }

  const selectCategory = (id: ServiceCategoryId) => {
    const cat = getServiceCategoryById(id)
    setForm((p) => ({
      ...p,
      categoryId: id,
      fields: {},
      includes: {},
      unit: cat?.pricing.unit ?? 'session',
      duration: cat?.durationOptions[1]?.value ?? cat?.durationOptions[0]?.value ?? '',
      name: '',
      description: '',
      photoCount: 0,
      price: '',
    }))
    setErrors({})
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (step === 1 && !form.categoryId) e.categoryId = 'Select a service type to continue'
    if (step === 2 && category) {
      if (!form.name.trim()) e.name = 'Required'
      if (form.description.trim().length > 0 && form.description.trim().length < 20) {
        e.description = 'Add a bit more detail (20+ characters) or leave blank'
      }
      for (const field of category.adaptiveFields) {
        if (field.required && !form.fields[field.id]?.trim()) e[field.id] = 'Required'
      }
    }
    if (step === 3) {
      if (!form.price || Number(form.price) <= 0) e.price = 'Enter a valid price'
      if (!form.duration) e.duration = 'Required'
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
    update('price', String(suggestion.mid))
  }

  const includesDone = category ? category.includes.filter((i) => form.includes[i]).length : 0
  const includesTotal = category?.includes.length ?? 0
  const readiness = category
    ? Math.round(
        (((form.name ? 1 : 0) +
          (price > 0 ? 1 : 0) +
          (form.duration ? 1 : 0) +
          (form.photoCount >= 1 ? 1 : 0) +
          includesDone / Math.max(includesTotal, 1)) /
          5) *
          100,
      )
    : 0

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
          toggleInclude={toggleInclude}
        />
        <div className="mt-6 flex justify-end">
          <Button roleColor="service" onClick={() => setEditingSection(null)}>
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
          <Button roleColor="service" onClick={() => setEditingSection(null)}>
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
          <h1 className="text-2xl font-bold tracking-tight text-[var(--cv-text)]">Create Service Offering</h1>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">
            {step === 1 && 'What kind of help do you offer farmers?'}
            {step === 2 && category && `Describe your ${category.title.toLowerCase()} clearly`}
            {step === 3 && 'Set your price and how far you travel'}
            {step === 4 && 'Preview how farmers will see your offer'}
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
            {SERVICE_CATEGORIES.map((cat) => {
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
                  style={selected ? { borderColor: cat.color, backgroundColor: cat.softBg } : undefined}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: selected ? cat.color : cat.softBg,
                        color: selected ? '#fff' : cat.color,
                      }}
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
                            <span
                              className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
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
          toggleInclude={toggleInclude}
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
              <p className="text-sm font-semibold text-[var(--cv-text)]">Offer readiness</p>
              <p className="text-xs text-[var(--cv-muted)]">
                {includesDone}/{includesTotal} inclusions · {form.photoCount} photo
                {form.photoCount === 1 ? '' : 's'}
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
              <h3 className="font-semibold text-[var(--cv-text)]">Service details</h3>
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
                <span className="text-[var(--cv-muted)]">Type:</span> <strong>{category.title}</strong>
              </p>
              <p>
                <span className="text-[var(--cv-muted)]">Name:</span> <strong>{form.name}</strong>
              </p>
              {form.description ? <p className="text-[var(--cv-muted)]">{form.description}</p> : null}
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
              {includesTotal > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {category.includes.map((item) => (
                    <span
                      key={item}
                      className={cn(
                        'rounded-md px-2 py-0.5 text-[11px]',
                        form.includes[item]
                          ? 'bg-[var(--color-success-soft)] text-[var(--cv-success)]'
                          : 'bg-[var(--cv-elevated)] text-[var(--cv-muted)]',
                      )}
                    >
                      {form.includes[item] ? '✓ ' : '○ '}
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
                <span className="text-[var(--cv-muted)]">Price:</span>{' '}
                <strong>
                  {formatCurrency(price)}/{form.unit}
                </strong>
              </p>
              <p>
                <span className="text-[var(--cv-muted)]">Duration:</span>{' '}
                {category.durationOptions.find((d) => d.value === form.duration)?.label ?? form.duration}
              </p>
              <p>
                <span className="text-[var(--cv-muted)]">Service area:</span> {form.area} km
              </p>
              <p>
                <span className="text-[var(--cv-muted)]">Availability:</span>{' '}
                {form.availability === 'weekdays'
                  ? 'Weekdays'
                  : form.availability === 'weekends'
                    ? 'Weekends'
                    : form.availability === 'flexible'
                      ? 'Flexible / on demand'
                      : 'All week'}
              </p>
              {price > 0 ? (
                <div className="mt-2 rounded-lg bg-[var(--cv-elevated)] p-3 text-xs">
                  <p>Platform fee: {formatCurrency(price * 0.15)} (15%)</p>
                  <p className="font-semibold" style={{ color: accent }}>
                    Your earnings: {formatCurrency(price * 0.85)} (85%)
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          <p className="rounded-lg bg-[var(--cv-elevated)] px-3 py-2.5 text-xs text-[var(--cv-muted)]">
            Clear inclusions and fair pricing get booked faster. Your offer goes live after a quick review.
          </p>
        </div>
      )}

      <div className="sticky bottom-0 z-10 -mx-5 mt-8 flex justify-between gap-3 border-t border-[var(--cv-border)] bg-[var(--cv-surface)] px-5 py-3 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:pt-8">
        <Button variant="secondary" roleColor="service" disabled={step === 1} onClick={goBack}>
          Previous
        </Button>
        <div className="flex gap-2">
          {step === 4 ? (
            <Button variant="secondary" roleColor="service" onClick={onDone}>
              Save draft
            </Button>
          ) : null}
          <Button roleColor="service" onClick={goNext}>
            {step === 4 ? 'Publish offering' : 'Continue'}
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
  toggleInclude,
}: {
  form: ServiceFormState
  category: ServiceCategory
  errors: Record<string, string>
  update: <K extends keyof ServiceFormState>(key: K, value: ServiceFormState[K]) => void
  updateField: (id: string, value: string) => void
  toggleInclude: (item: string) => void
}) {
  const includesDone = category.includes.filter((i) => form.includes[i]).length
  const allIncludesChecked = includesDone === category.includes.length

  const toggleAllIncludes = () => {
    const next: ChecklistState = {}
    for (const item of category.includes) next[item] = !allIncludesChecked
    update('includes', next)
  }

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border px-4 py-3 text-sm"
        style={{ borderColor: `${category.color}44`, backgroundColor: category.softBg }}
      >
        <p className="font-medium text-[var(--cv-text)]">Tip for {category.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--cv-muted)]">{category.detailTip}</p>
      </div>

      <DetailSection
        step={1}
        title="Name your offer"
        subtitle="Farmers see this first in search results"
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
            helperText="Include crop, package, or area if it helps — e.g. “Cotton pest inspection”"
          />
          <FormInput
            as="textarea"
            label="What farmers get (optional)"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder={category.descriptionPlaceholder}
            error={errors.description}
            helperText="One or two plain sentences. Skip buzzwords."
          />
        </div>
      </DetailSection>

      <DetailSection
        step={2}
        title="Service specifics"
        subtitle="Only questions that matter for this service type"
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
        title="What’s included"
        subtitle="Check only what you truly deliver — builds trust"
        color={category.color}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs text-[var(--cv-muted)]">
            {includesDone} of {category.includes.length} selected
          </p>
          <button
            type="button"
            onClick={toggleAllIncludes}
            className="text-xs font-semibold focus-ring"
            style={{ color: category.color }}
          >
            {allIncludesChecked ? 'Clear all' : 'Select all'}
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {category.includes.map((item) => (
            <label
              key={item}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition',
                form.includes[item]
                  ? 'border-transparent'
                  : 'border-[var(--cv-border)] hover:bg-[var(--cv-elevated)]',
              )}
              style={
                form.includes[item]
                  ? { backgroundColor: category.softBg, borderColor: `${category.color}33` }
                  : undefined
              }
            >
              <input
                type="checkbox"
                checked={!!form.includes[item]}
                onChange={() => toggleInclude(item)}
                className="mt-0.5 h-4 w-4 rounded border-[var(--cv-border)]"
                style={{ accentColor: category.color }}
              />
              <span className="text-[var(--cv-text)]">{item}</span>
            </label>
          ))}
        </div>
      </DetailSection>

      <DetailSection
        step={4}
        title="Proof photos"
        subtitle="Optional but strongly recommended — listings with photos get more bookings"
        color={category.color}
      >
        <div className="rounded-xl border-2 border-dashed border-[var(--cv-border)] bg-[var(--cv-elevated)]/40 p-5 text-center">
          <p className="text-sm font-medium text-[var(--cv-text)]">Upload 1–6 photos</p>
          <p className="mt-1 text-xs text-[var(--cv-muted)]">{category.photoGuidance}</p>
          <input
            type="file"
            accept="image/*"
            multiple
            className="mx-auto mt-3 block max-w-full text-sm"
            onChange={(e) => update('photoCount', e.target.files?.length ?? 0)}
          />
          {form.photoCount > 0 ? (
            <p className="mt-2 text-xs font-medium text-[var(--cv-success)]">
              {form.photoCount} file{form.photoCount === 1 ? '' : 's'} selected
            </p>
          ) : null}
        </div>
      </DetailSection>
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
  form: ServiceFormState
  category: ServiceCategory
  errors: Record<string, string>
  suggestion: { min: number; max: number; mid: number; label: string } | null
  update: <K extends keyof ServiceFormState>(key: K, value: ServiceFormState[K]) => void
  applySuggestion: () => void
}) {
  const price = Number(form.price) || 0
  const { pricing } = category

  return (
    <div className="space-y-5">
      <div
        className="rounded-xl border p-4"
        style={{ borderColor: `${category.color}44`, backgroundColor: category.softBg }}
      >
        <p className="text-sm font-semibold text-[var(--cv-text)]">Typical rates nearby</p>
        <p className="mt-0.5 text-xs text-[var(--cv-muted)]">Per {pricing.unit} · use as a guide</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: 'Budget', value: pricing.budget },
            { label: 'Average', value: pricing.average },
            { label: 'Premium', value: pricing.premium },
          ].map((tier) => (
            <div key={tier.label} className="rounded-lg bg-[var(--cv-surface)] px-2 py-2.5 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--cv-muted)]">{tier.label}</p>
              <p className="mt-1 text-xs font-semibold leading-snug text-[var(--cv-text)] sm:text-sm">
                {tier.value}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--cv-muted)]">{pricing.note}</p>
      </div>

      {suggestion ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--cv-border)] px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[var(--cv-text)]">
              Suggested {formatCurrency(suggestion.min)}–{formatCurrency(suggestion.max)}
            </p>
            <p className="text-xs text-[var(--cv-muted)]">Based on your {suggestion.label} inclusions</p>
          </div>
          <Button type="button" size="sm" variant="secondary" roleColor="service" onClick={applySuggestion}>
            Use {formatCurrency(suggestion.mid)}
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          label="Your price"
          type="number"
          value={form.price}
          onChange={(e) => update('price', e.target.value)}
          required
          error={errors.price}
          placeholder="e.g., 2500"
        />
        <Select
          label="Price unit"
          value={form.unit}
          onChange={(e) => update('unit', e.target.value)}
          options={unitOptions(category)}
        />
        <Select
          label="Typical duration"
          value={form.duration}
          onChange={(e) => update('duration', e.target.value)}
          options={category.durationOptions}
          required
          error={errors.duration}
        />
        <Select
          label="Availability"
          value={form.availability}
          onChange={(e) => update('availability', e.target.value)}
          options={[
            { value: 'weekdays', label: 'Weekdays' },
            { value: 'weekends', label: 'Weekends' },
            { value: 'all-week', label: 'All week' },
            { value: 'flexible', label: 'Flexible / on demand' },
          ]}
        />
      </div>

      <FormInput
        label="Service area (km)"
        type="number"
        value={form.area}
        onChange={(e) => update('area', e.target.value)}
        required
        error={errors.area}
        helperText="How far will you travel?"
      />

      {price > 0 ? (
        <div className="rounded-xl bg-[var(--cv-elevated)] p-4 text-sm">
          <p>
            Price: {formatCurrency(price)}/{form.unit}
          </p>
          <p className="text-[var(--cv-muted)]">Platform fee: {formatCurrency(price * 0.15)} (15%)</p>
          <p className="mt-1 font-semibold" style={{ color: category.color }}>
            Your earnings: {formatCurrency(price * 0.85)} (85%)
          </p>
        </div>
      ) : null}
    </div>
  )
}
