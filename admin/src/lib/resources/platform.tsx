import {
  AlertTriangle,
  ArrowUpCircle,
  BellOff,
  Bot,
  CheckCircle2,
  Clock3,
  EyeOff,
  FileBarChart,
  Flag,
  Inbox,
  Link2,
  MessageSquare,
  PauseCircle,
  PlayCircle,
  Plug,
  RefreshCw,
  Reply,
  ShieldAlert,
  Siren,
  Smile,
  Timer,
  Trash2,
  UserCheck,
  Zap,
} from 'lucide-react'
import type { Integration, ModerationReport, PlatformAlert, ReportDefinition, SupportTicket } from '@/lib/types/ops'
import type { ResourceConfig, StatusDef } from './types'
import { avg, count, optionsFilter, pct, s, transition } from './helpers'
import { cn } from '@/lib/cn'
import { formatDateTime, relativeDue } from '@/lib/utils'

/* ───────── Content moderation ───────── */

const MOD_STATUS: Record<ModerationReport['status'], StatusDef> = {
  open: s('Open', 'pending'),
  escalated: s('Escalated', 'error'),
  removed: s('Removed', 'default'),
  warned: s('User warned', 'info'),
  dismissed: s('Dismissed', 'success'),
}

const SEVERITY: Record<ModerationReport['severity'], StatusDef> = {
  high: s('High', 'error'),
  medium: s('Medium', 'warning'),
  low: s('Low', 'default'),
}

