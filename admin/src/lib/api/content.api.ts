import { contentItems } from '@/lib/data/seeds'
import type { ContentItem, PaginatedResult } from '@/lib/types'
import { delay } from '@/lib/utils'

export async function getContentItems(filters: {
  type?: string
  status?: string
  page?: number
  limit?: number
} = {}): Promise<PaginatedResult<ContentItem>> {
  await delay()
  let data = [...contentItems]
  if (filters.type && filters.type !== 'all') data = data.filter((c) => c.type === filters.type)
  if (filters.status && filters.status !== 'all') data = data.filter((c) => c.status === filters.status)
  data.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const page = filters.page ?? 1
  const limit = filters.limit ?? 50
  const start = (page - 1) * limit
  return { data: data.slice(start, start + limit), total: data.length, page, limit }
}

export async function getContentById(id: string): Promise<ContentItem | null> {
  await delay(300)
  return contentItems.find((c) => c.id === id) ?? null
}

export async function saveContent(
  id: string | null,
  payload: Partial<ContentItem> & { title: string; body: string; type: ContentItem['type'] }
): Promise<ContentItem> {
  await delay(500)
  if (id) {
    const item = contentItems.find((c) => c.id === id)
    if (!item) throw new Error('Content not found')
    Object.assign(item, payload, {
      version: item.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Raj Kumar',
    })
    return item
  }
  const created: ContentItem = {
    id: `content-${Date.now()}`,
    title: payload.title,
    type: payload.type,
    status: payload.status ?? 'draft',
    body: payload.body,
    version: 1,
    scheduledAt: payload.scheduledAt,
    publishedAt: payload.status === 'published' ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
    updatedBy: 'Raj Kumar',
  }
  contentItems.unshift(created)
  return created
}

export async function publishContent(id: string): Promise<ContentItem> {
  await delay(400)
  const item = contentItems.find((c) => c.id === id)
  if (!item) throw new Error('Content not found')
  item.status = 'published'
  item.publishedAt = new Date().toISOString()
  item.updatedAt = new Date().toISOString()
  item.version += 1
  return item
}
