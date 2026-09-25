import type { PermissionModule } from '@/lib/types'

/**
 * In-memory store behind the typed mock API. Every mutation goes through
 * `recordAudit`, so the audit log and each record's timeline stay in sync — the same
 * contract the NestJS API will honour when the mock layer is swapped out.
 */

export interface HistoryEntry {
  at: string
  actor: string
  action: string
  note?: string
}

export interface AuditLogEntry {
  id: string
  at: string
  actor: string
  actorRole: string
  module: PermissionModule
  entity: string
  entityId: string
  action: string
  note?: string
  href?: string
  severity: 'info' | 'warning' | 'critical'
  ip: string
}

type Row = { id: string; history?: HistoryEntry[] }

const collections = new Map<string, Row[]>()

/* ── Browser persistence ────────────────────────────────────────────────────
 * The mock store lives in memory; a snapshot is kept in sessionStorage so a page
 * reload in the same tab keeps the admin's changes. "Reset demo data" clears it. */

const STORAGE_KEY = 'cv-admin-mock-v1'
type Snapshot = { collections: Record<string, Row[]>; audit: AuditLogEntry[] }

function readSnapshot(): Snapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Snapshot) : null
  } catch {
    return null
  }
}

const snapshot = readSnapshot()
let dirty: Set<string> | null = null

/** Collections that have been changed this session — only these are written to storage. */
const changed = new Set<string>(snapshot ? Object.keys(snapshot.collections) : [])

export function markChanged(key: string) {
  changed.add(key)
  schedulePersist()
}

function schedulePersist() {
  if (typeof window === 'undefined') return
  if (dirty) return
  dirty = new Set()
  window.setTimeout(() => {
    dirty = null
    try {
      const data: Snapshot = {
        collections: Object.fromEntries(Array.from(changed).map((k) => [k, collections.get(k) ?? []])),
        audit: auditLog.slice(0, 500),
      }
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Storage full or blocked (private mode) — the prototype keeps working in memory.
    }
  }, 250)
}

export function resetMockData() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function registerCollection<T extends Row>(key: string, rows: T[]): T[] {
  if (!collections.has(key)) {
    const saved = snapshot?.collections[key]
    if (saved) {
      // Merge into the existing objects so references held elsewhere stay valid
      const byId = new Map(rows.map((r) => [r.id, r]))
      const merged = saved.map((s) => {
        const existing = byId.get(s.id)
        return existing ? Object.assign(existing, s) : (s as T)
      })
      rows.splice(0, rows.length, ...(merged as T[]))
    }
    collections.set(key, rows)
  }
  return collections.get(key) as T[]
}

export function getCollection<T extends Row>(key: string): T[] {
  const rows = collections.get(key)
  if (!rows) throw new Error(`Unknown collection "${key}"`)
  return rows as T[]
}

export const auditLog: AuditLogEntry[] = []

/** The signed-in admin, registered by the console shell so any mutation can be attributed. */
let currentActor = { name: 'Admin', role: 'Admin' }
export function setCurrentActor(actor: { name: string; role: string }) {
  currentActor = actor
}
export function getCurrentActor() {
  return currentActor
}

/** Audit helper for APIs that don't receive the actor explicitly */
export function audit(
  module: AuditLogEntry['module'],
  entity: string,
  entityId: string,
  action: string,
  opts: { note?: string; href?: string; severity?: AuditLogEntry['severity']; collection?: string | string[] } = {}
) {
  ;[opts.collection ?? []].flat().forEach((c) => markChanged(c))
  return recordAudit({
    actor: currentActor.name,
    actorRole: currentActor.role,
    module,
    entity,
    entityId,
    action,
    severity: opts.severity ?? 'info',
    note: opts.note,
    href: opts.href,
  })
}

let auditSeq = 9000

export function recordAudit(entry: Omit<AuditLogEntry, 'id' | 'at' | 'ip'> & { at?: string; ip?: string }) {
  auditSeq += 1
  const full: AuditLogEntry = {
    id: `AUD-${auditSeq}`,
    at: entry.at ?? new Date().toISOString(),
    ip: entry.ip ?? '10.24.8.17',
    ...entry,
  }
  auditLog.unshift(full)
  schedulePersist()
  return full
}

/** Restore the audit log saved in this tab (called once the seed log is built). */
export function hydrateAuditLog() {
  if (snapshot?.audit?.length) auditLog.splice(0, auditLog.length, ...snapshot.audit)
}
