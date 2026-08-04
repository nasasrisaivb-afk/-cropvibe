import { disputes, pushActivity } from '@/lib/data/seeds'
import type { Dispute, DisputeResolution, PaginatedResult } from '@/lib/types'
import { delay } from '@/lib/utils'

export interface DisputeFilters {
  status?: string
  page?: number
  limit?: number
  search?: string
}

export async function getDisputes(filters: DisputeFilters = {}): Promise<PaginatedResult<Dispute>> {
  await delay()
  let data = [...disputes]
  if (filters.status && filters.status !== 'all') {
    if (filters.status === '!resolved') {
      data = data.filter((d) => d.status !== 'resolved')
    } else {
      data = data.filter((d) => d.status === filters.status)
    }
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    data = data.filter(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        d.buyerName.toLowerCase().includes(q) ||
        d.sellerName.toLowerCase().includes(q) ||
        d.transactionId.toLowerCase().includes(q)
    )
  }
  data.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const page = filters.page ?? 1
  const limit = filters.limit ?? 50
  const start = (page - 1) * limit
  return { data: data.slice(start, start + limit), total: data.length, page, limit }
}

export async function getDisputeById(id: string): Promise<Dispute | null> {
  await delay(300)
  return disputes.find((d) => d.id === id) ?? null
}

export async function updateDisputeStatus(
  id: string,
  status: Dispute['status'],
  assignedTo?: string,
  assignedToName?: string
): Promise<Dispute> {
  await delay(400)
  const dispute = disputes.find((d) => d.id === id)
  if (!dispute) throw new Error('Dispute not found')
  dispute.status = status
  if (assignedTo) dispute.assignedTo = assignedTo
  if (assignedToName) dispute.assignedToName = assignedToName
  return dispute
}

export async function addDisputeNote(
  id: string,
  body: string,
  author: string,
  kind: 'internal' | 'external' = 'internal'
): Promise<Dispute> {
  await delay(400)
  const dispute = disputes.find((d) => d.id === id)
  if (!dispute) throw new Error('Dispute not found')
  dispute.messages = [
    ...dispute.messages,
    {
      id: `msg-${Date.now()}`,
      kind,
      author,
      role: 'Admin',
      body,
      createdAt: new Date().toISOString(),
    },
  ]
  dispute.latestNote = body
  return dispute
}

export async function resolveDispute(
  id: string,
  resolution: Omit<DisputeResolution, 'decidedAt'> & { status?: Dispute['status'] }
): Promise<Dispute> {
  await delay(600)
  const dispute = disputes.find((d) => d.id === id)
  if (!dispute) throw new Error('Dispute not found')
  dispute.resolution = {
    type: resolution.type,
    amount: resolution.amount,
    notes: resolution.notes,
    internalNotes: resolution.internalNotes,
    decidedBy: resolution.decidedBy,
    decidedAt: new Date().toISOString(),
  }
  dispute.status = resolution.status ?? 'resolved'
  dispute.resolvedAt = new Date().toISOString()
  pushActivity({
    type: 'dispute_resolved',
    description: `Dispute #${id} resolved (${resolution.type})`,
    actorName: resolution.decidedBy,
    href: `/disputes/${id}`,
  })
  return dispute
}

export async function getDisputeCounts(): Promise<Record<string, number>> {
  await delay(200)
  const counts: Record<string, number> = { all: disputes.length }
  disputes.forEach((d) => {
    counts[d.status] = (counts[d.status] ?? 0) + 1
  })
  return counts
}
