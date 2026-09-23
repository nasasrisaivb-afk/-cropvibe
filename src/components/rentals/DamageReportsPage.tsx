import { useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CameraIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/24/solid'
import { cn, formatCurrency } from '../../utils/format'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'
import { PageHeader } from '../common/PageHeader'
import { Sheet } from '../common/Sheet'

type ReportType = 'damage' | 'issue'
type ReportStatus = 'open' | 'in_review' | 'charged' | 'closed'
type Severity = 'low' | 'medium' | 'high'
type FilterChip = 'all' | 'overdue' | 'issue' | 'damage'
type StepStatus = 'done' | 'current' | 'pending'

interface ReportAttachment {
  id: string
  imageUrl: string
  uploadedBy: string
  uploadedAt: string
}

interface Report {
  id: string
  bookingId: string
  equipment: string
  renter: string
  reportType: ReportType
  severity: Severity
  estimate: number
  status: ReportStatus
  note: string
  reportedAt: string
  updatedAt: string
  dueAt: string | null
  attachments: ReportAttachment[]
  technician?: string
}

/** Reference “today” for overdue computation (deterministic demo). */
const TODAY = new Date('2026-08-13T12:00:00')

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=400&h=300&fit=crop',
]

function isOverdue(report: Report) {
  if (!report.dueAt) return false
  if (report.status === 'closed' || report.status === 'charged') return false
  return new Date(report.dueAt) < TODAY
}

const INITIAL: Report[] = [
  {
    id: 'RPT-441',
    bookingId: 'BK-5432',
    equipment: 'Tractor #2',
    renter: 'ABC Farm',
    reportType: 'damage',
    severity: 'medium',
    estimate: 3500,
    status: 'open',
    note: 'Minor dents on fender, headlight cracked on return inspection.',
    reportedAt: '2026-08-11T16:20:00',
    updatedAt: '2026-08-13T11:05:00',
    dueAt: '2026-08-12T18:00:00',
    attachments: [
      {
        id: 'att-1',
        imageUrl: PLACEHOLDER_IMAGES[0],
        uploadedBy: 'Operator',
        uploadedAt: '2026-08-11T16:22:00',
      },
      {
        id: 'att-2',
        imageUrl: PLACEHOLDER_IMAGES[1],
        uploadedBy: 'Operator',
        uploadedAt: '2026-08-11T16:23:00',
      },
      {
        id: 'att-3',
        imageUrl: PLACEHOLDER_IMAGES[2],
        uploadedBy: 'Operator',
        uploadedAt: '2026-08-11T16:24:00',
      },
      {
        id: 'att-4',
        imageUrl: PLACEHOLDER_IMAGES[3],
        uploadedBy: 'Operator',
        uploadedAt: '2026-08-11T16:25:00',
      },
    ],
  },
  {
    id: 'RPT-438',
    bookingId: 'BK-5410',
    equipment: 'Boom Sprayer 400L',
    renter: 'MNO Farm',
    reportType: 'damage',
    severity: 'low',
    estimate: 800,
    status: 'charged',
    note: 'Nozzle assembly replaced. Charge captured from security deposit.',
    reportedAt: '2026-08-05T11:00:00',
    updatedAt: '2026-08-05T15:30:00',
    dueAt: '2026-08-07T18:00:00',
    attachments: [
      {
        id: 'att-5',
        imageUrl: PLACEHOLDER_IMAGES[4],
        uploadedBy: 'Operator',
        uploadedAt: '2026-08-05T11:05:00',
      },
    ],
  },
  {
    id: 'RPT-420',
    bookingId: 'BK-5388',
    equipment: 'Harvester #1',
    renter: 'XYZ Inc',
    reportType: 'damage',
    severity: 'high',
    estimate: 18500,
    status: 'in_review',
    note: 'Belt housing damage — awaiting renter response on estimate.',
    reportedAt: '2026-08-10T09:30:00',
    updatedAt: '2026-08-12T16:45:00',
    dueAt: '2026-08-14T18:00:00',
    attachments: [
      {
        id: 'att-6',
        imageUrl: PLACEHOLDER_IMAGES[1],
        uploadedBy: 'Operator',
        uploadedAt: '2026-08-10T09:35:00',
      },
      {
        id: 'att-7',
        imageUrl: PLACEHOLDER_IMAGES[2],
        uploadedBy: 'Operator',
        uploadedAt: '2026-08-10T09:36:00',
      },
    ],
  },
  {
    id: 'RPT-415',
    bookingId: 'BK-5370',
    equipment: 'Power Tiller VST',
    renter: 'Village Co-op',
    reportType: 'issue',
    severity: 'medium',
    estimate: 0,
    status: 'open',
    note: 'Hydraulic lag under load — functional fault, no visible body damage.',
    reportedAt: '2026-08-12T14:00:00',
    updatedAt: '2026-08-13T09:20:00',
    dueAt: '2026-08-12T20:00:00',
    attachments: [],
  },
  {
    id: 'RPT-402',
    bookingId: 'BK-5355',
    equipment: 'Rotavator 7 ft',
    renter: 'Greenfield Farms',
    reportType: 'issue',
    severity: 'low',
    estimate: 0,
    status: 'closed',
    note: 'Blade alignment adjusted. Technician signed off; compliance logged.',
    reportedAt: '2026-08-01T10:00:00',
    updatedAt: '2026-08-03T11:00:00',
    dueAt: null,
    technician: 'Ravi Mech',
    attachments: [
      {
        id: 'att-8',
        imageUrl: PLACEHOLDER_IMAGES[0],
        uploadedBy: 'Technician',
        uploadedAt: '2026-08-02T15:00:00',
      },
    ],
  },
]

