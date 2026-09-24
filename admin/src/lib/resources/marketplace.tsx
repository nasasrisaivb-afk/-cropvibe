import {
  AlertTriangle,
  Ban,
  Boxes,
  CheckCircle2,
  Eye,
  EyeOff,
  FolderTree,
  IndianRupee,
  MessageSquareWarning,
  Package,
  PackageCheck,
  Percent,
  ShieldAlert,
  ShoppingCart,
  Star,
  Store,
  Truck,
  XCircle,
} from 'lucide-react'
import type { Category, ListingApproval, Order, Product, SellerProfile } from '@/lib/types/ops'
import type { ResourceConfig, StatusDef } from './types'
import {
  approve,
  avg,
  block,
  count,
  optionsFilter,
  pct,
  reactivate,
  reject,
  s,
  stateFilter,
  sum,
  transition,
} from './helpers'
import { formatInrCompact } from '@/lib/utils'

const CATEGORY_NAMES = [
  'Grains & Cereals', 'Pulses', 'Vegetables', 'Fruits', 'Spices', 'Seeds',
  'Fertilizers', 'Crop Protection', 'Irrigation', 'Tools & Equipment', 'Dairy & Livestock',
]

/* ───────── Products ───────── */

const PRODUCT_STATUS: Record<Product['status'], StatusDef> = {
  active: s('Active', 'success'),
  out_of_stock: s('Out of stock', 'warning'),
  draft: s('Draft', 'default'),
  blocked: s('Blocked', 'error'),
}

export const productsResource: ResourceConfig<Product> = {
  collection: 'products',
  module: 'marketplace',
  entity: 'Product',
  entityPlural: 'Products',
  title: (p) => p.name,
  subtitle: (p) => `${p.sku} · ${p.category} › ${p.subCategory}`,
  searchText: (p) => `${p.name} ${p.sku} ${p.sellerName} ${p.category}`,
  searchPlaceholder: 'Search product, SKU or seller…',
  status: { value: (p) => p.status, map: PRODUCT_STATUS },
  columns: [
    { key: 'name', header: 'Product', kind: 'strong', value: (p) => p.name, sub: (p) => p.sku },
    { key: 'category', header: 'Category', value: (p) => p.category, sub: (p) => p.subCategory, hideBelow: 'md' },
    { key: 'seller', header: 'Seller', value: (p) => p.sellerName, href: (p) => `/users/${p.sellerId}`, hideBelow: 'lg' },
    { key: 'price', header: 'Price', kind: 'money', value: (p) => p.price, sub: (p) => `per ${p.unit}`, align: 'right' },
    { key: 'stock', header: 'Stock', kind: 'number', value: (p) => p.stock, align: 'right' },
    { key: 'orders', header: 'Orders (30d)', kind: 'number', value: (p) => p.orders30d, align: 'right', hideBelow: 'xl' },
    { key: 'rating', header: 'Rating', kind: 'rating', value: (p) => p.rating, hideBelow: 'lg' },
    { key: 'status', header: 'Status', kind: 'status', value: (p) => p.status },
  ],
  filters: [optionsFilter('category', 'Category', CATEGORY_NAMES, (p) => p.category), stateFilter((p) => p.state)],
  kpis: (rows) => [
    { label: 'Catalogue SKUs', value: rows.length, icon: Package, highlight: true },
    { label: 'Active', value: count(rows, (p) => p.status === 'active'), hint: `${pct(count(rows, (p) => p.status === 'active'), rows.length)}% of catalogue`, icon: CheckCircle2 },
    { label: 'Out of stock', value: count(rows, (p) => p.status === 'out_of_stock'), hint: 'Sellers nudged daily', hintTone: 'warning', icon: Boxes },
    { label: 'Avg rating', value: avg(rows, (p) => p.rating).toFixed(2), icon: Star },
  ],
  detail: [
    {
      title: 'Product',
      fields: [
        { label: 'SKU', kind: 'mono', value: (p) => p.sku },
        { label: 'Category', value: (p) => `${p.category} › ${p.subCategory}` },
        { label: 'Price', kind: 'money', value: (p) => p.price },
        { label: 'MRP', kind: 'money', value: (p) => p.mrp },
        { label: 'Unit', value: (p) => p.unit },
        { label: 'Stock', kind: 'number', value: (p) => p.stock },
      ],
    },
    {
      title: 'Performance',
      fields: [
        { label: 'Seller', value: (p) => p.sellerName, href: (p) => `/users/${p.sellerId}` },
        { label: 'Orders (30 days)', kind: 'number', value: (p) => p.orders30d },
        { label: 'Rating', kind: 'rating', value: (p) => p.rating },
        { label: 'Listed', kind: 'date', value: (p) => p.createdAt },
      ],
    },
  ],
  related: (p) => [
    { label: 'Seller profile', href: `/users/${p.sellerId}` },
    { label: 'Category rules', href: '/marketplace/categories' },
  ],
  actions: [
    block<Product>(['active', 'out_of_stock', 'draft'], 'blocked', 'product', [
      'Counterfeit or fake product',
      'Restricted item without licence',
      'Misleading claims',
      'Price gouging',
    ]),
    reactivate<Product>(['blocked'], 'active', 'product'),
  ],
}

