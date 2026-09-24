import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowUpCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  EyeOff,
  FileText,
  Flag,
  Globe,
  IndianRupee,
  Package,
  PauseCircle,
  PlayCircle,
  Repeat,
  RotateCcw,
  Scale,
  ShieldAlert,
  Trash2,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react'
import type { ContentItem, Dispute, Listing, Subscription, Transaction } from '@/lib/types'
import type { ResourceConfig, StatusDef } from './types'
import { approve, count, optionsFilter, pct, s, stateFilter, sum, transition } from './helpers'
import { formatInr, formatInrCompact, relativeDue } from '@/lib/utils'

/* ───────── Listings (detail page: /listings/[id]) ───────── */

const LISTING_STATUS: Record<Listing['status'], StatusDef> = {
  pending_review: s('Pending review', 'pending'),
  active: s('Live', 'success'),
  flagged: s('Flagged', 'warning'),
  removed: s('Removed', 'error'),
  archived: s('Archived', 'default'),
}

const LISTING_TYPE: Record<Listing['type'], string> = {
  crop: 'Produce',
  equipment_rental: 'Equipment rental',
  warehouse: 'Warehouse space',
}

export const listingsResource: ResourceConfig<Listing> = {
  collection: 'listings',
  module: 'marketplace',
  entity: 'Listing',
  entityPlural: 'Listings',
  title: (l) => l.title,
  subtitle: (l) => `${l.sellerName} · ${LISTING_TYPE[l.type]}`,
  detailHref: (l) => `/listings/${l.id}`,
  searchText: (l) => `${l.title} ${l.sellerName} ${l.category} ${l.location.district}`,
  status: { value: (l) => l.status, map: LISTING_STATUS },
  defaultSort: { key: 'updated', dir: 'desc' },
  columns: [
    { key: 'title', header: 'Listing', kind: 'strong', value: (l) => l.title, sub: (l) => `${l.category} › ${l.subCategory}` },
    { key: 'type', header: 'Type', value: (l) => LISTING_TYPE[l.type], hideBelow: 'lg' },
    { key: 'seller', header: 'Seller', value: (l) => l.sellerName, sub: (l) => `${l.location.district}, ${l.location.state}`, href: (l) => `/users/${l.sellerId}`, hideBelow: 'md' },
    { key: 'price', header: 'Price', kind: 'money', value: (l) => l.price, sub: (l) => l.rentalPeriod, align: 'right' },
    { key: 'views', header: 'Views', kind: 'number', value: (l) => l.views, align: 'right', hideBelow: 'xl' },
    { key: 'inquiries', header: 'Inquiries', kind: 'number', value: (l) => l.inquiries, align: 'right', hideBelow: 'xl' },
    { key: 'updated', header: 'Updated', kind: 'relative', value: (l) => l.updatedAt, hideBelow: 'lg' },
    { key: 'status', header: 'Status', kind: 'status', value: (l) => l.status },
  ],
  filters: [
    { key: 'type', label: 'Type', options: Object.entries(LISTING_TYPE).map(([value, label]) => ({ value, label })), match: (l, v) => l.type === v },
    stateFilter((l) => l.location.state),
  ],
  kpis: (rows) => [
    { label: 'Live listings', value: count(rows, (l) => l.status === 'active'), icon: Package, highlight: true, trend: 8 },
    { label: 'Pending review', value: count(rows, (l) => l.status === 'pending_review'), hint: 'See Listing approvals', icon: Clock3 },
    { label: 'Flagged', value: count(rows, (l) => l.status === 'flagged'), hintTone: 'warning', hint: 'Check moderation reports', icon: Flag },
    { label: 'Inquiry rate', value: `${pct(sum(rows, (l) => l.inquiries), sum(rows, (l) => l.views))}%`, hint: 'Inquiries ÷ views', icon: Users },
  ],
  detail: [],
  actions: [
    approve<Listing>(['pending_review'], 'active', 'listing', { label: 'Approve' }),
    transition<Listing>({ id: 'flag', label: 'Flag', to: 'flagged', from: ['active'], audit: 'Flagged listing', icon: Flag, bulk: true, confirm: { title: 'Flag this listing for review?', reasonRequired: true, reasonOptions: ['Suspicious price', 'Possible counterfeit', 'User reports', 'Wrong category'] }, extra: () => ({ updatedAt: new Date().toISOString() }) }),
    transition<Listing>({ id: 'remove', label: 'Remove', to: 'removed', from: ['active', 'flagged', 'pending_review'], audit: 'Removed listing', icon: Trash2, tone: 'danger', bulk: true, confirm: { title: 'Remove this listing?', description: 'The seller is notified with the reason and can appeal.', destructive: true, reasonRequired: true, reasonOptions: ['Prohibited item', 'Counterfeit', 'Fraudulent', 'Duplicate', 'Misleading'] } }),
    transition<Listing>({ id: 'restore', label: 'Restore', to: 'active', from: ['flagged', 'removed', 'archived'], audit: 'Restored listing', icon: RotateCcw, tone: 'primary' }),
  ],
}

