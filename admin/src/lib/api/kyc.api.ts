import { kycApplications, users, pushActivity } from '@/lib/data/seeds'
import type { KycApplication, PaginatedResult } from '@/lib/types'
import { delay } from '@/lib/utils'

export interface KycFilters {
  status?: string
  documentType?: string
  sortBy?: 'sla' | 'submittedAt' | 'name'
  page?: number
  limit?: number
}

function slaHours(submittedAt: string) {
  return (Date.now() - new Date(submittedAt).getTime()) / 3600000
}

export async function getKycQueue(filters: KycFilters = {}): Promise<PaginatedResult<KycApplication>> {
  await delay()
  let data = [...kycApplications]
  if (filters.status && filters.status !== 'all') {
    data = data.filter((k) => k.status === filters.status)
  }
  if (filters.documentType && filters.documentType !== 'all') {
    data = data.filter((k) => k.documentType === filters.documentType)
  }

  const sortBy = filters.sortBy ?? 'sla'
  data.sort((a, b) => {
    if (sortBy === 'name') return a.userName.localeCompare(b.userName)
    if (sortBy === 'submittedAt') return b.submittedAt.localeCompare(a.submittedAt)
    return slaHours(b.submittedAt) - slaHours(a.submittedAt)
  })

  const page = filters.page ?? 1
  const limit = filters.limit ?? 50
  const start = (page - 1) * limit
  return { data: data.slice(start, start + limit), total: data.length, page, limit }
}

export async function getKycById(kycId: string): Promise<KycApplication | null> {
  await delay(300)
  return kycApplications.find((k) => k.id === kycId) ?? null
}

export async function updateKycStatus(
  kycId: string,
  decision: {
    status: 'approved' | 'rejected' | 'resubmit_requested' | 'in_review'
    reason?: string
    internalNotes?: string
    adminName?: string
  }
): Promise<KycApplication> {
  await delay(600)
  const kyc = kycApplications.find((k) => k.id === kycId)
  if (!kyc) throw new Error('KYC application not found')
  kyc.status = decision.status
  kyc.reviewedAt = new Date().toISOString()
  kyc.reviewedBy = 'admin-1'
  kyc.internalNotes = decision.internalNotes
  if (decision.status === 'rejected') kyc.rejectionReason = decision.reason
  if (decision.status === 'resubmit_requested') kyc.resubmitReason = decision.reason
  kyc.auditTrail = [
    ...kyc.auditTrail,
    {
      timestamp: new Date().toISOString(),
      action: decision.status,
      actor: decision.adminName ?? 'Raj Kumar',
      details: decision.reason,
    },
  ]
  const user = users.find((u) => u.id === kyc.userId)
  if (user) {
    if (decision.status === 'approved') user.kyc = 'approved'
    if (decision.status === 'rejected') user.kyc = 'rejected'
    if (decision.status === 'resubmit_requested') user.kyc = 'pending'
  }
  pushActivity({
    type: 'kyc_decision',
    description: `KYC for ${kyc.userName} ${decision.status}`,
    actorName: decision.adminName ?? 'Admin',
    href: `/kyc/${kycId}`,
  })
  return kyc
}

export async function getKycCounts(): Promise<Record<string, number>> {
  await delay(200)
  const counts: Record<string, number> = { all: kycApplications.length }
  kycApplications.forEach((k) => {
    counts[k.status] = (counts[k.status] ?? 0) + 1
  })
  return counts
}
