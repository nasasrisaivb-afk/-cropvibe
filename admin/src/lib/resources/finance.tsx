import {
  AlertTriangle,
  Ban,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileCheck2,
  FileX2,
  Gavel,
  Hourglass,
  IndianRupee,
  Landmark,
  PauseCircle,
  PlayCircle,
  Receipt,
  RefreshCw,
  Scale,
  Send,
  Undo2,
  Upload,
} from 'lucide-react'
import type { FinancialDispute, Invoice, Payment, Payout, Refund, RevenueEntry, Settlement } from '@/lib/types/ops'
import type { ResourceConfig, StatusDef } from './types'
import { count, optionsFilter, pct, s, sum, transition } from './helpers'
import { formatInr, formatInrCompact, relativeDue } from '@/lib/utils'

const GATEWAYS = ['Razorpay', 'PayU', 'Cashfree']

/* ───────── Revenue ledger ───────── */

const REVENUE_STATUS: Record<RevenueEntry['status'], StatusDef> = {
  recognized: s('Recognised', 'success'),
  deferred: s('Deferred', 'pending'),
  reversed: s('Reversed', 'error'),
}

export const REVENUE_STREAMS = [
  'Marketplace commission',
  'Rental commission',
  'Logistics fee',
  'Warehouse commission',
  'Expert consult fee',
  'Soil test fee',
  'Subscriptions',
  'Promoted listings',
]

export const revenueResource: ResourceConfig<RevenueEntry> = {
  collection: 'revenueEntries',
  module: 'finance',
  entity: 'Revenue entry',
  entityPlural: 'Revenue entries',
  title: (r) => `${r.stream} · ${formatInr(r.amount)}`,
  subtitle: (r) => `${r.reference} · ${r.counterparty}`,
  searchText: (r) => `${r.stream} ${r.reference} ${r.counterparty}`,
  status: { value: (r) => r.status, map: REVENUE_STATUS },
  defaultSort: { key: 'date', dir: 'desc' },
  columns: [
    { key: 'id', header: 'Entry', kind: 'mono', value: (r) => r.id },
    { key: 'stream', header: 'Stream', kind: 'strong', value: (r) => r.stream },
    { key: 'ref', header: 'Reference', kind: 'mono', value: (r) => r.reference, hideBelow: 'md' },
    { key: 'party', header: 'Counterparty', value: (r) => r.counterparty, hideBelow: 'lg' },
    { key: 'gross', header: 'Gross value', kind: 'money', value: (r) => r.gross, align: 'right', hideBelow: 'lg' },
    { key: 'amount', header: 'Revenue', kind: 'money', value: (r) => r.amount, align: 'right' },
    { key: 'date', header: 'Date', kind: 'date', value: (r) => r.date },
    { key: 'status', header: 'Status', kind: 'status', value: (r) => r.status },
  ],
  filters: [optionsFilter('stream', 'Stream', REVENUE_STREAMS, (r) => r.stream)],
  kpis: (rows) => {
    const rec = rows.filter((r) => r.status === 'recognized')
    return [
      { label: 'Recognised revenue (90d)', value: formatInrCompact(sum(rec, (r) => r.amount)), trend: 18.6, icon: IndianRupee, highlight: true },
      { label: 'Effective take rate', value: `${pct(sum(rec, (r) => r.amount), sum(rec, (r) => r.gross))}%`, icon: CircleDollarSign },
      { label: 'Deferred', value: formatInrCompact(sum(rows.filter((r) => r.status === 'deferred'), (r) => r.amount)), hint: 'Recognised on completion', icon: Hourglass },
      { label: 'Reversed', value: formatInrCompact(sum(rows.filter((r) => r.status === 'reversed'), (r) => r.amount)), hint: 'From refunds & cancellations', hintTone: 'error', icon: Undo2 },
    ]
  },
  detail: [
    {
      title: 'Entry',
      fields: [
        { label: 'Stream', value: (r) => r.stream },
        { label: 'Reference', kind: 'mono', value: (r) => r.reference },
        { label: 'Counterparty', value: (r) => r.counterparty },
        { label: 'Gross value', kind: 'money', value: (r) => r.gross },
        { label: 'Revenue', kind: 'money', value: (r) => r.amount },
        { label: 'Date', kind: 'datetime', value: (r) => r.date },
      ],
    },
  ],
  actions: [
    transition<RevenueEntry>({ id: 'recognise', label: 'Recognise now', to: 'recognized', from: ['deferred'], audit: 'Recognised deferred revenue', tone: 'primary', icon: CheckCircle2, bulk: true, confirm: { title: 'Recognise this revenue now?', description: 'Only when the underlying order or booking is complete.', reasonRequired: true } }),
    transition<RevenueEntry>({ id: 'reverse', label: 'Reverse entry', to: 'reversed', from: ['recognized', 'deferred'], audit: 'Reversed revenue entry', tone: 'danger', icon: Undo2, confirm: { title: 'Reverse this revenue entry?', description: 'Posts a contra entry. Use for refunds or billing errors.', destructive: true, reasonRequired: true, reasonOptions: ['Order refunded', 'Billing error', 'Commission waived', 'Duplicate posting'] } }),
  ],
}

