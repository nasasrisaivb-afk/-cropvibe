import '@/lib/data/ops-seeds'
import { getCollection, recordAudit, auditLog, markChanged, type AuditLogEntry, type HistoryEntry } from '@/lib/data/store'
import type { PermissionModule } from '@/lib/types'
import { delay } from '@/lib/utils'

/**
 * Generic CRUD over the in-memory collections. Endpoints map 1:1 to the planned REST API:
 *   GET    /admin/:collection            → listRecords
 *   GET    /admin/:collection/:id        → getRecord
 *   PATCH  /admin/:collection/:id        → updateRecord (with audit reason)
 *   POST   /admin/:collection            → createRecord
 */

type Row = { id: string; history?: HistoryEntry[] }

export interface Actor {
  name: string
  role: string
}

export async function listRecords<T extends Row>(collection: string): Promise<T[]> {
  await delay(250 + Math.floor(Math.random() * 250))
  // Shallow copies so React Query sees new references after mutations
  return getCollection<T>(collection).map((r) => ({ ...r }))
}

export async function getRecord<T extends Row>(collection: string, id: string): Promise<T | null> {
  await delay(150)
  const row = getCollection<T>(collection).find((r) => r.id === id)
  return row ? { ...row } : null
}

export async function updateRecord<T extends Row>(
  collection: string,
  id: string,
  patch: Partial<T>,
  meta: {
    actor: Actor
    action: string
    note?: string
    module: PermissionModule
    entity: string
    href?: string
    severity?: AuditLogEntry['severity']
  }
): Promise<T> {
  await delay(350)
  const rows = getCollection<T>(collection)
  const row = rows.find((r) => r.id === id)
  if (!row) throw new Error('Record not found — it may have been removed by another admin.')
  const at = new Date().toISOString()
  Object.assign(row, patch)
  row.history = [{ at, actor: meta.actor.name, action: meta.action, note: meta.note }, ...(row.history ?? [])]
  markChanged(collection)
  recordAudit({
    actor: meta.actor.name,
    actorRole: meta.actor.role,
    module: meta.module,
    entity: meta.entity,
    entityId: id,
    action: meta.action,
    note: meta.note,
    href: meta.href,
    severity: meta.severity ?? 'info',
    at,
  })
  return { ...row }
}

export async function createRecord<T extends Row>(
  collection: string,
  row: T,
  meta: { actor: Actor; module: PermissionModule; entity: string; href?: string }
): Promise<T> {
  await delay(400)
  const rows = getCollection<T>(collection)
  if (rows.some((r) => r.id === row.id)) throw new Error('A record with this ID already exists.')
  const at = new Date().toISOString()
  row.history = [{ at, actor: meta.actor.name, action: 'Created' }]
  rows.unshift(row)
  markChanged(collection)
  recordAudit({
    actor: meta.actor.name,
    actorRole: meta.actor.role,
    module: meta.module,
    entity: meta.entity,
    entityId: row.id,
    action: `Created ${meta.entity.toLowerCase()}`,
    href: meta.href,
    severity: 'info',
    at,
  })
  return { ...row }
}

export function nextId(collection: string, prefix: string): string {
  const rows = getCollection<Row>(collection)
  const max = rows.reduce((m, r) => {
    const n = Number(r.id.replace(/\D/g, '').slice(-6))
    return Number.isFinite(n) && n > m ? n : m
  }, 0)
  return `${prefix}${max + 1}`
}

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  await delay(250)
  return [...auditLog]
}