/* ───────── Categories ───────── */

const CATEGORY_STATUS: Record<Category['status'], StatusDef> = {
  active: s('Visible', 'success'),
  hidden: s('Hidden', 'default'),
}

export const categoriesResource: ResourceConfig<Category> = {
  collection: 'categories',
  module: 'marketplace',
  entity: 'Category',
  entityPlural: 'Categories',
  title: (c) => (c.parent ? `${c.parent} › ${c.name}` : c.name),
  subtitle: (c) => `/${c.slug}`,
  searchText: (c) => `${c.name} ${c.parent ?? ''} ${c.slug}`,
  status: { value: (c) => c.status, map: CATEGORY_STATUS },
  tabs: [
    { value: 'all', label: 'All' },
    { value: 'top', label: 'Top level', match: (c) => c.parent === null },
    { value: 'sub', label: 'Sub-categories', match: (c) => c.parent !== null },
    { value: 'approval', label: 'Needs approval', match: (c) => c.requiresApproval },
    { value: 'hidden', label: 'Hidden', match: (c) => c.status === 'hidden' },
  ],
  columns: [
    {
      key: 'name',
      header: 'Category',
      kind: 'strong',
      value: (c) => (c.parent ? `↳ ${c.name}` : c.name),
      sub: (c) => c.parent ?? 'Top level',
    },
    { key: 'commission', header: 'Commission', kind: 'percent', value: (c) => c.commission, align: 'right' },
    { key: 'listings', header: 'Listings', kind: 'number', value: (c) => c.listings, align: 'right' },
    { key: 'gmv', header: 'GMV (30d)', kind: 'money', value: (c) => c.gmv30d, align: 'right', hideBelow: 'md' },
    { key: 'approval', header: 'Manual approval', kind: 'boolean', value: (c) => c.requiresApproval, hideBelow: 'lg' },
    { key: 'attributes', header: 'Required attributes', kind: 'tags', value: (c) => c.attributes, hideBelow: 'xl' },
    { key: 'status', header: 'Visibility', kind: 'status', value: (c) => c.status },
  ],
  kpis: (rows) => [
    { label: 'Top-level categories', value: count(rows, (c) => c.parent === null), icon: FolderTree, highlight: true },
    { label: 'Sub-categories', value: count(rows, (c) => c.parent !== null), icon: FolderTree },
    { label: 'Avg commission', value: `${avg(rows.filter((c) => !c.parent), (c) => c.commission).toFixed(1)}%`, icon: Percent },
    { label: 'Require approval', value: count(rows, (c) => c.requiresApproval), hint: 'Regulated goods', icon: ShieldAlert },
  ],
  detail: [
    {
      title: 'Rules',
      fields: [
        { label: 'Commission', kind: 'percent', value: (c) => c.commission },
        { label: 'Manual listing approval', kind: 'boolean', value: (c) => c.requiresApproval },
        { label: 'Required attributes', kind: 'tags', value: (c) => c.attributes, span: 2 },
      ],
    },
    {
      title: 'Performance',
      fields: [
        { label: 'Listings', kind: 'number', value: (c) => c.listings },
        { label: 'GMV (30 days)', kind: 'money', value: (c) => c.gmv30d },
        { label: 'Last updated', kind: 'relative', value: (c) => c.updatedAt },
      ],
    },
  ],
  actions: [
    {
      id: 'commission',
      label: 'Change commission',
      icon: Percent,
      tone: 'primary',
      confirm: {
        title: (c) => `Change commission for ${c.name}`,
        description: 'Applies to new orders only. Existing orders keep the rate they were placed at.',
        choice: {
          label: 'New commission',
          options: ['2', '2.5', '3', '3.5', '4', '5', '6', '7', '8'].map((v) => ({ value: v, label: `${v}%` })),
        },
        reasonRequired: true,
        reasonLabel: 'Reason for change',
        confirmLabel: 'Update commission',
      },
      run: (c, input) => ({
        patch: { commission: Number(input.choice), updatedAt: new Date().toISOString() },
        audit: `Changed commission ${c.commission}% → ${input.choice}%`,
        severity: 'critical',
      }),
    },
    {
      id: 'toggle-approval',
      label: 'Toggle manual approval',
      icon: ShieldAlert,
      confirm: {
        title: (c) => (c.requiresApproval ? `Turn off manual approval for ${c.name}?` : `Require manual approval for ${c.name}?`),
        description: (c) =>
          c.requiresApproval
            ? 'New listings go live immediately after automated checks.'
            : 'New and edited listings wait in Listing approvals.',
      },
      run: (c) => ({
        patch: { requiresApproval: !c.requiresApproval, updatedAt: new Date().toISOString() },
        audit: c.requiresApproval ? 'Disabled manual approval' : 'Enabled manual approval',
      }),
    },
    transition<Category>({ id: 'hide', label: 'Hide', to: 'hidden', from: ['active'], audit: 'Hid category', icon: EyeOff, tone: 'danger', confirm: { title: (c) => `Hide ${c.name}?`, description: 'Listings in this category stop appearing in search and browse.', destructive: true, reasonRequired: true } }),
    transition<Category>({ id: 'show', label: 'Make visible', to: 'active', from: ['hidden'], audit: 'Made category visible', icon: Eye, tone: 'primary' }),
  ],
  create: {
    label: 'Add category',
    idPrefix: 'CAT-',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g. Millets' },
      { name: 'parent', label: 'Parent', type: 'select', options: [{ value: '', label: 'None (top level)' }, ...CATEGORY_NAMES.map((c) => ({ value: c, label: c }))] },
      { name: 'commission', label: 'Commission %', type: 'number', required: true, defaultValue: 3, min: 0 },
      { name: 'approval', label: 'Manual approval', type: 'select', options: [{ value: 'no', label: 'Not required' }, { value: 'yes', label: 'Required' }] },
    ],
    build: (v, id) => ({
      id,
      name: v.name!,
      parent: v.parent || null,
      slug: v.name!.toLowerCase().replace(/[^a-z]+/g, '-'),
      commission: Number(v.commission),
      listings: 0,
      gmv30d: 0,
      requiresApproval: v.approval === 'yes',
      status: 'active',
      attributes: [],
      updatedAt: new Date().toISOString(),
    }),
  },
}