/* ───────── Transactions ledger (detail page: /transactions/[id]) ───────── */

const TXN_STATUS: Record<Transaction['status'], StatusDef> = {
  completed: s('Completed', 'success'),
  pending: s('Pending', 'pending'),
  failed: s('Failed', 'error'),
  reversed: s('Reversed', 'default'),
}

const TXN_TYPE: Record<Transaction['type'], StatusDef> = {
  payment: s('Payment', 'accent'),
  payout: s('Payout', 'default'),
  refund: s('Refund', 'info'),
  chargeback: s('Chargeback', 'warning'),
}

export const transactionsResource: ResourceConfig<Transaction> = {
  collection: 'transactions',
  module: 'finance',
  entity: 'Transaction',
  entityPlural: 'Transactions',
  title: (t) => `${formatInr(t.amount)} ${t.type}`,
  detailHref: (t) => `/transactions/${t.id}`,
  searchText: (t) => `${t.fromName ?? ''} ${t.toName ?? ''} ${t.gatewayReference ?? ''} ${t.type}`,
  searchPlaceholder: 'Search ID, party or gateway reference…',
  status: { value: (t) => t.status, map: TXN_STATUS },
  defaultSort: { key: 'created', dir: 'desc' },
  columns: [
    { key: 'id', header: 'Transaction', kind: 'mono', value: (t) => t.id, sub: (t) => t.gatewayReference },
    { key: 'type', header: 'Type', kind: 'status', value: (t) => t.type, statusMap: TXN_TYPE },
    { key: 'from', header: 'From', value: (t) => t.fromName, href: (t) => (t.fromUserId ? `/users/${t.fromUserId}` : undefined), hideBelow: 'md' },
    { key: 'to', header: 'To', value: (t) => t.toName, href: (t) => (t.toUserId ? `/users/${t.toUserId}` : undefined), hideBelow: 'lg' },
    { key: 'amount', header: 'Amount', kind: 'money', value: (t) => t.amount, sub: (t) => t.paymentMethod, align: 'right' },
    { key: 'created', header: 'Created', kind: 'datetime', value: (t) => t.createdAt, hideBelow: 'lg' },
    { key: 'status', header: 'Status', kind: 'status', value: (t) => t.status },
  ],
  filters: [
    { key: 'type', label: 'Type', options: Object.entries(TXN_TYPE).map(([value, d]) => ({ value, label: d.label })), match: (t, v) => t.type === v },
    optionsFilter('method', 'Method', ['UPI', 'Card', 'Wallet', 'NetBanking'], (t) => t.paymentMethod ?? ''),
  ],
  kpis: (rows) => {
    const done = rows.filter((t) => t.status === 'completed')
    return [
      { label: 'Completed volume', value: formatInrCompact(sum(done, (t) => t.amount)), icon: ArrowLeftRight, highlight: true },
      { label: 'Payments in', value: formatInrCompact(sum(done.filter((t) => t.type === 'payment'), (t) => t.amount)), icon: IndianRupee },
      { label: 'Payouts out', value: formatInrCompact(sum(done.filter((t) => t.type === 'payout'), (t) => t.amount)), icon: CreditCard },
      { label: 'Failure rate', value: `${pct(count(rows, (t) => t.status === 'failed'), rows.length)}%`, hintTone: 'warning', hint: 'See Transactions monitor', icon: AlertTriangle },
    ]
  },
  detail: [],
}