/* ───────── Payments ───────── */

const PAYMENT_STATUS: Record<Payment['status'], StatusDef> = {
  captured: s('Captured', 'success'),
  authorized: s('Authorised', 'info'),
  pending: s('Pending', 'pending'),
  failed: s('Failed', 'error'),
  refunded: s('Refunded', 'default'),
}

export const paymentsResource: ResourceConfig<Payment> = {
  collection: 'payments',
  module: 'finance',
  entity: 'Payment',
  entityPlural: 'Payments',
  title: (p) => `${formatInr(p.amount)} from ${p.payerName}`,
  subtitle: (p) => `${p.method} via ${p.gateway} · ${p.gatewayRef}`,
  searchText: (p) => `${p.payerName} ${p.reference} ${p.gatewayRef} ${p.method}`,
  searchPlaceholder: 'Search payment, order, payer or gateway ref…',
  status: { value: (p) => p.status, map: PAYMENT_STATUS },
  defaultSort: { key: 'created', dir: 'desc' },
  columns: [
    { key: 'id', header: 'Payment', kind: 'mono', value: (p) => p.id, sub: (p) => p.reference },
    { key: 'payer', header: 'Payer', kind: 'person', value: (p) => p.payerName, href: (p) => `/users/${p.payerId}` },
    { key: 'amount', header: 'Amount', kind: 'money', value: (p) => p.amount, align: 'right' },
    { key: 'method', header: 'Method', value: (p) => p.method, sub: (p) => p.gateway, hideBelow: 'md' },
    { key: 'fee', header: 'Gateway fee', kind: 'money', value: (p) => p.fee, align: 'right', hideBelow: 'xl' },
    { key: 'created', header: 'Time', kind: 'relative', value: (p) => p.createdAt, hideBelow: 'lg' },
    { key: 'status', header: 'Status', kind: 'status', value: (p) => p.status, sub: (p) => p.failureReason },
  ],
  filters: [optionsFilter('method', 'Method', ['UPI', 'Card', 'Net banking', 'Wallet'], (p) => p.method), optionsFilter('gateway', 'Gateway', GATEWAYS, (p) => p.gateway)],
  kpis: (rows) => {
    const attempted = rows.filter((p) => p.status !== 'pending')
    const ok = count(attempted, (p) => p.status !== 'failed')
    return [
      { label: 'Collected', value: formatInrCompact(sum(rows.filter((p) => p.status === 'captured'), (p) => p.amount)), trend: 7.8, icon: IndianRupee, highlight: true },
      { label: 'Success rate', value: `${pct(ok, attempted.length)}%`, hint: 'Target 97%', hintTone: pct(ok, attempted.length) < 97 ? 'warning' : 'success', icon: CheckCircle2 },
      { label: 'UPI share', value: `${pct(count(rows, (p) => p.method === 'UPI'), rows.length)}%`, icon: CreditCard },
      { label: 'Gateway fees', value: formatInrCompact(sum(rows, (p) => p.fee)), icon: Receipt },
    ]
  },
  detail: [
    {
      title: 'Payment',
      fields: [
        { label: 'Amount', kind: 'money', value: (p) => p.amount },
        { label: 'Gateway fee', kind: 'money', value: (p) => p.fee },
        { label: 'Method', value: (p) => p.method },
        { label: 'Gateway', value: (p) => p.gateway },
        { label: 'Gateway reference', kind: 'mono', value: (p) => p.gatewayRef, span: 2 },
        { label: 'Failure reason', value: (p) => p.failureReason },
        { label: 'Created', kind: 'datetime', value: (p) => p.createdAt },
      ],
    },
    {
      title: 'For',
      fields: [
        { label: 'Reference', kind: 'mono', value: (p) => p.reference, href: (p) => (p.reference.startsWith('ORD') ? `/marketplace/orders?id=${p.reference}` : `/operations/bookings?id=${p.reference}`) },
        { label: 'Payer', value: (p) => p.payerName, href: (p) => `/users/${p.payerId}` },
      ],
    },
  ],
  related: (p) => [{ label: 'Refunds for this payment', href: `/finance/refunds?q=${p.id}` }],
  actions: [
    transition<Payment>({ id: 'capture', label: 'Capture', to: 'captured', from: ['authorized'], audit: 'Captured authorised payment', tone: 'primary', icon: CheckCircle2, bulk: true }),
    transition<Payment>({ id: 'recheck', label: 'Re-check with gateway', to: 'captured', from: ['pending'], audit: 'Re-queried gateway — payment captured', icon: RefreshCw, bulk: true }),
    {
      id: 'refund',
      label: 'Issue refund',
      icon: Undo2,
      tone: 'danger',
      when: (p) => p.status === 'captured',
      confirm: {
        title: (p) => `Refund payment ${p.id}`,
        description: 'Creates a refund request that finance approves in Refunds.',
        amount: { label: 'Refund amount', max: (p) => p.amount, defaultValue: (p) => p.amount },
        reasonRequired: true,
        reasonOptions: ['Order cancelled', 'Quality issue', 'Duplicate payment', 'Goodwill'],
        destructive: true,
        confirmLabel: 'Create refund',
      },
      run: (p, input) => ({
        patch: input.amount === p.amount ? { status: 'refunded' } : {},
        audit: `Issued ${input.amount === p.amount ? 'full' : 'partial'} refund of ${formatInr(input.amount ?? 0)}`,
        severity: 'warning',
      }),
    },
  ],
}

