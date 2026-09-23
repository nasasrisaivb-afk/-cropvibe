import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowDownTrayIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/24/solid'
import { cn, formatCurrency } from '../../utils/format'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'
import { PageHeader } from '../common/PageHeader'
import { Select } from '../common/Select'
import { Sheet } from '../common/Sheet'

type PayoutStatus = 'in_use' | 'processing' | 'settled' | 'action_required'
type StepStatus = 'done' | 'current' | 'pending'

interface LifecycleStep {
  label: string
  stepStatus: StepStatus
}

interface TimelineStep {
  label: string
  detail?: string
  tone: StepStatus
}

interface MoneyLine {
  label: string
  value: string
  emphasize?: boolean
}

interface Payout {
  id: string
  title: string
  partyLabel: string
  partyName: string
  dateLine: string
  amount: number
  amountCaption: string
  status: PayoutStatus
  updatedAt: string
  nextStepDueAt: string | null
  details: MoneyLine[]
  lifecycleSteps: LifecycleStep[]
  timeline: TimelineStep[]
  banner?: { tone: 'success' | 'warning' | 'danger'; text: string }
  primaryAction: string
  secondaryAction: string
}

/** Demo reference time for due-soon pill logic */
const REFERENCE_NOW = new Date('2026-07-26T12:00:00')