function formatShort(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function statusPresentation(report: Report) {
  const overdue = isOverdue(report)

  if (overdue) {
    return {
      label: 'Overdue',
      className:
        'bg-[color-mix(in_srgb,var(--cv-danger)_16%,var(--cv-surface))] text-[var(--cv-danger)]',
    }
  }
  if (report.status === 'charged') {
    return {
      label: `Charged ${formatCurrency(report.estimate)}`,
      className:
        'bg-[color-mix(in_srgb,var(--cv-success)_14%,var(--cv-surface))] text-[var(--cv-success)]',
    }
  }
  if (report.status === 'closed') {
    return {
      label: 'Closed',
      className: 'bg-[var(--cv-elevated)] text-[var(--cv-muted)]',
    }
  }
  if (report.status === 'in_review') {
    return {
      label: 'In review',
      className:
        'bg-[color-mix(in_srgb,var(--cv-warning)_18%,var(--cv-surface))] text-[var(--cv-warning)]',
    }
  }
  return {
    label: 'Open',
    className:
      'bg-[color-mix(in_srgb,var(--cv-warning)_14%,var(--cv-surface))] text-[var(--cv-warning)]',
  }
}

function typeBadge(type: ReportType) {
  if (type === 'damage') {
    return {
      label: 'Damage',
      className:
        'bg-[color-mix(in_srgb,var(--cv-danger)_12%,var(--cv-surface))] text-[var(--cv-danger)]',
    }
  }
  return {
    label: 'Issue',
    className:
      'bg-[color-mix(in_srgb,var(--cv-info)_14%,var(--cv-surface))] text-[var(--cv-info)]',
  }
}

function SeverityPill({ severity }: { severity: Severity }) {
  const map = {
    low: 'text-[var(--cv-muted)]',
    medium: 'text-[var(--cv-warning)]',
    high: 'text-[var(--cv-danger)]',
  }
  return (
    <span className={cn('text-xs font-semibold uppercase tracking-wide', map[severity])}>
      {severity} severity
    </span>
  )
}

function DetailTable({ rows }: { rows: { label: string; value: string; emphasize?: boolean }[] }) {
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

function formatUpdatedAgo(iso: string) {
  const diffMs = TODAY.getTime() - new Date(iso).getTime()
  const mins = Math.max(1, Math.round(diffMs / 60000))
  if (mins < 60) return `Updated ${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 48) return `Updated ${hours}h ago`
  const days = Math.round(hours / 24)
  return `Updated ${days}d ago`
}

function dueSoonLabel(report: Report) {
  if (!report.dueAt) return null
  if (report.status === 'closed' || report.status === 'charged') return null
  const diffMs = new Date(report.dueAt).getTime() - TODAY.getTime()
  if (diffMs <= 0) return 'Past due'
  if (diffMs > 72 * 60 * 60 * 1000) return null
  const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000))
  if (days <= 1) return 'Due tomorrow'
  return `Due in ${days} days`
}

function buildLifecycleSteps(report: Report): { label: string; stepStatus: StepStatus }[] {
  if (report.reportType === 'damage') {
    const steps: { label: string; stepStatus: StepStatus }[] = [
      {
        label: `Inspection logged for ${report.equipment} at return`,
        stepStatus: 'done',
      },
    ]
    if (report.status === 'open') {
      steps.push({
        label: `Charge deposit ${formatCurrency(report.estimate)} from ${report.renter}`,
        stepStatus: 'current',
      })
      steps.push({ label: 'Close report after charge or waiver', stepStatus: 'pending' })
    } else if (report.status === 'in_review') {
      steps.push({
        label: `Review deposit charge of ${formatCurrency(report.estimate)}`,
        stepStatus: 'current',
      })
      steps.push({ label: 'Close report after charge or waiver', stepStatus: 'pending' })
    } else if (report.status === 'charged') {
      steps.push({
        label: `Charged ${formatCurrency(report.estimate)} from security deposit`,
        stepStatus: 'done',
      })
      steps.push({ label: 'Report closed for compliance', stepStatus: 'pending' })
    } else {
      steps.push({
        label: `Charged ${formatCurrency(report.estimate)} from security deposit`,
        stepStatus: 'done',
      })
      steps.push({ label: 'Report closed for compliance', stepStatus: 'done' })
    }
    return steps
  }

  const steps: { label: string; stepStatus: StepStatus }[] = [
    { label: `Issue flagged on ${report.equipment}`, stepStatus: 'done' },
  ]
  if (report.status === 'open') {
    steps.push({
      label: `Assign technician to inspect ${report.equipment}`,
      stepStatus: 'current',
    })
    steps.push({ label: 'Mark repair complete and close report', stepStatus: 'pending' })
  } else if (report.status === 'in_review') {
    steps.push({
      label: report.technician
        ? `${report.technician} repairing ${report.equipment}`
        : 'Technician assigned, repair in progress',
      stepStatus: 'current',
    })
    steps.push({ label: 'Mark repair complete and close report', stepStatus: 'pending' })
  } else {
    steps.push({ label: 'Technician repair completed', stepStatus: 'done' })
    steps.push({ label: 'Report closed for compliance', stepStatus: 'done' })
  }
  return steps
}

function LifecycleSteps({ steps }: { steps: { label: string; stepStatus: StepStatus }[] }) {
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

function ReportTimeline({ report }: { report: Report }) {
  const overdue = isOverdue(report)
  const steps: { label: string; detail?: string; tone: StepStatus }[] = [
    { label: 'Reported', detail: formatShort(report.reportedAt), tone: 'done' },
  ]

  if (report.dueAt) {
    steps.push({
      label: overdue ? 'Past due' : 'Due',
      detail: formatShort(report.dueAt),
      tone: overdue
        ? 'current'
        : report.status === 'closed' || report.status === 'charged'
          ? 'done'
          : 'pending',
    })
  }

  if (report.status === 'in_review') {
    steps.push({ label: 'In review', tone: 'current' })
  } else if (report.status === 'charged') {
    steps.push({ label: 'Charged', detail: formatCurrency(report.estimate), tone: 'done' })
  } else if (report.status === 'closed') {
    steps.push({ label: 'Closed', detail: 'Compliance logged', tone: 'done' })
  } else {
    steps.push({ label: 'Resolution', tone: 'pending' })
  }

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
              <span
                className="absolute left-[7px] top-4 h-[calc(100%-8px)] w-px bg-[var(--cv-border)]"
                aria-hidden
              />
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
        'cv-touch inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cv-primary)] sm:w-auto',
        primary
          ? 'bg-[var(--cv-btn-bg)] text-[var(--cv-btn-text)] hover:opacity-90'
          : 'border border-[var(--cv-border)] text-[var(--cv-text)] hover:bg-[var(--cv-elevated)]',
      )}
    >
      {children}
    </button>
  )
}

function EvidenceGrid({
  attachments,
  onOpen,
  onUpload,
}: {
  attachments: ReportAttachment[]
  onOpen: (index: number) => void
  onUpload: () => void
}) {
  const visible = attachments.slice(0, 3)
  const more = Math.max(0, attachments.length - 3)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--cv-muted)]">
          Image evidence
        </h4>
        <span className="text-xs text-[var(--cv-muted)]">
          {attachments.length === 0 ? 'No photos yet' : `${attachments.length} photo${attachments.length === 1 ? '' : 's'}`}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {visible.map((att, index) => (
          <button
            key={att.id}
            type="button"
            onClick={() => onOpen(index)}
            className="cv-touch group relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cv-primary)]"
            aria-label={`View evidence photo ${index + 1}`}
          >
            <img
              src={att.imageUrl}
              alt=""
              className="h-full w-full object-cover transition group-hover:scale-[1.03]"
            />
          </button>
        ))}

        {more > 0 ? (
          <button
            type="button"
            onClick={() => onOpen(3)}
            className="cv-touch flex aspect-[4/3] items-center justify-center rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] text-sm font-bold text-[var(--cv-text)] hover:bg-[var(--cv-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cv-primary)]"
            aria-label={`View ${more} more photos`}
          >
            +{more} more
          </button>
        ) : (
          <button
            type="button"
            onClick={onUpload}
            className="cv-touch flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--cv-border)] bg-[var(--cv-elevated)]/40 text-[var(--cv-muted)] transition hover:border-[var(--cv-primary)] hover:text-[var(--cv-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cv-primary)]"
            aria-label="Upload photos"
          >
            <CameraIcon className="h-5 w-5" strokeWidth={1.75} />
            <span className="text-[10px] font-semibold uppercase tracking-wide">Upload</span>
          </button>
        )}

        {attachments.length === 0
          ? [0, 1, 2].map((i) => (
              <button
                key={`empty-${i}`}
                type="button"
                onClick={onUpload}
                className="cv-touch flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-[var(--cv-border)] bg-[var(--cv-elevated)]/30 text-[var(--cv-muted)] hover:border-[var(--cv-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cv-primary)]"
                aria-label="Upload photos"
              >
                <PhotoIcon className="h-5 w-5" strokeWidth={1.5} />
              </button>
            ))
          : null}
      </div>
    </div>
  )
}

function GalleryLightbox({
  attachments,
  startIndex,
  onClose,
}: {
  attachments: ReportAttachment[]
  startIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(startIndex)
  const current = attachments[index]

  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Evidence gallery"
    >
      <div className="mb-3 flex items-center justify-between gap-3 text-white">
        <p className="text-sm font-medium">
          Photo {index + 1} of {attachments.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="cv-touch inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label="Close gallery"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <img
          src={current.imageUrl}
          alt={`Evidence uploaded ${formatShort(current.uploadedAt)}`}
          className="max-h-full max-w-full rounded-xl object-contain"
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="sm"
          disabled={index <= 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Previous
        </Button>
        <p className="text-xs text-white/70">
          {current.uploadedBy} · {formatShort(current.uploadedAt)}
        </p>
        <Button
          variant="secondary"
          size="sm"
          disabled={index >= attachments.length - 1}
          onClick={() => setIndex((i) => Math.min(attachments.length - 1, i + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

function ReportCard({
  report,
  defaultOpen,
  onQuickMessage,
  onCharge,
  onAssignTech,
  onEscalate,
  onCloseReport,
  onAddAttachments,
}: {
  report: Report
  defaultOpen?: boolean
  onQuickMessage: () => void
  onCharge: () => void
  onAssignTech: () => void
  onEscalate: () => void
  onCloseReport: () => void
  onAddAttachments: (files: FileList | null) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(Boolean(defaultOpen))
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const overdue = isOverdue(report)
  const closedLike = report.status === 'closed' || report.status === 'charged'
  const status = statusPresentation(report)
  const type = typeBadge(report.reportType)
  const dueLabel = dueSoonLabel(report)
  const lifecycleSteps = buildLifecycleSteps(report)

  const copyId = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(report.id)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard may be unavailable */
    }
  }

  const toggleOpen = () => setOpen((v) => !v)

  const detailRows = [
    { label: 'Equipment', value: report.equipment },
    { label: 'Renter', value: report.renter },
    { label: 'Booking', value: report.bookingId },
    { label: 'Severity', value: `${report.severity} severity` },
    { label: 'Reported', value: formatShort(report.reportedAt) },
    ...(report.dueAt ? [{ label: 'Due', value: formatShort(report.dueAt) }] : []),
    ...(report.reportType === 'damage'
      ? [
          {
            label: report.status === 'charged' ? 'Charged' : 'Estimate',
            value: formatCurrency(report.estimate),
            emphasize: true,
          },
        ]
      : []),
  ]

  return (
    <>
      <article
        className={cn(
          'overflow-hidden rounded-[14px] border border-[var(--cv-border)] bg-[var(--cv-surface)] shadow-[var(--shadow-sm)] transition duration-150',
          closedLike && 'opacity-85',
          overdue && !closedLike && 'border-[color-mix(in_srgb,var(--cv-danger)_35%,var(--cv-border))]',
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
          aria-controls={`report-${report.id}`}
        >
          <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold tracking-tight text-[var(--cv-text)] sm:text-lg">
                  {report.equipment}
                </h3>
                <span
                  className={cn(
                    'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                    type.className,
                  )}
                >
                  {type.label}
                </span>
                <span
                  className={cn(
                    'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                    status.className,
                  )}
                >
                  {status.label}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-[var(--cv-muted)]">
                Renter:{' '}
                <span className="font-medium text-[var(--cv-text)]">{report.renter}</span>
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="text-sm text-[var(--cv-muted)]">Booking {report.bookingId}</p>
                {dueLabel ? (
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                      overdue ? 'bg-[color-mix(in_srgb,var(--cv-danger)_16%,transparent)] text-[var(--cv-danger)]' : 'bg-[var(--cv-warning-soft)] text-[var(--cv-warning)]',
                    )}
                  >
                    {dueLabel}
                  </span>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <SeverityPill severity={report.severity} />
                <span className="text-xs text-[var(--cv-muted)]">Reported {formatShort(report.reportedAt)}</span>
              </div>
              <button
                type="button"
                onClick={copyId}
                className="cv-touch mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)] hover:text-[var(--cv-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cv-primary)]"
                aria-label={`Copy report ID ${report.id}`}
              >
                <ClipboardDocumentIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {copied ? 'Copied' : report.id}
              </button>
            </div>

            <div className="flex items-start justify-between gap-2 lg:flex-col lg:items-end">
              {report.reportType === 'damage' ? (
                <div className="text-left lg:text-right">
                  <p className="text-[22px] font-semibold leading-none tracking-tight tabular-nums text-[var(--cv-text)]">
                    {formatCurrency(report.estimate)}
                  </p>
                  <p className="mt-1.5 text-[11px] font-medium text-[var(--cv-muted)]">
                    {report.status === 'charged' ? `Charged ${formatCurrency(report.estimate)}` : 'Estimate'}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--cv-muted)]">{formatUpdatedAgo(report.updatedAt)}</p>
                </div>
              ) : (
                <div className="text-left lg:text-right">
                  <p className="text-sm font-semibold text-[var(--cv-text)]">{report.id}</p>
                  <p className="mt-1 text-[11px] font-medium text-[var(--cv-muted)]">Issue report</p>
                  <p className="mt-0.5 text-[11px] text-[var(--cv-muted)]">{formatUpdatedAgo(report.updatedAt)}</p>
                </div>
              )}
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
                  aria-controls={`report-${report.id}`}
                  className="cv-touch inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--cv-border)] text-[var(--cv-muted)] transition hover:bg-[var(--cv-elevated)] hover:text-[var(--cv-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cv-primary)]"
                  aria-label={open ? 'Collapse report details' : 'Expand report details'}
                >
                  <ChevronDownIcon className={cn('h-5 w-5 transition', open && 'rotate-180')} strokeWidth={2} />
                </button>
              </div>
            </div>
          </header>
        </div>

        {open ? (
          <div id={`report-${report.id}`} className="space-y-5 border-t border-[var(--cv-border)] px-4 pb-4 pt-5 sm:px-5 sm:pb-5">
            <section>
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--cv-muted)]">
                Report details
              </h4>
              <DetailTable rows={detailRows} />
            </section>

            <section className="rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] p-4">
              <h4 className="text-sm font-semibold text-[var(--cv-text)]">What happens next</h4>
              <div className="mt-3">
                <LifecycleSteps steps={lifecycleSteps} />
              </div>
            </section>

            <section className="rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] p-4">
              <h4 className="text-sm font-semibold text-[var(--cv-text)]">Inspection note</h4>
              <p className="mt-2 text-sm leading-relaxed text-[var(--cv-text)]">{report.note}</p>
              {report.dueAt ? (
                <p
                  className={cn(
                    'mt-2 text-xs font-medium',
                    overdue ? 'text-[var(--cv-danger)]' : 'text-[var(--cv-muted)]',
                  )}
                >
                  Due {formatShort(report.dueAt)}
                </p>
              ) : null}
            </section>

            {overdue ? (
              <div
                className="flex gap-3 rounded-xl border border-[color-mix(in_srgb,var(--cv-danger)_35%,var(--cv-border))] bg-[color-mix(in_srgb,var(--cv-danger)_10%,var(--cv-surface))] px-3.5 py-3 text-sm"
                role="status"
              >
                <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--cv-danger)]" />
                <p className="leading-relaxed text-[var(--cv-text)]">
                  Past due while still open. Escalate or complete the{' '}
                  {report.reportType === 'damage' ? 'deposit charge' : 'repair assignment'}.
                </p>
              </div>
            ) : null}

            <section>
              <EvidenceGrid
                attachments={report.attachments}
                onOpen={(i) => {
                  if (report.attachments.length === 0) fileRef.current?.click()
                  else setGalleryIndex(i)
                }}
                onUpload={() => fileRef.current?.click()}
              />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  onAddAttachments(e.target.files)
                  e.target.value = ''
                }}
              />
            </section>

            <section>
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--cv-muted)]">
                Report timeline
              </h4>
              <ReportTimeline report={report} />
            </section>

            <div className="flex flex-col gap-2 border-t border-[var(--cv-border)] pt-4 sm:flex-row sm:flex-wrap sm:justify-end">
              {closedLike ? (
                <ActionButton>View compliance log</ActionButton>
              ) : (
                <>
                  {report.reportType === 'damage' &&
                  (report.status === 'open' || report.status === 'in_review') ? (
                    <ActionButton primary onClick={onCharge}>
                      Charge deposit
                    </ActionButton>
                  ) : null}

                  {report.reportType === 'issue' && report.status === 'open' ? (
                    <ActionButton primary onClick={onAssignTech}>
                      <WrenchScrewdriverIcon className="h-4 w-4" strokeWidth={1.75} />
                      Assign technician
                    </ActionButton>
                  ) : null}

                  {report.reportType === 'issue' && report.status === 'in_review' ? (
                    <ActionButton primary onClick={onCloseReport}>
                      Mark repair complete
                    </ActionButton>
                  ) : null}

                  {overdue ? (
                    <ActionButton onClick={onEscalate}>Escalate</ActionButton>
                  ) : null}

                  <ActionButton onClick={() => fileRef.current?.click()}>
                    <CameraIcon className="h-4 w-4" strokeWidth={1.75} />
                    Upload photos
                  </ActionButton>

                  {report.status === 'in_review' && report.reportType === 'damage' ? (
                    <ActionButton onClick={onCloseReport}>Close without charge</ActionButton>
                  ) : null}
                </>
              )}
            </div>

            {report.technician ? (
              <p className="text-xs text-[var(--cv-muted)]">Technician: {report.technician}</p>
            ) : null}
          </div>
        ) : null}
      </article>

      {galleryIndex !== null && report.attachments.length > 0 ? (
        <GalleryLightbox
          attachments={report.attachments}
          startIndex={Math.min(galleryIndex, report.attachments.length - 1)}
          onClose={() => setGalleryIndex(null)}
        />
      ) : null}
    </>
  )
}

export function DamageReportsPage() {
  const navigate = useNavigate()
  const [reports, setReports] = useState(INITIAL)
  const [q, setQ] = useState('')
  const [chip, setChip] = useState<FilterChip>('all')
  const [chargeTarget, setChargeTarget] = useState<Report | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const counts = useMemo(() => {
    const overdue = reports.filter(isOverdue).length
    const issue = reports.filter((r) => r.reportType === 'issue').length
    const damage = reports.filter((r) => r.reportType === 'damage').length
    return { all: reports.length, overdue, issue, damage }
  }, [reports])

  const visible = useMemo(() => {
    return reports.filter((r) => {
      const query = q.trim().toLowerCase()
      const matchQ =
        !query ||
        r.id.toLowerCase().includes(query) ||
        r.bookingId.toLowerCase().includes(query) ||
        r.equipment.toLowerCase().includes(query) ||
        r.renter.toLowerCase().includes(query) ||
        r.note.toLowerCase().includes(query)

      if (!matchQ) return false
      if (chip === 'all') return true
      if (chip === 'overdue') return isOverdue(r)
      if (chip === 'issue') return r.reportType === 'issue'
      return r.reportType === 'damage'
    })
  }, [reports, q, chip])

  const flash = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2400)
  }

  const patchReport = (id: string, patch: Partial<Report>) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const addAttachments = (id: string, files: FileList | null) => {
    if (!files?.length) return
    const next: ReportAttachment[] = Array.from(files).map((file, i) => ({
      id: `att-local-${id}-${Date.now()}-${i}`,
      imageUrl: URL.createObjectURL(file),
      uploadedBy: 'Operator',
      uploadedAt: new Date().toISOString(),
    }))
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, attachments: [...r.attachments, ...next] } : r,
      ),
    )
    flash(`${next.length} photo${next.length === 1 ? '' : 's'} attached`)
  }

  const chips: { id: FilterChip; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'overdue', label: 'Overdue', count: counts.overdue },
    { id: 'issue', label: 'Issue', count: counts.issue },
    { id: 'damage', label: 'Damage', count: counts.damage },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Damage claims, inspection notes, and compliance report history."
        actions={
          <Button variant="secondary" onClick={() => navigate('/dashboard/scheduling')}>
            Open scheduling
          </Button>
        }
      />

      {toast ? (
        <div
          className="rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] px-4 py-3 text-sm font-medium text-[var(--cv-text)]"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--cv-text)]">Reports</h2>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">
            Scan status and amount in seconds — expand for details, evidence, and next steps
          </p>
        </div>
      </div>

      <FormInput
        label="Search reports"
        placeholder="Report ID, booking, equipment, or renter"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div
        className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Filter reports"
      >
        {chips.map((c) => {
          const active = chip === c.id
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setChip(c.id)}
              className={cn(
                'cv-touch inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                active
                  ? 'bg-[var(--cv-nav-active-bg)] text-[var(--cv-nav-active-fg)]'
                  : 'bg-[var(--cv-elevated)] text-[var(--cv-muted)] hover:text-[var(--cv-text)]',
              )}
            >
              {c.label}
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[11px] font-bold',
                  active ? 'bg-white/15' : 'bg-[var(--cv-surface)]',
                )}
              >
                {c.count}
              </span>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-[var(--cv-muted)]">
        Overdue is a live status filter across damage and issue reports still open past their due
        date — not a separate report type.
      </p>

      <div className="space-y-4">
        {visible.length === 0 ? (
          <Card className="!rounded-[12px] py-12 text-center">
            <p className="text-lg font-semibold">No reports match</p>
            <p className="mt-1 text-sm text-[var(--cv-muted)]">Try another chip or clear search.</p>
          </Card>
        ) : (
          visible.map((report, index) => (
            <ReportCard
              key={report.id}
              report={report}
              defaultOpen={index < 2}
              onQuickMessage={() => navigate('/dashboard/messages')}
              onCharge={() => setChargeTarget(report)}
              onAssignTech={() => {
                patchReport(report.id, {
                  status: 'in_review',
                  technician: 'Ravi Mech',
                })
                flash(`Technician assigned on ${report.id}`)
              }}
              onEscalate={() => flash(`Escalation reminder queued for ${report.id}`)}
              onCloseReport={() => {
                patchReport(report.id, { status: 'closed' })
                flash(`${report.id} closed · logged to compliance history`)
              }}
              onAddAttachments={(files) => addAttachments(report.id, files)}
            />
          ))
        )}
      </div>

      <Sheet
        open={Boolean(chargeTarget)}
        onClose={() => setChargeTarget(null)}
        title="Confirm deposit charge"
      >
        {chargeTarget ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--cv-muted)]">
              This deducts from the renter’s security deposit and cannot be undone from this screen.
            </p>
            <div className="rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)]/50 p-4 text-sm">
              <p className="font-semibold text-[var(--cv-text)]">{chargeTarget.id}</p>
              <p className="mt-1 text-[var(--cv-muted)]">
                {chargeTarget.equipment} · {chargeTarget.renter}
              </p>
              <p className="mt-3 text-2xl font-bold tabular-nums text-[var(--cv-text)]">
                {formatCurrency(chargeTarget.estimate)}
              </p>
              <p className="mt-1 text-xs text-[var(--cv-muted)]">
                Will be recorded as Charged once payment is captured.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setChargeTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  patchReport(chargeTarget.id, { status: 'charged' })
                  setChargeTarget(null)
                  flash(`Deposit charged on ${chargeTarget.id}`)
                }}
              >
                Confirm charge
              </Button>
            </div>
          </div>
        ) : null}
      </Sheet>
    </div>
  )
}