/* ───────── Subscriptions (detail page: /subscriptions/[id]) ───────── */

const SUB_STATUS: Record<Subscription['status'], StatusDef> = {
  active: s('Active', 'success'),
  expiring_soon: s('Expiring soon', 'warning'),
  paused: s('Paused', 'default'),
  cancelled: s('Cancelled', 'error'),
  expired: s('Expired', 'default'),
}

export const subscriptionsResource: ResourceConfig<Subscription> = {
  collection: 'subscriptions',
  module: 'finance',
  entity: 'Subscription',
  entityPlural: 'Subscriptions',
  title: (x) => `${x.userName} · ${x.planName}`,
  detailHref: (x) => `/subscriptions/${x.id}`,
  searchText: (x) => `${x.userName} ${x.planName}`,
  status: { value: (x) => x.status, map: SUB_STATUS },
  columns: [
    { key: 'user', header: 'Subscriber', kind: 'person', value: (x) => x.userName, href: (x) => `/users/${x.userId}` },
    { key: 'plan', header: 'Plan', kind: 'strong', value: (x) => x.planName },
    { key: 'price', header: 'Monthly', kind: 'money', value: (x) => x.monthlyPrice, align: 'right' },
    { key: 'start', header: 'Started', kind: 'date', value: (x) => x.startDate, hideBelow: 'lg' },
    { key: 'renewal', header: 'Renews', value: (x) => (x.status === 'active' || x.status === 'expiring_soon' ? relativeDue(x.renewalDate).label : '—'), hideBelow: 'md' },
    { key: 'reason', header: 'Cancel reason', value: (x) => x.reason, hideBelow: 'xl' },
    { key: 'status', header: 'Status', kind: 'status', value: (x) => x.status },
  ],
  filters: [optionsFilter('plan', 'Plan', ['Basic', 'Pro', 'Growth', 'Enterprise'], (x) => x.planName)],
  kpis: (rows) => {
    const live = rows.filter((x) => x.status === 'active' || x.status === 'expiring_soon')
    return [
      { label: 'MRR', value: formatInrCompact(sum(live, (x) => x.monthlyPrice)), trend: 6.4, icon: Repeat, highlight: true },
      { label: 'Active subscribers', value: live.length, icon: UserCheck },
      { label: 'Expiring soon', value: count(rows, (x) => x.status === 'expiring_soon'), hint: 'Send renewal nudge', hintTone: 'warning', icon: Clock3 },
      { label: 'Churn (period)', value: `${pct(count(rows, (x) => x.status === 'cancelled'), rows.length)}%`, icon: XCircle },
    ]
  },
  detail: [],
  actions: [
    transition<Subscription>({ id: 'pause', label: 'Pause', to: 'paused', from: ['active', 'expiring_soon'], audit: 'Paused subscription', icon: PauseCircle, bulk: true, confirm: { title: 'Pause this subscription?', description: 'Billing stops; plan benefits are suspended until resumed.', reasonRequired: true } }),
    transition<Subscription>({ id: 'resume', label: 'Resume', to: 'active', from: ['paused'], audit: 'Resumed subscription', icon: PlayCircle, tone: 'primary', bulk: true }),
    transition<Subscription>({ id: 'cancel', label: 'Cancel', to: 'cancelled', from: ['active', 'expiring_soon', 'paused'], audit: 'Cancelled subscription', icon: XCircle, tone: 'danger', confirm: { title: 'Cancel this subscription?', description: 'Access continues until the end of the paid period.', destructive: true, reasonRequired: true, reasonOptions: ['Requested by user', 'Payment failed', 'Fraud', 'Plan retired'] }, extra: () => ({ cancelledAt: new Date().toISOString() }) }),
  ],
}