export const moderationResource: ResourceConfig<ModerationReport> = {
  collection: 'moderationReports',
  module: 'trust',
  entity: 'Report',
  entityPlural: 'Reports',
  title: (m) => `${m.reason} — ${m.contentType}`,
  subtitle: (m) => `Against ${m.reportedUserName} · reported by ${m.reporterName}`,
  searchText: (m) => `${m.content} ${m.reason} ${m.reportedUserName} ${m.reporterName}`,
  status: { value: (m) => m.status, map: MOD_STATUS },
  tabs: [
    { value: 'queue', label: 'Queue', match: (m) => m.status === 'open' },
    { value: 'escalated', label: 'Escalated', match: (m) => m.status === 'escalated' },
    { value: 'actioned', label: 'Actioned', match: (m) => m.status === 'removed' || m.status === 'warned' },
    { value: 'dismissed', label: 'Dismissed', match: (m) => m.status === 'dismissed' },
    { value: 'all', label: 'All' },
  ],
  defaultSort: { key: 'ai', dir: 'desc' },
  columns: [
    { key: 'content', header: 'Content', kind: 'strong', value: (m) => m.content, sub: (m) => m.contentType },
    { key: 'reason', header: 'Reason', value: (m) => m.reason, hideBelow: 'md' },
    { key: 'user', header: 'Reported user', value: (m) => m.reportedUserName, href: (m) => `/users/${m.reportedUserId}`, hideBelow: 'lg' },
    { key: 'reports', header: 'Reports', kind: 'number', value: (m) => m.reports, align: 'right', hideBelow: 'lg' },
    { key: 'ai', header: 'Model score', kind: 'progress', value: (m) => m.aiScore * 100, hideBelow: 'xl' },
    { key: 'severity', header: 'Severity', kind: 'status', value: (m) => m.severity, statusMap: SEVERITY },
    { key: 'created', header: 'Reported', kind: 'relative', value: (m) => m.createdAt },
  ],
  filters: [
    optionsFilter('type', 'Content type', ['listing', 'review', 'profile', 'message', 'image'], (m) => m.contentType),
    { key: 'severity', label: 'Severity', options: Object.entries(SEVERITY).map(([value, d]) => ({ value, label: d.label })), match: (m, v) => m.severity === v },
  ],
  kpis: (rows) => [
    { label: 'In queue', value: count(rows, (m) => m.status === 'open'), icon: Flag, highlight: true },
    { label: 'High severity', value: count(rows, (m) => m.status === 'open' && m.severity === 'high'), hint: 'Review within 2h', hintTone: 'error', icon: ShieldAlert },
    { label: 'Auto-detected', value: `${pct(count(rows, (m) => m.reporterName === 'Auto-detection'), rows.length)}%`, icon: Bot },
    { label: 'Action rate', value: `${pct(count(rows, (m) => m.status === 'removed' || m.status === 'warned'), count(rows, (m) => !['open', 'escalated'].includes(m.status)))}%`, icon: CheckCircle2 },
  ],
  drawerHero: (m) => (
    <figure className="rounded-xl border border-border-default bg-bg-inset p-4">
      <figcaption className="mb-2 text-xs uppercase tracking-wider text-text-muted">Reported {m.contentType}</figcaption>
      <blockquote className="text-base text-text-primary">{m.content}</blockquote>
    </figure>
  ),
  detail: [
    {
      title: 'Report',
      fields: [
        { label: 'Reason', value: (m) => m.reason },
        { label: 'Severity', kind: 'status', value: (m) => m.severity, statusMap: SEVERITY },
        { label: 'Reports', kind: 'number', value: (m) => m.reports },
        { label: 'Model score', kind: 'progress', value: (m) => m.aiScore * 100 },
        { label: 'Reported user', value: (m) => m.reportedUserName, href: (m) => `/users/${m.reportedUserId}` },
        { label: 'Reported by', value: (m) => m.reporterName },
      ],
    },
  ],
  related: (m) => [{ label: 'User profile', href: `/users/${m.reportedUserId}` }],
  actions: [
    transition<ModerationReport>({ id: 'remove', label: 'Remove content', to: 'removed', from: ['open', 'escalated'], audit: 'Removed content', tone: 'danger', icon: Trash2, bulk: true, confirm: { title: 'Remove this content?', description: 'It is hidden from everyone and the user is told which policy it broke.', destructive: true, reasonRequired: true, reasonOptions: ['Prohibited item', 'Abusive or hateful', 'Spam or scam', 'Misleading', 'Impersonation', 'Off-platform contact'] } }),
    transition<ModerationReport>({ id: 'warn', label: 'Warn user', to: 'warned', from: ['open', 'escalated'], audit: 'Warned user', icon: AlertTriangle, bulk: true, confirm: { title: 'Send a policy warning?', description: 'Three warnings in 90 days trigger automatic suspension.', reasonRequired: true } }),
    transition<ModerationReport>({ id: 'escalate', label: 'Escalate', to: 'escalated', from: ['open'], audit: 'Escalated to Trust & Safety lead', icon: ArrowUpCircle, confirm: { title: 'Escalate to a lead?', reasonRequired: true } }),
    transition<ModerationReport>({ id: 'dismiss', label: 'Dismiss', to: 'dismissed', from: ['open', 'escalated'], audit: 'Dismissed report — no violation', icon: EyeOff, tone: 'primary', bulk: true }),
  ],
}

/* ───────── Support ───────── */

const TICKET_STATUS: Record<SupportTicket['status'], StatusDef> = {
  open: s('Open', 'pending'),
  in_progress: s('In progress', 'info'),
  pending_user: s('Waiting on user', 'default'),
  resolved: s('Resolved', 'success'),
  closed: s('Closed', 'default'),
}

const PRIORITY: Record<SupportTicket['priority'], StatusDef> = {
  urgent: s('Urgent', 'error'),
  high: s('High', 'warning'),
  medium: s('Medium', 'info'),
  low: s('Low', 'default'),
}

const isOpen = (t: SupportTicket) => t.status === 'open' || t.status === 'in_progress'
const slaBreached = (t: SupportTicket) => isOpen(t) && new Date(t.slaDueAt).getTime() < Date.now()