/* ───────── Refunds ───────── */

const REFUND_STATUS: Record<Refund['status'], StatusDef> = {
  requested: s('Requested', 'pending'),
  approved: s('Approved', 'info'),
  processing: s('Processing', 'accent'),
  completed: s('Completed', 'success'),
  rejected: s('Rejected', 'error'),
}

export const refundsResource: ResourceConfig<Refund> = {
  collection: 'refunds',
  module: 'finance',
  entity: 'Refund',
  entityPlural: 'Refunds',
  title: (r) => `${formatInr(r.amount)} to ${r.customerName}`,
  subtitle: (r) => `${r.reason} · ${r.destination}`,
  searchText: (r) => `${r.customerName} ${r.paymentId} ${r.orderId} ${r.reason}`,
  status: { value: (r) => r.status, map: REFUND_STATUS },
  defaultSort: { key: 'requested', dir: 'asc' },
  columns: [
    { key: 'id', header: 'Refund', kind: 'mono', value: (r) => r.id, sub: (r) => r.paymentId },
    { key: 'customer', header: 'Customer', kind: 'person', value: (r) => r.customerName, href: (r) => `/users/${r.customerId}` },
    { key: 'amount', header: 'Amount', kind: 'money', value: (r) => r.amount, align: 'right' },
    { key: 'reason', header: 'Reason', value: (r) => r.reason, hideBelow: 'md' },
    { key: 'dest', header: 'Refund to', value: (r) => r.destination, hideBelow: 'xl' },
    { key: 'requested', header: 'Requested', kind: 'relative', value: (r) => r.requestedAt },
    { key: 'status', header: 'Status', kind: 'status', value: (r) => r.status },
  ],
  filters: [optionsFilter('dest', 'Destination', ['Original source', 'CropVibe wallet'], (r) => r.destination)],
  kpis: (rows) => [
    { label: 'Awaiting approval', value: count(rows, (r) => r.status === 'requested'), hint: formatInrCompact(sum(rows.filter((r) => r.status === 'requested'), (r) => r.amount)), hintTone: 'warning', icon: Clock3, highlight: true },
    { label: 'In flight', value: count(rows, (r) => r.status === 'approved' || r.status === 'processing'), icon: RefreshCw },
    { label: 'Refunded (30d)', value: formatInrCompact(sum(rows.filter((r) => r.status === 'completed'), (r) => r.amount)), icon: Undo2 },
    { label: 'Rejection rate', value: `${pct(count(rows, (r) => r.status === 'rejected'), rows.length)}%`, icon: Ban },
  ],
  detail: [
    {
      title: 'Refund',
      fields: [
        { label: 'Amount', kind: 'money', value: (r) => r.amount },
        { label: 'Refund to', value: (r) => r.destination },
        { label: 'Reason', value: (r) => r.reason, span: 2 },
        { label: 'Requested', kind: 'datetime', value: (r) => r.requestedAt },
        { label: 'Approved by', value: (r) => r.approvedBy },
      ],
    },
    {
      title: 'Source',
      fields: [
        { label: 'Payment', kind: 'mono', value: (r) => r.paymentId, href: (r) => `/finance/payments?id=${r.paymentId}` },
        { label: 'Order / booking', kind: 'mono', value: (r) => r.orderId },
        { label: 'Customer', value: (r) => r.customerName, href: (r) => `/users/${r.customerId}` },
      ],
    },
  ],
  actions: [
    {
      id: 'approve',
      label: 'Approve refund',
      icon: CheckCircle2,
      tone: 'primary',
      bulk: true,
      when: (r) => r.status === 'requested',
      confirm: { title: (r) => `Approve ${formatInr(r.amount)} refund?`, description: 'Money is sent within 5–7 working days (instant for wallet).', confirmLabel: 'Approve' },
      run: (r) => ({ patch: { status: r.destination === 'CropVibe wallet' ? 'completed' : 'processing', approvedBy: 'You' }, audit: `Approved refund of ${formatInr(r.amount)}` }),
    },
    {
      id: 'reject',
      label: 'Reject',
      icon: Ban,
      tone: 'danger',
      when: (r) => r.status === 'requested',
      confirm: { title: 'Reject this refund?', description: 'The customer is told the reason and can reopen via support.', destructive: true, reasonRequired: true, reasonOptions: ['Delivered as described (POD + photos)', 'Outside refund window', 'Already refunded', 'Suspected abuse'], confirmLabel: 'Reject refund' },
      run: () => ({ patch: { status: 'rejected' }, audit: 'Rejected refund', severity: 'warning' }),
    },
    transition<Refund>({ id: 'complete', label: 'Mark completed', to: 'completed', from: ['processing', 'approved'], audit: 'Marked refund completed (bank confirmation)', icon: CheckCircle2 }),
  ],
}

