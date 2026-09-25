import { Ban, CheckCircle2, PauseCircle, PlayCircle, XCircle } from 'lucide-react'
import { INDIAN_STATES } from '@/lib/types'
import type { ResourceAction, ResourceFilter, StatusDef } from './types'

/** Shared building blocks so every module's actions read and behave the same way. */

export const STATE_NAMES: Record<string, string> = {
  MH: 'Maharashtra', KA: 'Karnataka', TN: 'Tamil Nadu', UP: 'Uttar Pradesh', GJ: 'Gujarat',
  RJ: 'Rajasthan', PB: 'Punjab', HR: 'Haryana', AP: 'Andhra Pradesh', TS: 'Telangana',
  KL: 'Kerala', WB: 'West Bengal', OR: 'Odisha', MP: 'Madhya Pradesh', BR: 'Bihar',
  JH: 'Jharkhand', CG: 'Chhattisgarh', AS: 'Assam', UK: 'Uttarakhand', HP: 'Himachal Pradesh',
}

export function stateFilter<T>(get: (row: T) => string): ResourceFilter<T> {
  return {
    key: 'state',
    label: 'State',
    options: INDIAN_STATES.map((s) => ({ value: s, label: STATE_NAMES[s] ?? s })),
    match: (row, v) => get(row) === v,
  }
}

export function optionsFilter<T>(
  key: string,
  label: string,
  values: readonly string[],
  get: (row: T) => string | string[]
): ResourceFilter<T> {
  return {
    key,
    label,
    options: values.map((v) => ({ value: v, label: v })),
    match: (row, v) => {
      const val = get(row)
      return Array.isArray(val) ? val.includes(v) : val === v
    },
  }
}

export const count = <T,>(rows: T[], pred: (r: T) => boolean) => rows.filter(pred).length
export const sum = <T,>(rows: T[], get: (r: T) => number) => rows.reduce((s, r) => s + get(r), 0)
export const avg = <T,>(rows: T[], get: (r: T) => number) => (rows.length ? sum(rows, get) / rows.length : 0)
export const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 1000) / 10 : 0)

export function location(district?: string, state?: string) {
  return [district, state ? STATE_NAMES[state] ?? state : undefined].filter(Boolean).join(', ')
}

/** Status transition with no extra input */
export function transition<T extends { status: string }>(opts: {
  id: string
  label: string
  to: T['status']
  from?: T['status'][]
  audit: string
  tone?: ResourceAction<T>['tone']
  icon?: ResourceAction<T>['icon']
  bulk?: boolean
  confirm?: ResourceAction<T>['confirm']
  extra?: (row: T) => Partial<T>
}): ResourceAction<T> {
  return {
    id: opts.id,
    label: opts.label,
    icon: opts.icon,
    tone: opts.tone ?? 'secondary',
    bulk: opts.bulk,
    when: opts.from ? (r) => (opts.from as string[]).includes(r.status) : undefined,
    confirm: opts.confirm,
    run: (row) => ({
      patch: { status: opts.to, ...(opts.extra?.(row) ?? {}) } as Partial<T>,
      audit: opts.audit,
    }),
  }
}

export function approve<T extends { status: string }>(
  from: T['status'][],
  to: T['status'],
  entity: string,
  opts: { bulk?: boolean; label?: string } = {}
): ResourceAction<T> {
  return transition<T>({
    id: 'approve',
    label: opts.label ?? 'Approve',
    to,
    from,
    audit: `Approved ${entity}`,
    tone: 'primary',
    icon: CheckCircle2,
    bulk: opts.bulk ?? true,
    confirm: {
      title: `Approve this ${entity}?`,
      description: 'It becomes visible to users immediately.',
      confirmLabel: opts.label ?? 'Approve',
    },
  })
}

export function reject<T extends { status: string }>(
  from: T['status'][],
  to: T['status'],
  entity: string,
  reasons: string[],
  opts: { label?: string; bulk?: boolean; audit?: string; id?: string } = {}
): ResourceAction<T> {
  return {
    id: opts.id ?? 'reject',
    label: opts.label ?? 'Reject',
    icon: XCircle,
    tone: 'danger',
    bulk: opts.bulk,
    when: (r) => (from as string[]).includes(r.status),
    confirm: {
      title: `${opts.label ?? 'Reject'} this ${entity}?`,
      description: 'The owner is notified with the reason you choose.',
      destructive: true,
      reasonRequired: true,
      reasonOptions: reasons,
      confirmLabel: opts.label ?? 'Reject',
    },
    run: () => ({
      patch: { status: to } as Partial<T>,
      audit: opts.audit ?? `Rejected ${entity}`,
      severity: 'warning',
    }),
  }
}

export const SUSPEND_REASONS = [
  'Fraud or suspicious activity',
  'Repeated policy violations',
  'Expired or invalid documents',
  'Safety complaint under investigation',
  'Requested by user',
]

export function suspend<T extends { status: string }>(
  from: T['status'][],
  to: T['status'],
  entity: string,
  opts: { bulk?: boolean } = {}
): ResourceAction<T> {
  return {
    id: 'suspend',
    label: 'Suspend',
    icon: PauseCircle,
    tone: 'danger',
    bulk: opts.bulk ?? true,
    when: (r) => (from as string[]).includes(r.status),
    confirm: {
      title: `Suspend this ${entity}?`,
      description: 'It stops appearing to users and cannot take new work until reactivated.',
      destructive: true,
      reasonRequired: true,
      reasonOptions: SUSPEND_REASONS,
      choice: {
        label: 'Duration',
        options: [
          { value: 'indefinite', label: 'Indefinite' },
          { value: 'until', label: 'Until date' },
        ],
      },
      date: { label: 'Suspended until', showWhenChoice: 'until' },
      confirmLabel: 'Suspend',
    },
    run: (_, input) => ({
      patch: { status: to } as Partial<T>,
      audit: input.date ? `Suspended ${entity} until ${new Date(input.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}` : `Suspended ${entity}`,
      severity: 'warning',
    }),
  }
}

export function reactivate<T extends { status: string }>(
  from: T['status'][],
  to: T['status'],
  entity: string
): ResourceAction<T> {
  return transition<T>({
    id: 'reactivate',
    label: 'Reactivate',
    to,
    from,
    audit: `Reactivated ${entity}`,
    icon: PlayCircle,
    bulk: true,
    confirm: { title: `Reactivate this ${entity}?`, description: 'It becomes available to users again.', confirmLabel: 'Reactivate' },
  })
}

export function block<T extends { status: string }>(
  from: T['status'][],
  to: T['status'],
  entity: string,
  reasons: string[]
): ResourceAction<T> {
  return {
    id: 'block',
    label: 'Block',
    icon: Ban,
    tone: 'danger',
    bulk: true,
    when: (r) => (from as string[]).includes(r.status),
    confirm: {
      title: `Block this ${entity}?`,
      destructive: true,
      reasonRequired: true,
      reasonOptions: reasons,
      confirmLabel: 'Block',
    },
    run: () => ({ patch: { status: to } as Partial<T>, audit: `Blocked ${entity}`, severity: 'warning' }),
  }
}

export const s = (label: string, tone: StatusDef['tone']): StatusDef => ({ label, tone })