/* ───────── Listing approvals ───────── */

const APPROVAL_STATUS: Record<ListingApproval['status'], StatusDef> = {
  pending: s('Pending review', 'pending'),
  changes_requested: s('Changes requested', 'info'),
  approved: s('Approved', 'success'),
  rejected: s('Rejected', 'error'),
}

const RISK: Record<ListingApproval['risk'], StatusDef> = {
  low: s('Low risk', 'success'),
  medium: s('Medium risk', 'warning'),
  high: s('High risk', 'error'),
}

export const listingApprovalsResource: ResourceConfig<ListingApproval> = {
  collection: 'listingApprovals',
  module: 'marketplace',
  entity: 'Listing submission',
  entityPlural: 'Submissions',
  title: (l) => l.listingTitle,
  subtitle: (l) => `${l.sellerName} · ${l.category}`,
  searchText: (l) => `${l.listingTitle} ${l.sellerName} ${l.category}`,
  status: { value: (l) => l.status, map: APPROVAL_STATUS },
  tabs: [
    { value: 'pending', label: 'Pending review', match: (l) => l.status === 'pending' },
    { value: 'high', label: 'High risk', match: (l) => l.status === 'pending' && l.risk === 'high' },
    { value: 'changes_requested', label: 'Changes requested', match: (l) => l.status === 'changes_requested' },
    { value: 'approved', label: 'Approved', match: (l) => l.status === 'approved' },
    { value: 'rejected', label: 'Rejected', match: (l) => l.status === 'rejected' },
    { value: 'all', label: 'All' },
  ],
  defaultSort: { key: 'submitted', dir: 'asc' },
  columns: [
    { key: 'listing', header: 'Listing', kind: 'strong', value: (l) => l.listingTitle, sub: (l) => `${l.category} · ${l.images} photos` },
    { key: 'type', header: 'Submission', kind: 'status', value: (l) => l.submission, statusMap: { new: s('New', 'accent'), edit: s('Edit', 'default'), price_change: s('Price change', 'info'), relist: s('Relist', 'default') } },
    { key: 'seller', header: 'Seller', value: (l) => l.sellerName, href: (l) => `/users/${l.sellerId}`, hideBelow: 'md' },
    { key: 'price', header: 'Price', kind: 'money', value: (l) => l.price, sub: (l) => `per ${l.unit}`, align: 'right' },
    { key: 'risk', header: 'Risk', kind: 'status', value: (l) => l.risk, statusMap: RISK },
    { key: 'submitted', header: 'Waiting', kind: 'relative', value: (l) => l.submittedAt },
    { key: 'status', header: 'Status', kind: 'status', value: (l) => l.status, hideBelow: 'lg' },
  ],
  filters: [
    optionsFilter('category', 'Category', CATEGORY_NAMES, (l) => l.category),
    { key: 'risk', label: 'Risk', options: [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }], match: (l, v) => l.risk === v },
  ],
  kpis: (rows) => {
    const pending = rows.filter((l) => l.status === 'pending')
    const overdue = count(pending, (l) => Date.now() - new Date(l.submittedAt).getTime() > 24 * 3600000)
    return [
      { label: 'Waiting for review', value: pending.length, icon: PackageCheck, highlight: true },
      { label: 'Over 24h SLA', value: overdue, hint: overdue ? 'Oldest first below' : 'On track', hintTone: overdue ? 'error' : 'success', icon: AlertTriangle },
      { label: 'High risk in queue', value: count(pending, (l) => l.risk === 'high'), icon: ShieldAlert },
      { label: 'Approval rate', value: `${pct(count(rows, (l) => l.status === 'approved'), count(rows, (l) => l.status === 'approved' || l.status === 'rejected'))}%`, icon: CheckCircle2 },
    ]
  },
  drawerHero: (l) =>
    l.riskSignals.length ? (
      <div className="rounded-xl border border-status-warning/30 bg-status-warning/10 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-status-warning">
          <AlertTriangle className="h-4 w-4" aria-hidden /> Automated checks flagged {l.riskSignals.length} signal
          {l.riskSignals.length > 1 ? 's' : ''}
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-text-primary">
          {l.riskSignals.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    ) : (
      <div className="rounded-xl border border-status-success/30 bg-status-success/10 p-4 text-sm text-status-success">
        All automated checks passed.
      </div>
    ),
  detail: [
    {
      title: 'Submission',
      fields: [
        { label: 'Category', value: (l) => l.category },
        { label: 'Price', kind: 'money', value: (l) => l.price },
        { label: 'Unit', value: (l) => l.unit },
        { label: 'Photos', kind: 'number', value: (l) => l.images },
        { label: 'Risk', kind: 'status', value: (l) => l.risk, statusMap: RISK },
        { label: 'Submitted', kind: 'datetime', value: (l) => l.submittedAt },
      ],
    },
    {
      title: 'Seller',
      fields: [
        { label: 'Seller', value: (l) => l.sellerName, href: (l) => `/users/${l.sellerId}` },
        { label: 'State', value: (l) => l.state },
      ],
    },
  ],
  actions: [
    approve<ListingApproval>(['pending', 'changes_requested'], 'approved', 'listing', { label: 'Approve & publish' }),
    {
      id: 'changes',
      label: 'Request changes',
      icon: MessageSquareWarning,
      when: (l) => l.status === 'pending',
      confirm: {
        title: 'Request changes from the seller',
        description: 'The listing stays hidden until the seller resubmits.',
        reasonRequired: true,
        reasonLabel: 'What needs to change',
        reasonOptions: ['Add clear product photos', 'Correct the category', 'Remove phone number from description', 'Upload licence / certificate', 'Price looks incorrect'],
        confirmLabel: 'Send to seller',
      },
      run: () => ({ patch: { status: 'changes_requested' }, audit: 'Requested changes' }),
    },
    reject<ListingApproval>(['pending', 'changes_requested'], 'rejected', 'listing', ['Prohibited or restricted item', 'Counterfeit / fake brand', 'Duplicate listing', 'Misleading price or claims'], { bulk: true }),
  ],
}