/* ───────── Settlements ───────── */

const SETTLEMENT_STATUS: Record<Settlement['status'], StatusDef> = {
  scheduled: s('Scheduled', 'pending'),
  settled: s('Settled', 'info'),
  mismatch: s('Mismatch', 'error'),
  reconciled: s('Reconciled', 'success'),
}

export const settlementsResource: ResourceConfig<Settlement> = {
  collection: 'settlements',
  module: 'finance',
  entity: 'Settlement',
  entityPlural: 'Settlements',
  title: (st) => `${st.gateway} · ${new Date(st.periodEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`,
  subtitle: (st) => `${st.txnCount} transactions · UTR ${st.utr ?? 'pending'}`,
  searchText: (st) => `${st.gateway} ${st.utr ?? ''}`,
  status: { value: (st) => st.status, map: SETTLEMENT_STATUS },
  defaultSort: { key: 'period', dir: 'desc' },
  columns: [
    { key: 'id', header: 'Batch', kind: 'mono', value: (st) => st.id, sub: (st) => st.gateway },
    { key: 'period', header: 'Period', kind: 'date', value: (st) => st.periodEnd },
    { key: 'txns', header: 'Txns', kind: 'number', value: (st) => st.txnCount, align: 'right', hideBelow: 'md' },
    { key: 'gross', header: 'Gross', kind: 'money', value: (st) => st.gross, align: 'right', hideBelow: 'lg' },
    { key: 'fees', header: 'Fees + GST', kind: 'money', value: (st) => st.fees + st.tax, align: 'right', hideBelow: 'xl' },
    { key: 'net', header: 'Net settled', kind: 'money', value: (st) => st.net, align: 'right' },
    { key: 'variance', header: 'Variance', kind: 'money', value: (st) => st.net - st.expected, align: 'right' },
    { key: 'status', header: 'Status', kind: 'status', value: (st) => st.status },
  ],
  filters: [optionsFilter('gateway', 'Gateway', GATEWAYS, (st) => st.gateway)],
  kpis: (rows) => [
    { label: 'Net settled (10 days)', value: formatInrCompact(sum(rows.filter((st) => st.status !== 'scheduled'), (st) => st.net)), icon: Landmark, highlight: true },
    { label: 'Scheduled today', value: formatInrCompact(sum(rows.filter((st) => st.status === 'scheduled'), (st) => st.expected)), icon: Clock3 },
    { label: 'Mismatches', value: count(rows, (st) => st.status === 'mismatch'), hint: formatInr(sum(rows.filter((st) => st.status === 'mismatch'), (st) => st.expected - st.net)) + ' short', hintTone: 'error', icon: AlertTriangle },
    { label: 'Reconciled', value: `${pct(count(rows, (st) => st.status === 'reconciled'), count(rows, (st) => st.status !== 'scheduled'))}%`, icon: FileCheck2 },
  ],
  detail: [
    {
      title: 'Batch',
      fields: [
        { label: 'Gateway', value: (st) => st.gateway },
        { label: 'Transactions', kind: 'number', value: (st) => st.txnCount },
        { label: 'Period start', kind: 'datetime', value: (st) => st.periodStart },
        { label: 'Period end', kind: 'datetime', value: (st) => st.periodEnd },
        { label: 'UTR', kind: 'mono', value: (st) => st.utr },
        { label: 'Settled at', kind: 'datetime', value: (st) => st.settledAt },
      ],
    },
    {
      title: 'Reconciliation',
      fields: [
        { label: 'Gross', kind: 'money', value: (st) => st.gross },
        { label: 'Gateway fees', kind: 'money', value: (st) => st.fees },
        { label: 'GST on fees', kind: 'money', value: (st) => st.tax },
        { label: 'Expected net', kind: 'money', value: (st) => st.expected },
        { label: 'Actual net', kind: 'money', value: (st) => st.net },
        { label: 'Variance', kind: 'money', value: (st) => st.net - st.expected },
      ],
    },
  ],
  actions: [
    transition<Settlement>({ id: 'reconcile', label: 'Mark reconciled', to: 'reconciled', from: ['settled'], audit: 'Marked settlement reconciled', tone: 'primary', icon: FileCheck2, bulk: true }),
    {
      id: 'raise',
      label: 'Raise with gateway',
      icon: Send,
      tone: 'primary',
      when: (st) => st.status === 'mismatch',
      confirm: { title: (st) => `Raise ${formatInr(st.expected - st.net)} shortfall with ${st.gateway}?`, description: 'Opens a financial dispute and emails the gateway account manager.', reasonRequired: true, reasonLabel: 'Summary for the gateway', confirmLabel: 'Raise ticket' },
      run: (st) => ({ patch: {}, audit: `Raised shortfall of ${formatInr(st.expected - st.net)} with ${st.gateway}`, severity: 'warning' }),
    },
    {
      id: 'writeoff',
      label: 'Accept variance',
      icon: CheckCircle2,
      when: (st) => st.status === 'mismatch',
      confirm: { title: 'Accept the variance and reconcile?', description: 'Books the difference to gateway charges. Requires a reason for the auditors.', destructive: true, reasonRequired: true, confirmLabel: 'Accept & reconcile' },
      run: () => ({ patch: { status: 'reconciled' }, audit: 'Accepted variance and reconciled', severity: 'critical' }),
    },
  ],
}