const INITIAL: Payout[] = [
  {
    id: 'PO-441',
    title: 'Mini excavator (2 units)',
    partyLabel: 'Renter',
    partyName: 'Sharma Construction',
    dateLine: 'Rental: 12 Jul – 28 Jul',
    amount: 18600,
    amountCaption: 'Expected on return',
    status: 'in_use',
    updatedAt: '2026-07-26T11:42:00',
    nextStepDueAt: '2026-07-28T18:00:00',
    details: [
      { label: 'Rental period', value: '16 days' },
      { label: 'Daily rate', value: '₹950/day' },
      { label: 'Insurance', value: '₹491' },
      { label: 'Total amount', value: '₹18,600', emphasize: true },
    ],
    lifecycleSteps: [
      { label: 'Return equipment to Pune yard on 28 Jul', stepStatus: 'current' },
      { label: 'Inspect for damage, confirm engine hours', stepStatus: 'pending' },
      { label: 'Settlement initiated, deposit balance credited', stepStatus: 'pending' },
      { label: 'Funds received within 2–4 business days', stepStatus: 'pending' },
    ],
    timeline: [
      { label: 'Rental started', detail: '12 Jul', tone: 'done' },
      { label: 'In use', detail: 'Ends 28 Jul', tone: 'current' },
      { label: 'Equipment return', tone: 'pending' },
      { label: 'Settlement', tone: 'pending' },
    ],
    primaryAction: 'Message',
    secondaryAction: 'Renter profile',
  },
  {
    id: 'PO-438',
    title: 'Power drill set',
    partyLabel: 'Renter',
    partyName: 'Kumar & Sons',
    dateLine: 'Rental: 22–24 Jul',
    amount: 10000,
    amountCaption: 'Awaiting settlement',
    status: 'processing',
    updatedAt: '2026-07-26T10:15:00',
    nextStepDueAt: '2026-07-27T18:00:00',
    details: [
      { label: 'Rental period', value: '22–24 Jul (2d)' },
      { label: 'Daily rate', value: '₹4,250' },
      { label: 'Subtotal', value: '₹8,500' },
      { label: 'GST (18%)', value: '₹1,500' },
      { label: 'Total', value: '₹10,000', emphasize: true },
    ],
    lifecycleSteps: [
      { label: 'Equipment returned to Nashik yard on 24 Jul', stepStatus: 'done' },
      { label: 'Inspection complete, no damage noted', stepStatus: 'done' },
      { label: 'Payment settlement processing via HDFC', stepStatus: 'current' },
      { label: 'Funds received within 2–4 business days', stepStatus: 'pending' },
    ],
    timeline: [
      { label: 'Rental started', detail: '22 Jul', tone: 'done' },
      { label: 'Equipment returned', detail: '24 Jul', tone: 'done' },
      { label: 'Payment processing', detail: 'In progress', tone: 'current' },
      { label: 'Settlement', tone: 'pending' },
    ],
    banner: {
      tone: 'success',
      text: 'Equipment is in good condition. Payment settlement is processing.',
    },
    primaryAction: 'Receipt',
    secondaryAction: 'Track settlement',
  },
  {
    id: 'PO-430',
    title: 'Cement mixer',
    partyLabel: 'Renter',
    partyName: 'Foundation Works Ltd',
    dateLine: 'Rental: 12 Jul – 13 Jul (1 day)',
    amount: 25000,
    amountCaption: 'Settled ₹25,000',
    status: 'settled',
    updatedAt: '2026-07-13T19:30:00',
    nextStepDueAt: null,
    details: [
      { label: 'Rental income', value: '₹21,186' },
      { label: 'GST collected', value: '₹3,814' },
      { label: 'Your settlement', value: '₹25,000', emphasize: true },
    ],
    lifecycleSteps: [
      { label: 'Equipment returned to Baramati yard on 13 Jul', stepStatus: 'done' },
      { label: 'Inspection complete, no damage noted', stepStatus: 'done' },
      { label: 'Settlement processed to HDFC ****4521', stepStatus: 'done' },
      { label: 'Funds received 13 Jul, 2:30 PM', stepStatus: 'done' },
    ],
    timeline: [
      { label: 'Rental completed', detail: '12 Jul', tone: 'done' },
      { label: 'Equipment returned', detail: '13 Jul', tone: 'done' },
      { label: 'Payment processed', detail: '13 Jul', tone: 'done' },
      { label: 'Funds received', detail: '13 Jul, 2:30 PM', tone: 'done' },
    ],
    banner: {
      tone: 'success',
      text: 'Payment successfully settled. Funds safely deposited into your account.',
    },
    primaryAction: 'Receipt',
    secondaryAction: 'Tax document',
  },
  {
    id: 'PO-421',
    title: 'Rotavator 7 ft',
    partyLabel: 'Renter',
    partyName: 'Greenfield Farms',
    dateLine: 'Rental: 28 Jun – 01 Jul',
    amount: 8200,
    amountCaption: 'Blocked until fixed',
    status: 'action_required',
    updatedAt: '2026-07-02T14:18:00',
    nextStepDueAt: '2026-07-03T18:00:00',
    details: [
      { label: 'Rental period', value: '4 days' },
      { label: 'Daily rate', value: '₹1,800' },
      { label: 'Subtotal', value: '₹7,200' },
      { label: 'Platform fee', value: '−₹400' },
      { label: 'Net settlement', value: '₹8,200', emphasize: true },
    ],
    lifecycleSteps: [
      { label: 'Equipment returned to Pune yard on 01 Jul', stepStatus: 'done' },
      { label: 'Inspection complete, no damage noted', stepStatus: 'done' },
      { label: 'Bank verification failed — update account details', stepStatus: 'current' },
      { label: 'Funds released after verification', stepStatus: 'pending' },
    ],
    timeline: [
      { label: 'Rental completed', detail: '01 Jul', tone: 'done' },
      { label: 'Settlement requested', detail: '02 Jul', tone: 'done' },
      { label: 'Bank verification failed', detail: '02 Jul, 2:18 PM', tone: 'current' },
      { label: 'Funds released', detail: 'Blocked', tone: 'pending' },
    ],
    banner: {
      tone: 'danger',
      text: 'Bank rejected this payout. Update your account details and resubmit to release ₹8,200.',
    },
    primaryAction: 'Fix bank details',
    secondaryAction: 'Get help',
  },
]

function statusMeta(status: PayoutStatus) {
  if (status === 'in_use') {
    return {
      label: 'In use',
      className: 'bg-[var(--cv-success-soft)] text-[var(--cv-success)]',
      Icon: CheckCircleIcon,
    }
  }
  if (status === 'processing') {
    return {
      label: 'Processing',
      className: 'bg-[var(--cv-warning-soft)] text-[var(--cv-warning)]',
      Icon: ClockIcon,
    }
  }
  if (status === 'action_required') {
    return {
      label: 'Action required',
      className: 'bg-[color-mix(in_srgb,var(--cv-danger)_16%,transparent)] text-[var(--cv-danger)]',
      Icon: ExclamationTriangleIcon,
    }
  }
  return {
    label: 'Settled',
    className: 'bg-[var(--cv-success-soft)] text-[var(--cv-success)]',
    Icon: CheckCircleIcon,
  }
}