/* ───────── Orders ───────── */

const ORDER_STATUS: Record<Order['status'], StatusDef> = {
  placed: s('Placed', 'pending'),
  confirmed: s('Confirmed', 'info'),
  packed: s('Packed', 'info'),
  shipped: s('Shipped', 'accent'),
  delivered: s('Delivered', 'success'),
  cancelled: s('Cancelled', 'default'),
  returned: s('Returned', 'error'),
}

const PAYMENT_STATUS: Record<Order['paymentStatus'], StatusDef> = {
  paid: s('Paid', 'success'),
  pending: s('Pending', 'pending'),
  cod: s('COD', 'default'),
  refunded: s('Refunded', 'info'),
  failed: s('Failed', 'error'),
}

export const ordersResource: ResourceConfig<Order> = {
  collection: 'orders',
  module: 'marketplace',
  entity: 'Order',
  entityPlural: 'Orders',
  title: (o) => o.itemSummary,
  subtitle: (o) => `${o.buyerName} ← ${o.sellerName}`,
  searchText: (o) => `${o.buyerName} ${o.sellerName} ${o.itemSummary} ${o.district}`,
  searchPlaceholder: 'Search order ID, buyer, seller or item…',
  status: { value: (o) => o.status, map: ORDER_STATUS },
  defaultSort: { key: 'placed', dir: 'desc' },
  columns: [
    { key: 'id', header: 'Order', kind: 'mono', value: (o) => o.id },
    { key: 'items', header: 'Items', kind: 'strong', value: (o) => o.itemSummary, sub: (o) => `${o.items} line item${o.items > 1 ? 's' : ''}` },
    { key: 'buyer', header: 'Buyer', value: (o) => o.buyerName, sub: (o) => o.district, href: (o) => `/users/${o.buyerId}`, hideBelow: 'md' },
    { key: 'seller', header: 'Seller', value: (o) => o.sellerName, href: (o) => `/users/${o.sellerId}`, hideBelow: 'xl' },
    { key: 'amount', header: 'Amount', kind: 'money', value: (o) => o.amount, sub: (o) => o.paymentMethod, align: 'right' },
    { key: 'payment', header: 'Payment', kind: 'status', value: (o) => o.paymentStatus, statusMap: PAYMENT_STATUS, hideBelow: 'lg' },
    { key: 'status', header: 'Status', kind: 'status', value: (o) => o.status },
    { key: 'placed', header: 'Placed', kind: 'relative', value: (o) => o.placedAt },
  ],
  filters: [
    { key: 'payment', label: 'Payment', options: Object.entries(PAYMENT_STATUS).map(([value, d]) => ({ value, label: d.label })), match: (o, v) => o.paymentStatus === v },
    optionsFilter('method', 'Method', ['UPI', 'Card', 'Net banking', 'COD', 'Wallet'], (o) => o.paymentMethod),
    stateFilter((o) => o.state),
  ],
  kpis: (rows) => {
    const live = rows.filter((o) => o.status !== 'cancelled' && o.status !== 'returned')
    return [
      { label: 'GMV (30 days)', value: formatInrCompact(sum(live, (o) => o.amount)), trend: 9.4, icon: IndianRupee, highlight: true },
      { label: 'Orders', value: rows.length, hint: `${count(rows, (o) => o.status === 'placed')} awaiting confirmation`, hintTone: 'warning', icon: ShoppingCart },
      { label: 'In transit', value: count(rows, (o) => o.status === 'shipped' || o.status === 'packed'), icon: Truck },
      { label: 'Cancellation rate', value: `${pct(count(rows, (o) => o.status === 'cancelled' || o.status === 'returned'), rows.length)}%`, trend: -1.2, icon: XCircle },
    ]
  },
  detail: [
    {
      title: 'Order',
      fields: [
        { label: 'Items', value: (o) => o.itemSummary, span: 2 },
        { label: 'Amount', kind: 'money', value: (o) => o.amount },
        { label: 'Payment', kind: 'status', value: (o) => o.paymentStatus, statusMap: PAYMENT_STATUS },
        { label: 'Method', value: (o) => o.paymentMethod },
        { label: 'Placed', kind: 'datetime', value: (o) => o.placedAt },
        { label: 'Expected delivery', kind: 'date', value: (o) => o.eta },
      ],
    },
    {
      title: 'Parties',
      fields: [
        { label: 'Buyer', value: (o) => o.buyerName, href: (o) => `/users/${o.buyerId}` },
        { label: 'Seller', value: (o) => o.sellerName, href: (o) => `/users/${o.sellerId}` },
        { label: 'Delivery to', value: (o) => `${o.district}, ${o.state}` },
      ],
    },
  ],
  related: (o) => [
    { label: 'Delivery tracking', href: `/operations/deliveries?q=${o.id}` },
    { label: 'Payment', href: `/finance/payments?q=${o.id}` },
    { label: 'Raise dispute', href: '/disputes' },
  ],
  actions: [
    transition<Order>({ id: 'confirm', label: 'Confirm on seller’s behalf', to: 'confirmed', from: ['placed'], audit: 'Confirmed order for seller', tone: 'primary', icon: CheckCircle2, bulk: true, confirm: { title: 'Confirm this order for the seller?', description: 'Use when the seller confirmed by phone but not in the app.', reasonRequired: true, reasonLabel: 'How did the seller confirm?' } }),
    {
      id: 'cancel',
      label: 'Cancel order',
      icon: Ban,
      tone: 'danger',
      when: (o) => ['placed', 'confirmed', 'packed'].includes(o.status),
      confirm: {
        title: (o) => `Cancel ${o.id}?`,
        description: 'Prepaid amounts are refunded to the original payment method automatically.',
        destructive: true,
        reasonRequired: true,
        reasonOptions: ['Seller cannot fulfil', 'Buyer requested', 'Suspected fraud', 'Item out of stock', 'Delivery not serviceable'],
        confirmLabel: 'Cancel order',
      },
      run: (o) => ({
        patch: { status: 'cancelled', paymentStatus: o.paymentStatus === 'paid' ? 'refunded' : o.paymentStatus },
        audit: 'Cancelled order',
        severity: 'warning',
      }),
    },
    transition<Order>({ id: 'delivered', label: 'Mark delivered', to: 'delivered', from: ['shipped'], audit: 'Marked delivered (manual POD)', icon: PackageCheck, confirm: { title: 'Mark as delivered?', description: 'Only use with proof of delivery from the carrier or buyer.', reasonRequired: true, reasonLabel: 'Proof of delivery reference' } }),
  ],
}