/* ───────── Payouts ───────── */

const PAYOUT_STATUS: Record<Payout['status'], StatusDef> = {
  pending_approval: s('Needs approval', 'pending'),
  scheduled: s('Scheduled', 'info'),
  processing: s('Processing', 'accent'),
  paid: s('Paid', 'success'),
  failed: s('Failed', 'error'),
  on_hold: s('On hold', 'warning'),
}

export const payoutsResource: ResourceConfig<Payout> = {
  collection: 'payouts',
  module: 'finance',
  entity: 'Payout',
  entityPlural: 'Payouts',
  title: (p) => `${formatInr(p.amount)} to ${p.beneficiaryName}`,
  subtitle: (p) => `${p.beneficiaryRole} · ${p.cycle}`,
  searchText: (p) => `${p.beneficiaryName} ${p.beneficiaryRole} ${p.ifsc}`,
  status: { value: (p) => p.status, map: PAYOUT_STATUS },
  tabs: [
    { value: 'approval', label: 'Needs approval', match: (p) => p.status === 'pending_approval' },
    { value: 'issues', label: 'Failed / on hold', match: (p) => p.status === 'failed' || p.status === 'on_hold' },
    { value: 'scheduled', label: 'Scheduled', match: (p) => p.status === 'scheduled' || p.status === 'processing' },
    { value: 'paid', label: 'Paid', match: (p) => p.status === 'paid' },
    { value: 'all', label: 'All' },
  ],
  columns: [
    { key: 'id', header: 'Payout', kind: 'mono', value: (p) => p.id, sub: (p) => p.cycle },
    { key: 'to', header: 'Beneficiary', kind: 'person', value: (p) => p.beneficiaryName, sub: (p) => p.beneficiaryRole, href: (p) => `/users/${p.beneficiaryId}` },
    { key: 'amount', header: 'Amount', kind: 'money', value: (p) => p.amount, sub: (p) => `${p.orders} orders`, align: 'right' },
    { key: 'bank', header: 'Bank', kind: 'mono', value: (p) => p.bankMasked, sub: (p) => p.ifsc, hideBelow: 'lg' },
    { key: 'when', header: 'Pay date', kind: 'date', value: (p) => p.scheduledFor, hideBelow: 'md' },
    { key: 'status', header: 'Status', kind: 'status', value: (p) => p.status, sub: (p) => p.holdReason },
  ],
  filters: [optionsFilter('role', 'Beneficiary', ['Seller', 'Rental owner', 'Labor', 'Driver', 'Warehouse owner', 'Expert'], (p) => p.beneficiaryRole)],
  kpis: (rows) => [
    { label: 'Awaiting approval', value: formatInrCompact(sum(rows.filter((p) => p.status === 'pending_approval'), (p) => p.amount)), hint: `${count(rows, (p) => p.status === 'pending_approval')} payouts`, icon: Clock3, highlight: true },
    { label: 'Scheduled this cycle', value: formatInrCompact(sum(rows.filter((p) => p.status === 'scheduled' || p.status === 'processing'), (p) => p.amount)), icon: Banknote },
    { label: 'Paid (30d)', value: formatInrCompact(sum(rows.filter((p) => p.status === 'paid'), (p) => p.amount)), trend: 9.3, icon: CheckCircle2 },
    { label: 'Failed or held', value: count(rows, (p) => p.status === 'failed' || p.status === 'on_hold'), hint: 'Fix bank details / KYC', hintTone: 'error', icon: AlertTriangle },
  ],
  detail: [
    {
      title: 'Payout',
      fields: [
        { label: 'Amount', kind: 'money', value: (p) => p.amount },
        { label: 'Orders covered', kind: 'number', value: (p) => p.orders },
        { label: 'Cycle', value: (p) => p.cycle },
        { label: 'Pay date', kind: 'date', value: (p) => p.scheduledFor },
        { label: 'Hold reason', value: (p) => p.holdReason, span: 2 },
      ],
    },
    {
      title: 'Beneficiary',
      fields: [
        { label: 'Name', value: (p) => p.beneficiaryName, href: (p) => `/users/${p.beneficiaryId}` },
        { label: 'Role', value: (p) => p.beneficiaryRole },
        { label: 'Account', kind: 'mono', value: (p) => p.bankMasked },
        { label: 'IFSC', kind: 'mono', value: (p) => p.ifsc },
      ],
    },
  ],
  actions: [
    {
      id: 'approve',
      label: 'Approve payout',
      icon: CheckCircle2,
      tone: 'primary',
      bulk: true,
      when: (p) => p.status === 'pending_approval',
      confirm: { title: (p) => `Approve ${formatInr(p.amount)} to ${p.beneficiaryName}?`, description: 'Released in the next payout window (10:00 and 16:00 IST).', confirmLabel: 'Approve' },
      run: (p) => ({ patch: { status: 'scheduled' }, audit: `Approved payout of ${formatInr(p.amount)}`, severity: 'warning' }),
    },
    {
      id: 'hold',
      label: 'Put on hold',
      icon: PauseCircle,
      tone: 'danger',
      bulk: true,
      when: (p) => ['pending_approval', 'scheduled'].includes(p.status),
      confirm: { title: 'Hold this payout?', description: 'The beneficiary sees “on hold” with the reason.', destructive: true, reasonRequired: true, reasonOptions: ['Open dispute on order', 'KYC expired', 'Bank account name mismatch', 'Fraud review'], confirmLabel: 'Hold payout' },
      run: (_, input) => ({ patch: { status: 'on_hold', holdReason: input.reason }, audit: 'Put payout on hold', severity: 'warning' }),
    },
    transition<Payout>({ id: 'release', label: 'Release hold', to: 'pending_approval', from: ['on_hold'], audit: 'Released payout hold', icon: PlayCircle, extra: () => ({ holdReason: undefined }) }),
    transition<Payout>({ id: 'retry', label: 'Retry transfer', to: 'processing', from: ['failed'], audit: 'Retried failed payout', tone: 'primary', icon: RefreshCw, bulk: true, confirm: { title: 'Retry this transfer?', description: 'Make sure the bank details were corrected first.' } }),
  ],
}