export const supportResource: ResourceConfig<SupportTicket> = {
  collection: 'supportTickets',
  module: 'support',
  entity: 'Ticket',
  entityPlural: 'Tickets',
  title: (t) => t.subject,
  subtitle: (t) => `${t.requesterName} · ${t.channel} · ${t.language}`,
  searchText: (t) => `${t.subject} ${t.requesterName} ${t.category} ${t.assignee ?? ''}`,
  status: { value: (t) => t.status, map: TICKET_STATUS },
  tabs: [
    { value: 'active', label: 'Active', match: isOpen },
    { value: 'unassigned', label: 'Unassigned', match: (t) => isOpen(t) && !t.assignee },
    { value: 'breached', label: 'SLA breached', match: slaBreached },
    { value: 'pending_user', label: 'Waiting on user', match: (t) => t.status === 'pending_user' },
    { value: 'done', label: 'Resolved', match: (t) => t.status === 'resolved' || t.status === 'closed' },
    { value: 'all', label: 'All' },
  ],
  defaultSort: { key: 'sla', dir: 'asc' },
  columns: [
    { key: 'subject', header: 'Ticket', kind: 'strong', value: (t) => t.subject, sub: (t) => `${t.id} · ${t.category}` },
    { key: 'requester', header: 'Requester', kind: 'person', value: (t) => t.requesterName, sub: (t) => t.channel, href: (t) => `/users/${t.requesterId}`, hideBelow: 'md' },
    { key: 'priority', header: 'Priority', kind: 'status', value: (t) => t.priority, statusMap: PRIORITY },
    { key: 'assignee', header: 'Assignee', value: (t) => t.assignee ?? 'Unassigned', hideBelow: 'lg' },
    { key: 'sla', header: 'SLA', value: (t) => (isOpen(t) ? relativeDue(t.slaDueAt).label : '—') },
    { key: 'updated', header: 'Updated', kind: 'relative', value: (t) => t.updatedAt, hideBelow: 'xl' },
    { key: 'status', header: 'Status', kind: 'status', value: (t) => t.status },
  ],
  filters: [
    optionsFilter('category', 'Category', ['Payments', 'Orders', 'KYC', 'Account', 'Bookings', 'Technical', 'Other'], (t) => t.category),
    optionsFilter('channel', 'Channel', ['App', 'WhatsApp', 'Phone', 'Email'], (t) => t.channel),
    { key: 'priority', label: 'Priority', options: Object.entries(PRIORITY).map(([value, d]) => ({ value, label: d.label })), match: (t, v) => t.priority === v },
  ],
  kpis: (rows) => {
    const rated = rows.filter((t) => t.csat != null)
    return [
      { label: 'Open tickets', value: count(rows, isOpen), icon: Inbox, highlight: true },
      { label: 'SLA breached', value: count(rows, slaBreached), hint: 'Escalate to L2', hintTone: 'error', icon: Timer },
      { label: 'Unassigned', value: count(rows, (t) => isOpen(t) && !t.assignee), icon: UserCheck },
      { label: 'CSAT', value: `${avg(rated, (t) => t.csat!).toFixed(1)} / 5`, trend: 3.1, icon: Smile },
    ]
  },
  drawerHero: (t) => (
    <section aria-label="Conversation">
      <h3 className="mb-3 text-2xs font-semibold uppercase tracking-wider text-text-muted">Conversation</h3>
      <ol className="space-y-3">
        {t.messages.map((m) => (
          <li
            key={m.id}
            className={cn(
              'max-w-[88%] rounded-xl border p-3 text-sm',
              m.from === 'user' && 'border-border-default bg-bg-inset',
              m.from === 'agent' && 'ml-auto border-brand-lime/30 bg-brand-lime/10',
              m.from === 'internal' && 'ml-auto border-dashed border-status-warning/40 bg-status-warning/10'
            )}
          >
            <p className="mb-1 flex items-center gap-2 text-xs text-text-muted">
              <span className="font-semibold text-text-secondary">{m.author}</span>
              {m.from === 'internal' ? <span className="text-status-warning">Internal note</span> : null}
              <span>· {formatDateTime(m.at)}</span>
            </p>
            <p className="whitespace-pre-line text-text-primary">{m.body}</p>
          </li>
        ))}
      </ol>
    </section>
  ),
  detail: [
    {
      title: 'Ticket',
      fields: [
        { label: 'Category', value: (t) => t.category },
        { label: 'Priority', kind: 'status', value: (t) => t.priority, statusMap: PRIORITY },
        { label: 'Channel', value: (t) => t.channel },
        { label: 'Language', value: (t) => t.language },
        { label: 'Assignee', value: (t) => t.assignee ?? 'Unassigned' },
        { label: 'SLA due', kind: 'datetime', value: (t) => t.slaDueAt },
        { label: 'Created', kind: 'datetime', value: (t) => t.createdAt },
        { label: 'CSAT', value: (t) => (t.csat ? `${t.csat} / 5` : undefined) },
      ],
    },
  ],
  related: (t) => [
    { label: 'Requester profile', href: `/users/${t.requesterId}` },
    ...(t.category === 'Payments' ? [{ label: 'Payments', href: `/finance/payments?q=${encodeURIComponent(t.requesterName)}` }] : []),
    ...(t.category === 'KYC' ? [{ label: 'KYC queue', href: '/kyc' }] : []),
    ...(t.category === 'Orders' ? [{ label: 'Orders', href: `/marketplace/orders?q=${encodeURIComponent(t.requesterName)}` }] : []),
  ],
  actions: [
    {
      id: 'reply',
      label: 'Reply',
      icon: Reply,
      tone: 'primary',
      when: (t) => t.status !== 'closed',
      confirm: {
        title: (t) => `Reply to ${t.requesterName}`,
        description: (t) => `Sent via ${t.channel} in ${t.language}.`,
        reasonRequired: true,
        reasonLabel: 'Message',
        reasonMultiline: true,
        hideNote: true,
        choice: {
          label: 'After sending',
          options: [
            { value: 'pending_user', label: 'Wait on user' },
            { value: 'resolved', label: 'Mark resolved' },
          ],
        },
        confirmLabel: 'Send reply',
      },
      run: (t, input) => ({
        patch: {
          status: input.choice as SupportTicket['status'],
          assignee: t.assignee ?? 'You',
          updatedAt: new Date().toISOString(),
          messages: [
            ...t.messages,
            { id: `m-${Date.now()}`, from: 'agent', author: t.assignee ?? 'You', body: input.reason ?? '', at: new Date().toISOString() },
          ],
        },
        audit: input.choice === 'resolved' ? 'Replied and resolved ticket' : 'Replied to user',
      }),
    },
    {
      id: 'assign',
      label: 'Assign',
      icon: UserCheck,
      bulk: true,
      when: isOpen,
      confirm: {
        title: 'Assign ticket',
        choice: { label: 'Assignee', options: ['Arjun Mehta', 'Maya Singh', 'Priya Nair (L2)'].map((a) => ({ value: a, label: a })) },
        confirmLabel: 'Assign',
      },
      run: (_, input) => ({ patch: { assignee: input.choice, status: 'in_progress' }, audit: `Assigned to ${input.choice}` }),
    },
    {
      id: 'priority',
      label: 'Change priority',
      icon: Siren,
      when: isOpen,
      confirm: { title: 'Change priority', choice: { label: 'Priority', options: Object.entries(PRIORITY).map(([value, d]) => ({ value, label: d.label })) }, reasonRequired: true },
      run: (t, input) => ({ patch: { priority: input.choice as SupportTicket['priority'] }, audit: `Changed priority ${t.priority} → ${input.choice}` }),
    },
    transition<SupportTicket>({ id: 'close', label: 'Close', to: 'closed', from: ['resolved', 'pending_user'], audit: 'Closed ticket', icon: CheckCircle2, bulk: true }),
    transition<SupportTicket>({ id: 'reopen', label: 'Reopen', to: 'open', from: ['resolved', 'closed'], audit: 'Reopened ticket', icon: RefreshCw }),
  ],
}