/* ───────── Disputes (detail page: /disputes/[id]) ───────── */

const DISPUTE_STATUS: Record<Dispute['status'], StatusDef> = {
  new: s('New', 'pending'),
  under_investigation: s('Investigating', 'info'),
  awaiting_response: s('Awaiting response', 'default'),
  escalated: s('Escalated', 'error'),
  resolved: s('Resolved', 'success'),
}

export const disputesResource: ResourceConfig<Dispute> = {
  collection: 'disputes',
  module: 'trust',
  entity: 'Dispute',
  entityPlural: 'Disputes',
  title: (d) => `${d.reason} — ${formatInr(d.amount)}`,
  detailHref: (d) => `/disputes/${d.id}`,
  searchText: (d) => `${d.buyerName} ${d.sellerName} ${d.reason} ${d.transactionId}`,
  status: { value: (d) => d.status, map: DISPUTE_STATUS },
  tabs: [
    { value: 'open', label: 'Open', match: (d) => d.status !== 'resolved' },
    { value: 'new', label: 'New', match: (d) => d.status === 'new' },
    { value: 'escalated', label: 'Escalated', match: (d) => d.status === 'escalated' },
    { value: 'breached', label: 'Past SLA', match: (d) => d.status !== 'resolved' && new Date(d.slaDeadline).getTime() < Date.now() },
    { value: 'resolved', label: 'Resolved', match: (d) => d.status === 'resolved' },
    { value: 'all', label: 'All' },
  ],
  defaultSort: { key: 'sla', dir: 'asc' },
  columns: [
    { key: 'id', header: 'Case', kind: 'mono', value: (d) => d.id, sub: (d) => d.transactionId },
    { key: 'reason', header: 'Issue', kind: 'strong', value: (d) => d.reason, sub: (d) => d.latestNote },
    { key: 'parties', header: 'Buyer vs seller', value: (d) => d.buyerName, sub: (d) => `vs ${d.sellerName}`, hideBelow: 'md' },
    { key: 'amount', header: 'Amount', kind: 'money', value: (d) => d.amount, align: 'right' },
    { key: 'assignee', header: 'Owner', value: (d) => d.assignedToName ?? 'Unassigned', hideBelow: 'lg' },
    { key: 'sla', header: 'SLA', value: (d) => (d.status === 'resolved' ? '—' : relativeDue(d.slaDeadline).label) },
    { key: 'status', header: 'Status', kind: 'status', value: (d) => d.status },
  ],
  filters: [optionsFilter('reason', 'Issue', ['Defective Product', 'Short Quantity', 'Late Delivery', 'Wrong Item', 'Payment Issue', 'Quality Mismatch'], (d) => d.reason)],
  kpis: (rows) => {
    const open = rows.filter((d) => d.status !== 'resolved')
    return [
      { label: 'Open disputes', value: open.length, icon: Scale, highlight: true },
      { label: 'Past SLA', value: count(open, (d) => new Date(d.slaDeadline).getTime() < Date.now()), hintTone: 'error', hint: '7-day resolution SLA', icon: AlertTriangle },
      { label: 'Amount in dispute', value: formatInrCompact(sum(open, (d) => d.amount)), icon: IndianRupee },
      { label: 'Resolution rate', value: `${pct(count(rows, (d) => d.status === 'resolved'), rows.length)}%`, icon: CheckCircle2 },
    ]
  },
  detail: [],
  actions: [
    {
      id: 'assign',
      label: 'Assign',
      icon: UserCheck,
      bulk: true,
      when: (d) => d.status !== 'resolved',
      confirm: { title: 'Assign case owner', choice: { label: 'Owner', options: ['Maya Singh', 'Raj Kumar', 'Arjun Mehta'].map((v) => ({ value: v, label: v })) } },
      run: (_, input) => ({ patch: { assignedToName: input.choice, status: 'under_investigation' }, audit: `Assigned to ${input.choice}` }),
    },
    transition<Dispute>({ id: 'escalate', label: 'Escalate', to: 'escalated', from: ['new', 'under_investigation', 'awaiting_response'], audit: 'Escalated dispute', icon: ArrowUpCircle, tone: 'danger', confirm: { title: 'Escalate to Trust & Safety lead?', reasonRequired: true } }),
  ],
}