/* ───────── Sellers ───────── */

const SELLER_STATUS: Record<SellerProfile['status'], StatusDef> = {
  active: s('Active', 'success'),
  watchlist: s('Watchlist', 'warning'),
  onboarding: s('Onboarding', 'info'),
  suspended: s('Suspended', 'error'),
}

const TIER: Record<SellerProfile['tier'], StatusDef> = {
  gold: s('Gold', 'accent'),
  silver: s('Silver', 'default'),
  bronze: s('Bronze', 'default'),
  new: s('New', 'info'),
}

export const sellersResource: ResourceConfig<SellerProfile> = {
  collection: 'sellerProfiles',
  module: 'marketplace',
  entity: 'Seller',
  entityPlural: 'Sellers',
  title: (p) => p.storeName,
  subtitle: (p) => `${p.name} · ${p.state}`,
  searchText: (p) => `${p.storeName} ${p.name} ${p.state}`,
  status: { value: (p) => p.status, map: SELLER_STATUS },
  defaultSort: { key: 'gmv', dir: 'desc' },
  columns: [
    { key: 'store', header: 'Store', kind: 'person', value: (p) => p.storeName, sub: (p) => p.name },
    { key: 'tier', header: 'Tier', kind: 'status', value: (p) => p.tier, statusMap: TIER },
    { key: 'gmv', header: 'GMV (30d)', kind: 'money', value: (p) => p.gmv30d, align: 'right' },
    { key: 'orders', header: 'Orders', kind: 'number', value: (p) => p.orders30d, align: 'right', hideBelow: 'md' },
    { key: 'fulfilment', header: 'Fulfilment', kind: 'progress', value: (p) => p.fulfilmentRate, hideBelow: 'lg' },
    { key: 'cancel', header: 'Cancel rate', kind: 'percent', value: (p) => p.cancellationRate, align: 'right', hideBelow: 'lg' },
    { key: 'rating', header: 'Rating', kind: 'rating', value: (p) => p.rating },
    { key: 'status', header: 'Status', kind: 'status', value: (p) => p.status },
  ],
  filters: [
    { key: 'tier', label: 'Tier', options: Object.entries(TIER).map(([value, d]) => ({ value, label: d.label })), match: (p, v) => p.tier === v },
    stateFilter((p) => p.state),
  ],
  kpis: (rows) => [
    { label: 'Sellers', value: rows.length, icon: Store, highlight: true },
    { label: 'Seller GMV (30d)', value: formatInrCompact(sum(rows, (p) => p.gmv30d)), trend: 6.1, icon: IndianRupee },
    { label: 'Avg fulfilment', value: `${avg(rows, (p) => p.fulfilmentRate).toFixed(1)}%`, icon: PackageCheck },
    { label: 'On watchlist', value: count(rows, (p) => p.status === 'watchlist'), hint: 'Cancel rate above 8%', hintTone: 'warning', icon: AlertTriangle },
  ],
  detail: [
    {
      title: 'Performance (30 days)',
      fields: [
        { label: 'GMV', kind: 'money', value: (p) => p.gmv30d },
        { label: 'Orders', kind: 'number', value: (p) => p.orders30d },
        { label: 'Fulfilment rate', kind: 'progress', value: (p) => p.fulfilmentRate },
        { label: 'Cancellation rate', kind: 'percent', value: (p) => p.cancellationRate },
        { label: 'Rating', kind: 'rating', value: (p) => p.rating },
        { label: 'Active listings', kind: 'number', value: (p) => p.activeListings },
      ],
    },
    {
      title: 'Account',
      fields: [
        { label: 'Owner', value: (p) => p.name, href: (p) => `/users/${p.userId}` },
        { label: 'Tier', kind: 'status', value: (p) => p.tier, statusMap: TIER },
        { label: 'Joined', kind: 'date', value: (p) => p.joinedAt },
        { label: 'State', value: (p) => p.state },
      ],
    },
  ],
  related: (p) => [
    { label: 'User profile', href: `/users/${p.userId}` },
    { label: 'Their orders', href: `/marketplace/orders?q=${encodeURIComponent(p.name)}` },
    { label: 'Payouts', href: `/finance/payouts?q=${encodeURIComponent(p.name)}` },
  ],
  actions: [
    transition<SellerProfile>({ id: 'watch', label: 'Add to watchlist', to: 'watchlist', from: ['active', 'onboarding'], audit: 'Added seller to watchlist', icon: AlertTriangle, confirm: { title: 'Add to watchlist?', description: 'Their new listings go to manual approval and payouts need finance sign-off.', reasonRequired: true } }),
    transition<SellerProfile>({ id: 'clear', label: 'Remove from watchlist', to: 'active', from: ['watchlist'], audit: 'Removed seller from watchlist', icon: CheckCircle2, tone: 'primary' }),
    {
      id: 'tier',
      label: 'Change tier',
      icon: Star,
      confirm: {
        title: (p) => `Change tier for ${p.storeName}`,
        description: 'Tier controls commission discounts and search boost.',
        choice: { label: 'Tier', options: Object.entries(TIER).map(([value, d]) => ({ value, label: d.label })) },
      },
      run: (p, input) => ({ patch: { tier: input.choice as SellerProfile['tier'] }, audit: `Changed tier ${p.tier} → ${input.choice}` }),
    },
  ],
}