/* ───────── Alerts ───────── */

const ALERT_STATUS: Record<PlatformAlert['status'], StatusDef> = {
  open: s('Open', 'error'),
  acknowledged: s('Acknowledged', 'pending'),
  snoozed: s('Snoozed', 'default'),
  resolved: s('Resolved', 'success'),
}

export const ALERT_SEVERITY: Record<PlatformAlert['severity'], StatusDef> = {
  critical: s('Critical', 'error'),
  high: s('High', 'warning'),
  medium: s('Medium', 'info'),
  low: s('Low', 'default'),
}

const SEV_RANK = { critical: 4, high: 3, medium: 2, low: 1 }

export const alertsResource: ResourceConfig<PlatformAlert> = {
  collection: 'alerts',
  module: 'dashboard',
  entity: 'Alert',
  entityPlural: 'Alerts',
  title: (a) => a.title,
  subtitle: (a) => `${a.category} · ${a.source}`,
  searchText: (a) => `${a.title} ${a.description} ${a.category} ${a.source}`,
  status: { value: (a) => a.status, map: ALERT_STATUS },
  tabs: [
    { value: 'active', label: 'Active', match: (a) => a.status === 'open' || a.status === 'acknowledged' },
    { value: 'open', label: 'Unacknowledged', match: (a) => a.status === 'open' },
    { value: 'snoozed', label: 'Snoozed', match: (a) => a.status === 'snoozed' },
    { value: 'resolved', label: 'Resolved', match: (a) => a.status === 'resolved' },
    { value: 'all', label: 'All' },
  ],
  defaultSort: { key: 'severity', dir: 'desc' },
  columns: [
    { key: 'title', header: 'Alert', kind: 'strong', value: (a) => a.title, sub: (a) => a.description },
    { key: 'severity', header: 'Severity', kind: 'status', value: (a) => a.severity, statusMap: ALERT_SEVERITY },
    { key: 'category', header: 'Category', value: (a) => a.category, sub: (a) => a.source, hideBelow: 'md' },
    { key: 'owner', header: 'Owner', value: (a) => a.owner ?? 'Unassigned', hideBelow: 'lg' },
    { key: 'raised', header: 'Raised', kind: 'relative', value: (a) => a.createdAt },
    { key: 'status', header: 'Status', kind: 'status', value: (a) => a.status },
  ],
  filters: [optionsFilter('category', 'Category', ['Fraud', 'System', 'SLA', 'Finance', 'Compliance', 'Operations'], (a) => a.category)],
  kpis: (rows) => {
    const active = rows.filter((a) => a.status === 'open' || a.status === 'acknowledged')
    return [
      { label: 'Active alerts', value: active.length, icon: Siren, highlight: true },
      { label: 'Critical', value: count(active, (a) => a.severity === 'critical'), hintTone: 'error', hint: 'Page on-call', icon: AlertTriangle },
      { label: 'Unowned', value: count(active, (a) => !a.owner), icon: UserCheck },
      { label: 'Resolved (7d)', value: count(rows, (a) => a.status === 'resolved'), icon: CheckCircle2 },
    ]
  },
  detail: [
    {
      title: 'Alert',
      fields: [
        { label: 'Description', value: (a) => a.description, span: 2 },
        { label: 'Severity', kind: 'status', value: (a) => a.severity, statusMap: ALERT_SEVERITY },
        { label: 'Category', value: (a) => a.category },
        { label: 'Source', value: (a) => a.source },
        { label: 'Owner', value: (a) => a.owner ?? 'Unassigned' },
        { label: 'Raised', kind: 'datetime', value: (a) => a.createdAt },
      ],
    },
  ],
  related: (a) => (a.href ? [{ label: 'Open affected module', href: a.href }] : []),
  actions: [
    transition<PlatformAlert>({ id: 'ack', label: 'Acknowledge', to: 'acknowledged', from: ['open'], audit: 'Acknowledged alert', tone: 'primary', icon: CheckCircle2, bulk: true, extra: (a) => ({ owner: a.owner ?? 'You' }) }),
    transition<PlatformAlert>({ id: 'resolve', label: 'Resolve', to: 'resolved', from: ['open', 'acknowledged', 'snoozed'], audit: 'Resolved alert', icon: CheckCircle2, bulk: true, confirm: { title: 'Resolve this alert?', reasonRequired: true, reasonLabel: 'Resolution / root cause' } }),
    {
      id: 'snooze',
      label: 'Snooze',
      icon: BellOff,
      when: (a) => a.status === 'open' || a.status === 'acknowledged',
      confirm: { title: 'Snooze alert', choice: { label: 'For', options: [{ value: '1h', label: '1 hour' }, { value: '4h', label: '4 hours' }, { value: '24h', label: '24 hours' }, { value: '7d', label: '7 days' }] }, reasonRequired: true },
      run: (_, input) => ({ patch: { status: 'snoozed' }, audit: `Snoozed alert for ${input.choice}` }),
    },
  ],
}