function StatusBadge({ status }: { status: PayoutStatus }) {
  const meta = statusMeta(status)
  const Icon = meta.Icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        meta.className,
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      {meta.label}
    </span>
  )
}

function formatUpdatedAgo(iso: string) {
  const diffMs = REFERENCE_NOW.getTime() - new Date(iso).getTime()
  const mins = Math.max(1, Math.round(diffMs / 60000))
  if (mins < 60) return `Updated ${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 48) return `Updated ${hours}h ago`
  const days = Math.round(hours / 24)
  return `Updated ${days}d ago`
}

function dueSoonLabel(dueAt: string | null, steps: LifecycleStep[]) {
  if (!dueAt) return null
  const pendingCurrent = steps.find((s) => s.stepStatus === 'current' || s.stepStatus === 'pending')
  if (!pendingCurrent || pendingCurrent.stepStatus === 'done') return null
  const diffMs = new Date(dueAt).getTime() - REFERENCE_NOW.getTime()
  if (diffMs <= 0 || diffMs > 72 * 60 * 60 * 1000) return null
  const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000))
  if (days <= 1) return 'Return due tomorrow'
  return `Return due in ${days} days`
}

function MoneyTable({ rows }: { rows: MoneyLine[] }) {
  return (
    <dl className="space-y-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className={cn(
            'grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 text-sm',
            row.emphasize && 'border-t border-[var(--cv-border)] pt-2',
          )}
        >
          <dt className={cn(row.emphasize ? 'font-semibold text-[var(--cv-text)]' : 'text-[var(--cv-muted)]')}>
            {row.label}
          </dt>
          <dd
            className={cn(
              'tabular-nums text-right',
              row.emphasize ? 'font-bold text-[var(--cv-text)]' : 'font-medium text-[var(--cv-text)]',
            )}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function LifecycleSteps({ steps }: { steps: LifecycleStep[] }) {
  return (
    <ol className="space-y-2.5">
      {steps.map((step) => (
        <li key={step.label} className="flex items-start gap-3 text-sm">
          <span
            className={cn(
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
              step.stepStatus === 'done'
                ? 'border-[var(--cv-blue)] bg-[var(--cv-blue)] text-[var(--color-on-accent)]'
                : step.stepStatus === 'current'
                  ? 'border-[var(--cv-warning)] bg-[var(--cv-warning)]'
                  : 'border-[var(--cv-border)] bg-transparent',
            )}
            aria-hidden
          >
            {step.stepStatus === 'done' ? <CheckIcon className="h-3 w-3" /> : null}
          </span>
          <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
            <p
              className={cn(
                step.stepStatus === 'done' && 'text-[var(--cv-muted)] line-through',
                step.stepStatus === 'current' && 'font-medium text-[var(--cv-text)]',
                step.stepStatus === 'pending' && 'text-[var(--cv-muted)]',
              )}
            >
              {step.label}
            </p>
            {step.stepStatus === 'current' ? (
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[var(--cv-warning)]">
                Current
              </span>
            ) : step.stepStatus === 'done' ? (
              <span className="shrink-0 text-[11px] text-[var(--cv-success)]">Done</span>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        const dotClass =
          step.tone === 'done'
            ? 'border-[var(--cv-blue)] bg-[var(--cv-blue)]'
            : step.tone === 'current'
              ? 'border-[var(--cv-warning)] bg-[var(--cv-warning)]'
              : 'border-[var(--cv-border)] bg-transparent'

        return (
          <li key={`${step.label}-${index}`} className="relative flex gap-3 pb-3 last:pb-0">
            {!isLast ? (
              <span className="absolute left-[7px] top-4 h-[calc(100%-8px)] w-px bg-[var(--cv-border)]" aria-hidden />
            ) : null}
            <span
              className={cn(
                'relative z-[1] mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                dotClass,
              )}
              aria-hidden
            >
              {step.tone === 'done' ? <CheckIcon className="h-2.5 w-2.5 text-[var(--color-on-accent)]" /> : null}
            </span>
            <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3 pt-0.5">
              <p
                className={cn(
                  'text-sm font-medium',
                  step.tone === 'pending' ? 'text-[var(--cv-muted)]' : 'text-[var(--cv-text)]',
                )}
              >
                {step.label}
              </p>
              {step.detail ? (
                <p className="shrink-0 text-xs tabular-nums text-[var(--cv-muted)]">{step.detail}</p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function ActionButton({
  children,
  primary,
  onClick,
}: {
  children: ReactNode
  primary?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'cv-touch inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cv-primary)] sm:w-auto',
        primary
          ? 'bg-[var(--cv-btn-bg)] text-[var(--cv-btn-text)] hover:opacity-90'
          : 'border border-[var(--cv-border)] text-[var(--cv-text)] hover:bg-[var(--cv-elevated)]',
      )}
    >
      {children}
    </button>
  )
}

function SettlementCard({
  payout,
  defaultOpen,
  onQuickMessage,
  onFinancialAction,
}: {
  payout: Payout
  defaultOpen?: boolean
  onQuickMessage: () => void
  onFinancialAction: (action: string) => void
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen))
  const [copied, setCopied] = useState(false)
  const dueLabel = dueSoonLabel(payout.nextStepDueAt, payout.lifecycleSteps)
  const closedLike = payout.status === 'settled'

  const copyId = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(payout.id)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard may be unavailable */
    }
  }

  const toggleOpen = () => setOpen((v) => !v)

  return (
    <article
      className={cn(
        'overflow-hidden rounded-[14px] border border-[var(--cv-border)] bg-[var(--cv-surface)] shadow-[var(--shadow-sm)] transition duration-150',
        closedLike && 'opacity-85',
        open && 'ring-1 ring-[color-mix(in_srgb,var(--cv-text)_8%,transparent)]',
      )}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={toggleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggleOpen()
          }
        }}
        className="cursor-pointer p-4 sm:p-5"
        aria-expanded={open}
        aria-controls={`settlement-${payout.id}`}
      >
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight text-[var(--cv-text)] sm:text-lg">
                {payout.title}
              </h3>
              <StatusBadge status={payout.status} />
            </div>
            <p className="mt-1.5 text-sm text-[var(--cv-muted)]">
              {payout.partyLabel}:{' '}
              <span className="font-medium text-[var(--cv-text)]">{payout.partyName}</span>
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-sm text-[var(--cv-muted)]">{payout.dateLine}</p>
              {dueLabel ? (
                <span className="inline-flex rounded-full bg-[var(--cv-warning-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--cv-warning)]">
                  {dueLabel}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={copyId}
              className="cv-touch mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)] hover:text-[var(--cv-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cv-primary)]"
              aria-label={`Copy booking reference ${payout.id}`}
            >
              <ClipboardDocumentIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
              {copied ? 'Copied' : payout.id}
            </button>
          </div>

          <div className="flex items-start justify-between gap-2 lg:flex-col lg:items-end">
            <div className="text-left lg:text-right">
              <p className="text-[22px] font-semibold leading-none tracking-tight tabular-nums text-[var(--cv-text)]">
                {formatCurrency(payout.amount)}
              </p>
              <p className="mt-1.5 text-[11px] font-medium text-[var(--cv-muted)]">{payout.amountCaption}</p>
              <p className="mt-0.5 text-[11px] text-[var(--cv-muted)]">{formatUpdatedAgo(payout.updatedAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onQuickMessage()
                }}
                className="cv-touch inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--cv-border)] text-[var(--cv-muted)] transition hover:bg-[var(--cv-elevated)] hover:text-[var(--cv-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cv-primary)]"
                aria-label="Message renter"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleOpen()
                }}
                aria-expanded={open}
                aria-controls={`settlement-${payout.id}`}
                className="cv-touch inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--cv-border)] text-[var(--cv-muted)] transition hover:bg-[var(--cv-elevated)] hover:text-[var(--cv-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cv-primary)]"
                aria-label={open ? 'Collapse settlement details' : 'Expand settlement details'}
              >
                <ChevronDownIcon className={cn('h-5 w-5 transition', open && 'rotate-180')} strokeWidth={2} />
              </button>
            </div>
          </div>
        </header>
      </div>

      {open ? (
        <div id={`settlement-${payout.id}`} className="space-y-5 border-t border-[var(--cv-border)] px-4 pb-4 pt-5 sm:px-5 sm:pb-5">
          <section>
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--cv-muted)]">
              Rental details
            </h4>
            <MoneyTable rows={payout.details} />
          </section>

          <section className="rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] p-4">
            <h4 className="text-sm font-semibold text-[var(--cv-text)]">What happens next</h4>
            <div className="mt-3">
              <LifecycleSteps steps={payout.lifecycleSteps} />
            </div>
          </section>

          {payout.banner ? (
            <div
              className={cn(
                'flex gap-3 rounded-xl border px-3.5 py-3 text-sm',
                payout.banner.tone === 'danger'
                  ? 'border-[color-mix(in_srgb,var(--cv-danger)_35%,var(--cv-border))] bg-[color-mix(in_srgb,var(--cv-danger)_12%,var(--cv-surface))]'
                  : 'border-[color-mix(in_srgb,var(--cv-success)_35%,var(--cv-border))] bg-[var(--cv-success-soft)]',
              )}
              role="status"
            >
              {payout.banner.tone === 'danger' ? (
                <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--cv-danger)]" strokeWidth={1.75} />
              ) : (
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--cv-success)]" strokeWidth={1.75} />
              )}
              <p className="leading-relaxed text-[var(--cv-text)]">{payout.banner.text}</p>
            </div>
          ) : null}

          <section>
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--cv-muted)]">
              Settlement timeline
            </h4>
            <Timeline steps={payout.timeline} />
          </section>

          <div className="flex flex-col gap-2 border-t border-[var(--cv-border)] pt-4 sm:flex-row sm:flex-wrap sm:justify-end">
            {payout.status === 'in_use' ? (
              <>
                <ActionButton onClick={onQuickMessage}>
                  <ChatBubbleLeftRightIcon className="h-4 w-4" strokeWidth={1.75} />
                  {payout.primaryAction}
                </ActionButton>
                <ActionButton>
                  <UserCircleIcon className="h-4 w-4" strokeWidth={1.75} />
                  {payout.secondaryAction}
                </ActionButton>
              </>
            ) : null}

            {payout.status === 'processing' ? (
              <>
                <ActionButton>
                  <ArrowDownTrayIcon className="h-4 w-4" strokeWidth={1.75} />
                  {payout.primaryAction}
                </ActionButton>
                <ActionButton primary onClick={() => onFinancialAction(payout.secondaryAction)}>
                  {payout.secondaryAction}
                </ActionButton>
              </>
            ) : null}

            {payout.status === 'settled' ? (
              <>
                <ActionButton>
                  <ArrowDownTrayIcon className="h-4 w-4" strokeWidth={1.75} />
                  {payout.primaryAction}
                </ActionButton>
                <ActionButton>
                  <DocumentTextIcon className="h-4 w-4" strokeWidth={1.75} />
                  {payout.secondaryAction}
                </ActionButton>
              </>
            ) : null}

            {payout.status === 'action_required' ? (
              <>
                <ActionButton>{payout.secondaryAction}</ActionButton>
                <ActionButton primary onClick={() => onFinancialAction(payout.primaryAction)}>
                  {payout.primaryAction}
                </ActionButton>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  )
}

function createManualPayout(amount: number, today: string): Payout {
  return {
    id: `PO-${Math.floor(400 + Math.random() * 500)}`,
    title: 'Manual payout request',
    partyLabel: 'Account',
    partyName: 'HDFC ****4521',
    dateLine: `Requested ${today}`,
    amount,
    amountCaption: 'Awaiting verification',
    status: 'action_required',
    updatedAt: new Date().toISOString(),
    nextStepDueAt: null,
    details: [
      { label: 'Requested amount', value: formatCurrency(amount), emphasize: true },
      { label: 'Destination', value: 'HDFC ****4521' },
    ],
    lifecycleSteps: [
      { label: 'Settlement request submitted', stepStatus: 'done' },
      { label: 'Bank verification pending', stepStatus: 'current' },
      { label: 'Funds released after verification', stepStatus: 'pending' },
    ],
    timeline: [
      { label: 'Settlement requested', detail: today, tone: 'done' },
      { label: 'Bank verification pending', tone: 'current' },
      { label: 'Funds released', detail: 'est. next business day', tone: 'pending' },
    ],
    banner: {
      tone: 'warning',
      text: 'Complete bank verification to release funds. Typical wait: 2–4 business hours after verification.',
    },
    primaryAction: 'Verify account',
    secondaryAction: 'Get help',
  }
}

export function PayoutsPage() {
  const navigate = useNavigate()
  const [payouts, setPayouts] = useState(INITIAL)
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('10000')
  const [confirmTarget, setConfirmTarget] = useState<{ payout: Payout; action: string } | null>(null)

  const filtered = useMemo(
    () => payouts.filter((p) => filter === 'all' || p.status === filter),
    [payouts, filter],
  )

  const pendingTotal = payouts
    .filter((p) => p.status === 'in_use' || p.status === 'processing' || p.status === 'action_required')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payouts & settlements"
        subtitle="Track active rentals, settlement progress, and funds received."
        actions={<Button onClick={() => setOpen(true)}>Request payout</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="!rounded-[12px]">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">
            Available balance
          </p>
          <p className="mt-2 text-3xl font-bold text-[var(--cv-primary)]">{formatCurrency(68420)}</p>
        </Card>
        <Card className="!rounded-[12px]">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">In flight</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{formatCurrency(pendingTotal)}</p>
          <p className="mt-1 text-xs text-[var(--cv-muted)]">Active + processing + action needed</p>
        </Card>
        <Card className="!rounded-[12px]">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">
            Bank account
          </p>
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
                  const today = new Date().toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })
                  setPayouts((prev) => [createManualPayout(value, today), ...prev])
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--cv-text)]">Rental settlements</h2>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">
            Scan status and amount in seconds — expand for rates and next steps
          </p>
        </div>
        <div className="w-full sm:max-w-xs">
          <Select
            label="Filter status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All settlements' },
              { value: 'in_use', label: 'In use' },
              { value: 'processing', label: 'Processing' },
              { value: 'settled', label: 'Settled' },
              { value: 'action_required', label: 'Action required' },
            ]}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card className="!rounded-[12px]">
            <p className="text-center text-sm text-[var(--cv-muted)]">No settlements match this filter.</p>
          </Card>
        ) : (
          filtered.map((payout, index) => (
            <SettlementCard
              key={payout.id}
              payout={payout}
              defaultOpen={index === 0}
              onQuickMessage={() => navigate('/dashboard/messages')}
              onFinancialAction={(action) => setConfirmTarget({ payout, action })}
            />
          ))
        )}
      </div>

      <Sheet
        open={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        title="Confirm financial action"
      >
        {confirmTarget ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--cv-muted)]">
              This action finalizes a monetary state for {confirmTarget.payout.partyName}. Review the
              amount and outcome before proceeding.
            </p>
            <div className="rounded-xl border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4 text-sm">
              <p className="font-semibold text-[var(--cv-text)]">{confirmTarget.payout.id}</p>
              <p className="mt-1 text-[var(--cv-muted)]">
                {confirmTarget.payout.title} · {confirmTarget.payout.partyName}
              </p>
              <p className="mt-3 text-2xl font-bold tabular-nums text-[var(--cv-text)]">
                {formatCurrency(confirmTarget.payout.amount)}
              </p>
              <p className="mt-2 text-xs text-[var(--cv-muted)]">
                Action: {confirmTarget.action}. After confirmation, status will update and the card
                timeline will sync automatically.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setConfirmTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => setConfirmTarget(null)}>
                Confirm {confirmTarget.action.toLowerCase()}
              </Button>
            </div>
          </div>
        ) : null}
      </Sheet>
    </div>
  )
}
