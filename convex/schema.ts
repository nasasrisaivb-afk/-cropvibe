import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const serviceCategoryValidator = v.union(
  v.literal('consultancy'),
  v.literal('testing'),
  v.literal('repair'),
  v.literal('aerial'),
  v.literal('irrigation'),
)

export default defineSchema({
  serviceBookings: defineTable({
    userId: v.string(),
    userEmail: v.string(),
    serviceId: v.string(),
    category: serviceCategoryValidator,
    serviceTitle: v.string(),
    provider: v.string(),
    date: v.string(),
    time: v.string(),
    notes: v.string(),
    amount: v.number(),
    confirmationCode: v.string(),
    status: v.union(v.literal('confirmed'), v.literal('cancelled')),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_created', ['userId', 'createdAt'])
    .index('by_confirmation', ['confirmationCode'])
    .index('by_service', ['serviceId']),
})