/* ───────── CMS content (editor: /content/[id]) ───────── */

const CONTENT_STATUS: Record<ContentItem['status'], StatusDef> = {
  published: s('Published', 'success'),
  scheduled: s('Scheduled', 'info'),
  draft: s('Draft', 'default'),
}

const CONTENT_TYPE: Record<ContentItem['type'], string> = {
  banner: 'App banner',
  play_store: 'Play Store copy',
  legal: 'Legal page',
  faq: 'FAQ',
}

export const contentResource: ResourceConfig<ContentItem> = {
  collection: 'contentItems',
  module: 'support',
  entity: 'Content',
  entityPlural: 'Content items',
  title: (c) => c.title,
  detailHref: (c) => `/content/${c.id}`,
  searchText: (c) => `${c.title} ${c.type} ${c.updatedBy}`,
  status: { value: (c) => c.status, map: CONTENT_STATUS },
  columns: [
    { key: 'title', header: 'Title', kind: 'strong', value: (c) => c.title, sub: (c) => `v${c.version}` },
    { key: 'type', header: 'Type', value: (c) => CONTENT_TYPE[c.type] },
    { key: 'by', header: 'Last edited by', value: (c) => c.updatedBy, hideBelow: 'md' },
    { key: 'updated', header: 'Updated', kind: 'relative', value: (c) => c.updatedAt },
    { key: 'published', header: 'Published', kind: 'date', value: (c) => c.publishedAt ?? c.scheduledAt, hideBelow: 'lg' },
    { key: 'status', header: 'Status', kind: 'status', value: (c) => c.status },
  ],
  filters: [{ key: 'type', label: 'Type', options: Object.entries(CONTENT_TYPE).map(([value, label]) => ({ value, label })), match: (c, v) => c.type === v }],
  kpis: (rows) => [
    { label: 'Published', value: count(rows, (c) => c.status === 'published'), icon: Globe, highlight: true },
    { label: 'Scheduled', value: count(rows, (c) => c.status === 'scheduled'), icon: Clock3 },
    { label: 'Drafts', value: count(rows, (c) => c.status === 'draft'), icon: FileText },
    { label: 'Legal pages', value: count(rows, (c) => c.type === 'legal'), hint: 'Reviewed by counsel', icon: ShieldAlert },
  ],
  detail: [],
  actions: [
    transition<ContentItem>({ id: 'publish', label: 'Publish now', to: 'published', from: ['draft', 'scheduled'], audit: 'Published content', tone: 'primary', icon: Globe, bulk: true, confirm: { title: 'Publish now?', description: 'It goes live in the app on the next refresh (≈5 minutes).' }, extra: (c) => ({ publishedAt: new Date().toISOString(), version: c.version + 1, updatedAt: new Date().toISOString() }) }),
    transition<ContentItem>({ id: 'unpublish', label: 'Unpublish', to: 'draft', from: ['published', 'scheduled'], audit: 'Unpublished content', icon: EyeOff, tone: 'danger', confirm: { title: 'Take this offline?', destructive: true, reasonRequired: true } }),
  ],
}