/* ───────── Invoices ───────── */

const INVOICE_STATUS: Record<Invoice['status'], StatusDef> = {
  draft: s('Draft', 'default'),
  issued: s('Issued', 'info'),
  paid: s('Paid', 'success'),
  overdue: s('Overdue', 'error'),
  void: s('Void', 'default'),
}

export const invoicesResource: ResourceConfig<Invoice> = {
  collection: 'invoices',
  module: 'finance',
  entity: 'Invoice',
  entityPlural: 'Invoices',
  title: (i) => `${i.invoiceType} invoice · ${i.billedTo}`,
  subtitle: (i) => `${formatInr(i.total)} incl. GST`,
  searchText: (i) => `${i.billedTo} ${i.invoiceType}`,
  status: { value: (i) => i.status, map: INVOICE_STATUS },
  defaultSort: { key: 'issued', dir: 'desc' },
  columns: [
    { key: 'id', header: 'Invoice', kind: 'mono', value: (i) => i.id },
    { key: 'to', header: 'Billed to', kind: 'person', value: (i) => i.billedTo, href: (i) => `/users/${i.billedToId}` },
    { key: 'type', header: 'Type', value: (i) => i.invoiceType, hideBelow: 'md' },
    { key: 'amount', header: 'Taxable', kind: 'money', value: (i) => i.amount, align: 'right', hideBelow: 'lg' },
    { key: 'gst', header: 'GST 18%', kind: 'money', value: (i) => i.gst, align: 'right', hideBelow: 'xl' },
    { key: 'total', header: 'Total', kind: 'money', value: (i) => i.total, align: 'right' },
    { key: 'issued', header: 'Issued', kind: 'date', value: (i) => i.issuedAt, hideBelow: 'lg' },
    { key: 'due', header: 'Due', value: (i) => (i.status === 'paid' || i.status === 'void' ? '—' : relativeDue(i.dueAt).label) },
    { key: 'status', header: 'Status', kind: 'status', value: (i) => i.status },
  ],
  filters: [optionsFilter('type', 'Type', ['Commission', 'Subscription', 'Service fee', 'Logistics', 'Advertising'], (i) => i.invoiceType)],
  kpis: (rows) => [
    { label: 'Invoiced (90d)', value: formatInrCompact(sum(rows.filter((i) => i.status !== 'void' && i.status !== 'draft'), (i) => i.total)), icon: Receipt, highlight: true },
    { label: 'Outstanding', value: formatInrCompact(sum(rows.filter((i) => i.status === 'issued' || i.status === 'overdue'), (i) => i.total)), icon: Clock3 },
    { label: 'Overdue', value: count(rows, (i) => i.status === 'overdue'), hint: formatInrCompact(sum(rows.filter((i) => i.status === 'overdue'), (i) => i.total)), hintTone: 'error', icon: AlertTriangle },
    { label: 'GST collected', value: formatInrCompact(sum(rows.filter((i) => i.status === 'paid'), (i) => i.gst)), icon: Landmark },
  ],
  detail: [
    {
      title: 'Invoice',
      fields: [
        { label: 'Type', value: (i) => i.invoiceType },
        { label: 'Billed to', value: (i) => i.billedTo, href: (i) => `/users/${i.billedToId}` },
        { label: 'Taxable amount', kind: 'money', value: (i) => i.amount },
        { label: 'GST (18%)', kind: 'money', value: (i) => i.gst },
        { label: 'Total', kind: 'money', value: (i) => i.total },
        { label: 'Issued', kind: 'date', value: (i) => i.issuedAt },
        { label: 'Due', kind: 'date', value: (i) => i.dueAt },
      ],
    },
  ],
  actions: [
    transition<Invoice>({ id: 'issue', label: 'Issue invoice', to: 'issued', from: ['draft'], audit: 'Issued invoice (IRN generated)', tone: 'primary', icon: Send, bulk: true }),
    transition<Invoice>({ id: 'remind', label: 'Send reminder', to: 'overdue', from: ['overdue'], audit: 'Sent payment reminder', icon: Send, bulk: true }),
    transition<Invoice>({ id: 'paid', label: 'Record payment', to: 'paid', from: ['issued', 'overdue'], audit: 'Recorded offline payment', icon: CheckCircle2, confirm: { title: 'Record payment received?', reasonRequired: true, reasonLabel: 'Payment reference (UTR / cheque no.)' } }),
    transition<Invoice>({ id: 'void', label: 'Void', to: 'void', from: ['draft', 'issued', 'overdue'], audit: 'Voided invoice (credit note raised)', icon: FileX2, tone: 'danger', confirm: { title: 'Void this invoice?', description: 'A credit note is generated for GST compliance.', destructive: true, reasonRequired: true } }),
  ],
}