export function sortAlerts(rows: PlatformAlert[]) {
  return [...rows].sort((a, b) => SEV_RANK[b.severity] - SEV_RANK[a.severity] || b.createdAt.localeCompare(a.createdAt))
}

/* ───────── Reports ───────── */

const REPORT_STATUS: Record<ReportDefinition['status'], StatusDef> = {
  active: s('Active', 'success'),
  paused: s('Paused', 'default'),
  failed: s('Last run failed', 'error'),
}

export const reportsResource: ResourceConfig<ReportDefinition> = {
  collection: 'reportDefinitions',
  module: 'reports',
  entity: 'Report',
  entityPlural: 'Reports',
  title: (r) => r.name,
  subtitle: (r) => `${r.area} · ${r.frequency} · ${r.format}`,
  searchText: (r) => `${r.name} ${r.area} ${r.owner}`,
  status: { value: (r) => r.status, map: REPORT_STATUS },
  columns: [
    { key: 'name', header: 'Report', kind: 'strong', value: (r) => r.name, sub: (r) => r.area },
    { key: 'frequency', header: 'Schedule', value: (r) => r.frequency, sub: (r) => r.format },
    { key: 'recipients', header: 'Recipients', kind: 'tags', value: (r) => r.recipients, hideBelow: 'lg' },
    { key: 'last', header: 'Last run', kind: 'relative', value: (r) => r.lastRunAt, sub: (r) => (r.lastRows ? `${r.lastRows.toLocaleString('en-IN')} rows` : undefined) },
    { key: 'next', header: 'Next run', value: (r) => (r.nextRunAt ? relativeDue(r.nextRunAt).label : 'On demand'), hideBelow: 'md' },
    { key: 'owner', header: 'Owner', value: (r) => r.owner, hideBelow: 'xl' },
    { key: 'status', header: 'Status', kind: 'status', value: (r) => r.status },
  ],
  filters: [optionsFilter('area', 'Area', ['Marketplace', 'Finance', 'Users', 'Services', 'Operations', 'Trust & Safety', 'Support', 'Growth', 'Compliance'], (r) => r.area)],
  kpis: (rows) => [
    { label: 'Scheduled reports', value: count(rows, (r) => r.frequency !== 'On demand'), icon: FileBarChart, highlight: true },
    { label: 'Runs (24h)', value: count(rows, (r) => !!r.lastRunAt && Date.now() - new Date(r.lastRunAt).getTime() < 86400000), icon: Clock3 },
    { label: 'Failed', value: count(rows, (r) => r.status === 'failed'), hintTone: 'error', hint: 'Re-run after fix', icon: AlertTriangle },
    { label: 'Recipients', value: new Set(rows.flatMap((r) => r.recipients)).size, icon: MessageSquare },
  ],
  detail: [
    {
      title: 'Definition',
      fields: [
        { label: 'Area', value: (r) => r.area },
        { label: 'Frequency', value: (r) => r.frequency },
        { label: 'Format', value: (r) => r.format },
        { label: 'Owner', value: (r) => r.owner },
        { label: 'Recipients', kind: 'tags', value: (r) => r.recipients, span: 2 },
        { label: 'Last run', kind: 'datetime', value: (r) => r.lastRunAt },
        { label: 'Next run', kind: 'datetime', value: (r) => r.nextRunAt },
      ],
    },
  ],
  actions: [
    {
      id: 'run',
      label: 'Run now',
      icon: Zap,
      tone: 'primary',
      bulk: true,
      when: (r) => r.status !== 'paused',
      run: (r) => ({ patch: { lastRunAt: new Date().toISOString(), status: 'active', lastRows: (r.lastRows ?? 100) + Math.floor(Math.random() * 200) }, audit: 'Ran report', toast: `${r.name} generated — emailed to ${r.recipients.length} recipient(s)` }),
    },
    transition<ReportDefinition>({ id: 'pause', label: 'Pause schedule', to: 'paused', from: ['active', 'failed'], audit: 'Paused report schedule', icon: PauseCircle }),
    transition<ReportDefinition>({ id: 'resume', label: 'Resume schedule', to: 'active', from: ['paused'], audit: 'Resumed report schedule', icon: PlayCircle }),
  ],
  create: {
    label: 'Schedule report',
    idPrefix: 'RPT-',
    fields: [
      { name: 'name', label: 'Report name', type: 'text', required: true, placeholder: 'e.g. District-wise GMV' },
      { name: 'area', label: 'Area', type: 'select', options: ['Marketplace', 'Finance', 'Users', 'Services', 'Operations', 'Trust & Safety', 'Support', 'Growth', 'Compliance'].map((v) => ({ value: v, label: v })) },
      { name: 'frequency', label: 'Frequency', type: 'select', options: ['Daily', 'Weekly', 'Monthly', 'On demand'].map((v) => ({ value: v, label: v })) },
      { name: 'format', label: 'Format', type: 'select', options: ['XLSX', 'CSV', 'PDF'].map((v) => ({ value: v, label: v })) },
      { name: 'recipients', label: 'Recipients (comma separated)', type: 'textarea', required: true, placeholder: 'ops@cropvibe.com, finance@cropvibe.com' },
    ],
    build: (v, id) => ({
      id,
      name: v.name!,
      area: v.area!,
      frequency: v.frequency as ReportDefinition['frequency'],
      format: v.format as ReportDefinition['format'],
      recipients: v.recipients!.split(',').map((r) => r.trim()).filter(Boolean),
      owner: 'You',
      nextRunAt: v.frequency === 'On demand' ? undefined : new Date(Date.now() + 86400000).toISOString(),
      status: 'active',
    }),
  },
}

