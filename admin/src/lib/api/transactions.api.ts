import '@/lib/data/ops-seeds'
import { audit } from '@/lib/data/store'
import { transactions } from '@/lib/data/seeds'
import type { PaginatedResult, Transaction } from '@/lib/types'
import { delay } from '@/lib/utils'

export interface TxFilters {
  type?: string
  status?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  amountMin?: number
  amountMax?: number
  page?: number
  limit?: number
}

export async function getTransactions(filters: TxFilters = {}): Promise<PaginatedResult<Transaction>> {
  await delay()
  let data = [...transactions]
  if (filters.type && filters.type !== 'all') data = data.filter((t) => t.type === filters.type)
  if (filters.status && filters.status !== 'all') data = data.filter((t) => t.status === filters.status)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    data = data.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        (t.fromName ?? '').toLowerCase().includes(q) ||
        (t.toName ?? '').toLowerCase().includes(q) ||
        (t.gatewayReference ?? '').toLowerCase().includes(q)
    )
  }
  if (filters.dateFrom) data = data.filter((t) => t.createdAt >= filters.dateFrom!)
  if (filters.dateTo) data = data.filter((t) => t.createdAt <= filters.dateTo!)
  if (filters.amountMin != null) data = data.filter((t) => t.amount >= filters.amountMin!)
  if (filters.amountMax != null) data = data.filter((t) => t.amount <= filters.amountMax!)
  data.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const page = filters.page ?? 1
  const limit = filters.limit ?? 50
  const start = (page - 1) * limit
  return { data: data.slice(start, start + limit), total: data.length, page, limit }
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  await delay(300)
  return transactions.find((t) => t.id === id) ?? null
}

export async function reverseTransaction(id: string): Promise<Transaction> {
  await delay(500)
  const tx = transactions.find((t) => t.id === id)
  if (!tx) throw new Error('Transaction not found')
  if (tx.status !== 'completed') throw new Error('Only completed transactions can be reversed')
  tx.status = 'reversed'
  audit('finance', 'Transaction', id, 'Reversed transaction', { href: `/transactions/${id}`, severity: 'critical', collection: 'transactions' })
  return tx
}

export async function retryTransaction(id: string): Promise<Transaction> {
  await delay(500)
  const tx = transactions.find((t) => t.id === id)
  if (!tx) throw new Error('Transaction not found')
  if (tx.status !== 'failed') throw new Error('Only failed transactions can be retried')
  tx.status = 'completed'
  tx.completedAt = new Date().toISOString()
  audit('finance', 'Transaction', id, 'Retried failed transaction', { href: `/transactions/${id}`, collection: 'transactions' })
  return tx
}