/* ───────── Financial disputes ───────── */

const FDISPUTE_STATUS: Record<FinancialDispute['status'], StatusDef> = {
  open: s('Open', 'error'),
  evidence_submitted: s('Evidence submitted', 'pending'),
  won: s('Won', 'success'),
  lost: s('Lost', 'default'),
  accepted: s('Accepted', 'info'),
}

export const financialDisputesResource: ResourceConfig<FinancialDispute> = {
  collection: 'financialDisputes',
  module: 'finance',
  entity: 'Financial dispute',
  entityPlural: 'Financial disputes',
  title: (d) => `${d.disputeType} · ${formatInr(d.amount)}`,
  subtitle: (d) => `${d.customerName} · ${d.gateway}`,
  searchText: (d) => `${d.customerName} ${d.paymentId} ${d.disputeType}`,
  status: { value: (d) => d.status, map: FDISPUTE_STATUS },
  defaultSort: { key: 'respond', dir: 'asc' },
  columns: [
    { key: 'id', header: 'Case', kind: 'mono', value: (d) => d.id, sub: (d) => d.paymentId },
    { key: 'type', header: 'Type', kind: 'strong', value: (d) => d.disputeType, sub: (d) => d.gateway },
    { key: 'customer', header: 'Customer', value: (d) => d.customerName, hideBelow: 'md' },
    { key: 'amount', header: 'Amount', kind: 'money', value: (d) => d.amount, align: 'right' },
    { key: 'evidence', header: 'Evidence', value: (d) => `${d.evidence} files`, hideBelow: 'lg' },
    { key: 'respond', header: 'Respond by', value: (d) => (d.status === 'open' ? relativeDue(d.respondBy).label : '—') },
    { key: 'status', header: 'Status', kind: 'status', value: (d) => d.status },
  ],
  filters: [optionsFilter('type', 'Type', ['Chargeback', 'Duplicate charge', 'Payment not received', 'Settlement shortfall', 'Payout failed'], (d) => d.disputeType)],
  kpis: (rows) => [
    { label: 'Open cases', value: count(rows, (d) => d.status === 'open'), hint: 'Respond before deadline', hintTone: 'error', icon: Scale, highlight: true },
    { label: 'Amount at risk', value: formatInrCompact(sum(rows.filter((d) => d.status === 'open' || d.status === 'evidence_submitted'), (d) => d.amount)), icon: IndianRupee },
    { label: 'Win rate', value: `${pct(count(rows, (d) => d.status === 'won'), count(rows, (d) => d.status === 'won' || d.status === 'lost'))}%`, icon: Gavel },
    { label: 'Chargebacks', value: count(rows, (d) => d.disputeType === 'Chargeback'), icon: CreditCard },
  ],
  detail: [
    {
      title: 'Case',
      fields: [
        { label: 'Type', value: (d) => d.disputeType },
        { label: 'Amount', kind: 'money', value: (d) => d.amount },
        { label: 'Gateway', value: (d) => d.gateway },
        { label: 'Payment', kind: 'mono', value: (d) => d.paymentId, href: (d) => `/finance/payments?id=${d.paymentId}` },
        { label: 'Raised', kind: 'datetime', value: (d) => d.raisedAt },
        { label: 'Respond by', kind: 'datetime', value: (d) => d.respondBy },
        { label: 'Evidence files', kind: 'number', value: (d) => d.evidence },
      ],
    },
  ],
  related: (d) => [{ label: 'Order disputes', href: '/disputes' }, { label: 'Payment', href: `/finance/payments?id=${d.paymentId}` }],
  actions: [
    {
      id: 'evidence',
      label: 'Submit evidence',
      icon: Upload,
      tone: 'primary',
      when: (d) => d.status === 'open',
      confirm: { title: 'Submit evidence to the gateway', description: 'Attaches invoice, POD photo and chat log automatically.', reasonRequired: true, reasonLabel: 'Response summary', confirmLabel: 'Submit' },
      run: (d) => ({ patch: { status: 'evidence_submitted', evidence: d.evidence + 3 }, audit: 'Submitted evidence to gateway' }),
    },
    transition<FinancialDispute>({ id: 'accept', label: 'Accept liability', to: 'accepted', from: ['open'], audit: 'Accepted dispute liability', icon: CheckCircle2, tone: 'danger', confirm: { title: 'Accept liability?', description: 'The amount is debited from the next settlement.', destructive: true, reasonRequired: true } }),
    transition<FinancialDispute>({ id: 'won', label: 'Mark won', to: 'won', from: ['evidence_submitted'], audit: 'Marked dispute won', icon: Gavel }),
    transition<FinancialDispute>({ id: 'lost', label: 'Mark lost', to: 'lost', from: ['evidence_submitted'], audit: 'Marked dispute lost', icon: Ban, tone: 'danger', confirm: { title: 'Mark as lost?', destructive: true, reasonRequired: true } }),
  ],
}
