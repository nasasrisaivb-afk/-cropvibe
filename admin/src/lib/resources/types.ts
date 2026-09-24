import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { BadgeVariant } from '@/components/ui/badge'
import type { PermissionModule } from '@/lib/types'
import type { HistoryEntry } from '@/lib/data/store'

/**
 * A resource is one operational list in the console (orders, payouts, tickets…).
 * Each is described once as data + behaviour and rendered by <ResourcePage />, so every
 * module gets the same tabs → filters → table → drawer → confirmed action flow.
 */

export interface BaseRecord {
  id: string
  history?: HistoryEntry[]
}

export type CellKind =
  | 'text'
  | 'strong'
  | 'mono'
  | 'money'
  | 'number'
  | 'percent'
  | 'date'
  | 'datetime'
  | 'relative'
  | 'status'
  | 'person'
  | 'rating'
  | 'progress'
  /** Capacity meter — turns amber when nearly full (occupancy, utilisation of a limit) */
  | 'meter'
  | 'tags'
  | 'boolean'

export interface StatusDef {
  label: string
  tone: BadgeVariant
}

export interface ResourceColumn<T> {
  key: string
  header: string
  kind?: CellKind
  value: (row: T) => unknown
  /** Secondary line under the value (email, location…) */
  sub?: (row: T) => string | undefined
  align?: 'left' | 'right'
  /** Hide below this breakpoint to keep tables readable on small screens */
  hideBelow?: 'md' | 'lg' | 'xl'
  /** For kind=status */
  statusMap?: Record<string, StatusDef>
  /** Link target when the cell is clicked (e.g. a user profile) */
  href?: (row: T) => string | undefined
  sortable?: boolean
}

export interface ResourceTab<T> {
  value: string
  label: string
  match?: (row: T) => boolean
}

export interface ResourceFilter<T> {
  key: string
  label: string
  options: { value: string; label: string }[]
  match: (row: T, value: string) => boolean
}

export interface ResourceKpi {
  label: string
  value: string | number
  hint?: string
  hintTone?: 'default' | 'accent' | 'success' | 'warning' | 'error' | 'info'
  trend?: number
  icon?: LucideIcon
  highlight?: boolean
}

export interface ActionInput {
  reason?: string
  note?: string
  date?: string
  amount?: number
  choice?: string
}

export interface ActionResult<T> {
  patch: Partial<T>
  /** Past-tense description for the audit log and timeline, e.g. "Approved listing" */
  audit: string
  toast?: string
  severity?: 'info' | 'warning' | 'critical'
}

export interface ResourceAction<T> {
  id: string
  label: string
  icon?: LucideIcon
  tone?: 'primary' | 'secondary' | 'danger'
  when?: (row: T) => boolean
  permission?: 'create' | 'edit' | 'delete'
  /** Allow running on a multi-row selection */
  bulk?: boolean
  confirm?: {
    title: string | ((row: T) => string)
    description?: string | ((row: T) => string)
    confirmLabel?: string
    destructive?: boolean
    reasonRequired?: boolean
    reasonLabel?: string
    reasonOptions?: string[]
    /** Render the reason as a textarea (replies, summaries) */
    reasonMultiline?: boolean
    hideNote?: boolean
    noteLabel?: string
    notePlaceholder?: string
    /** e.g. suspension duration — Figma "Indefinite / Until date" */
    choice?: { label: string; options: { value: string; label: string }[]; defaultValue?: string }
    date?: { label: string; showWhenChoice?: string }
    amount?: { label: string; max?: (row: T) => number; defaultValue?: (row: T) => number }
  }
  run: (row: T, input: ActionInput) => ActionResult<T>
}

export interface DetailField<T> {
  label: string
  value: (row: T) => unknown
  kind?: CellKind
  statusMap?: Record<string, StatusDef>
  href?: (row: T) => string | undefined
  span?: 1 | 2
}

export interface DetailSection<T> {
  title: string
  fields: DetailField<T>[]
}

export interface CreateField {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea' | 'date'
  options?: { value: string; label: string }[]
  required?: boolean
  placeholder?: string
  defaultValue?: string | number
  min?: number
}

export interface ResourceConfig<T extends BaseRecord> {
  /** Collection key in the data store */
  collection: string
  module: PermissionModule
  entity: string
  entityPlural: string
  title: (row: T) => string
  subtitle?: (row: T) => string | undefined
  columns: ResourceColumn<T>[]
  status?: { value: (row: T) => string; map: Record<string, StatusDef> }
  /** Custom tabs; when omitted, tabs are generated from the status map */
  tabs?: ResourceTab<T>[]
  /** Restricts the collection before anything else (e.g. user segments) */
  scope?: (row: T) => boolean
  filters?: ResourceFilter<T>[]
  searchText: (row: T) => string
  searchPlaceholder?: string
  kpis?: (rows: T[]) => ResourceKpi[]
  detail: DetailSection<T>[]
  actions?: ResourceAction<T>[]
  /** Navigate to a full page instead of opening the drawer */
  detailHref?: (row: T) => string
  related?: (row: T) => { label: string; href: string }[]
  create?: {
    label: string
    description?: string
    fields: CreateField[]
    build: (values: Record<string, string>, id: string) => T
    idPrefix: string
  }
  /** Rendered at the top of the drawer, e.g. evidence thumbnails or a map */
  drawerHero?: (row: T) => ReactNode
  emptyTitle?: string
  emptyDescription?: string
  defaultSort?: { key: string; dir: 'asc' | 'desc' }
  exportName?: string
}