/* ───────── Integrations ───────── */

const INTEGRATION_STATUS: Record<Integration['status'], StatusDef> = {
  active: s('Active', 'success'),
  degraded: s('Degraded', 'warning'),
  disconnected: s('Disconnected', 'error'),
  paused: s('Paused', 'default'),
}

export const integrationsResource: ResourceConfig<Integration> = {
  collection: 'integrations',
  module: 'settings',
  entity: 'Connection',
  entityPlural: 'Connections',
  title: (i) => i.name,
  subtitle: (i) => `${i.partner} · ${i.protocol} · ${i.direction}`,
  searchText: (i) => `${i.name} ${i.partner} ${i.endpoint} ${i.category}`,
  status: { value: (i) => i.status, map: INTEGRATION_STATUS },
  columns: [
    { key: 'name', header: 'Connection', kind: 'strong', value: (i) => i.name, sub: (i) => i.partner },
    { key: 'category', header: 'Category', value: (i) => i.category, hideBelow: 'lg' },
    { key: 'protocol', header: 'Protocol type', kind: 'mono', value: (i) => i.protocol, sub: (i) => i.direction },
    { key: 'endpoint', header: 'URL', kind: 'mono', value: (i) => i.endpoint, hideBelow: 'xl' },
    { key: 'encryption', header: 'Encryption', value: (i) => i.encryption, hideBelow: 'md' },
    { key: 'success', header: 'Success', kind: 'progress', value: (i) => i.successRate, hideBelow: 'lg' },
    { key: 'sync', header: 'Last sync', kind: 'relative', value: (i) => i.lastSyncAt },
    { key: 'status', header: 'Protocol status', kind: 'status', value: (i) => i.status },
  ],
  filters: [optionsFilter('category', 'Category', ['Payments', 'Logistics', 'Messaging', 'Identity', 'Accounting', 'Maps'], (i) => i.category)],
  kpis: (rows) => [
    { label: 'Connections', value: rows.length, icon: Plug, highlight: true },
    { label: 'Healthy', value: count(rows, (i) => i.status === 'active'), icon: CheckCircle2 },
    { label: 'Degraded', value: count(rows, (i) => i.status === 'degraded'), hintTone: 'warning', hint: 'Failover active', icon: AlertTriangle },
    { label: 'Avg success rate', value: `${avg(rows.filter((i) => i.status !== 'paused'), (i) => i.successRate).toFixed(1)}%`, icon: Link2 },
  ],
  detail: [
    {
      title: 'Connection',
      fields: [
        { label: 'Partner', value: (i) => i.partner },
        { label: 'Protocol type', kind: 'mono', value: (i) => i.protocol },
        { label: 'Direction', value: (i) => i.direction },
        { label: 'Encryption', value: (i) => i.encryption },
        { label: 'URL', kind: 'mono', value: (i) => i.endpoint, span: 2 },
        { label: 'Port', value: (i) => i.port },
        { label: 'User name', kind: 'mono', value: (i) => i.username },
        { label: 'File pattern', kind: 'mono', value: (i) => i.filePattern },
        { label: 'Partner certificate expiry', kind: 'date', value: (i) => i.certificateExpiry },
      ],
    },
    {
      title: 'Health',
      fields: [
        { label: 'Success rate (24h)', kind: 'progress', value: (i) => i.successRate },
        { label: 'Last sync', kind: 'datetime', value: (i) => i.lastSyncAt },
        { label: 'Creation time', kind: 'datetime', value: (i) => i.createdAt },
        { label: 'Modification time', kind: 'datetime', value: (i) => i.updatedAt },
      ],
    },
  ],
  actions: [
    {
      id: 'test',
      label: 'Test connection',
      icon: RefreshCw,
      tone: 'primary',
      when: (i) => i.status !== 'paused',
      run: (i) => ({ patch: { lastSyncAt: new Date().toISOString() }, audit: 'Ran connection test', toast: i.status === 'degraded' ? `${i.name}: reachable, elevated error rate` : `${i.name}: connection OK` }),
    },
    transition<Integration>({ id: 'pause', label: 'Pause', to: 'paused', from: ['active', 'degraded'], audit: 'Paused integration', icon: PauseCircle, tone: 'danger', confirm: { title: 'Pause this integration?', description: 'Data stops flowing until resumed. Dependent features may fail.', destructive: true, reasonRequired: true } }),
    transition<Integration>({ id: 'resume', label: 'Resume', to: 'active', from: ['paused', 'disconnected'], audit: 'Resumed integration', icon: PlayCircle, tone: 'primary', extra: () => ({ lastSyncAt: new Date().toISOString(), updatedAt: new Date().toISOString() }) }),
  ],
}
