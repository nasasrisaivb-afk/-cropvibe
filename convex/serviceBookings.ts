import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { serviceCategoryValidator } from './schema'

const bookingDocValidator = v.object({
  _id: v.id('serviceBookings'),
  _creationTime: v.number(),
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

function makeConfirmationCode(): string {
  return `BC${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export const createBooking = mutation({
  args: {
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
  },
  returns: bookingDocValidator,
  handler: async (ctx, args) => {
    if (!args.userId.trim()) {
      throw new Error('Not authenticated')
    }

    const confirmationCode = makeConfirmationCode()
    const createdAt = Date.now()

    const id = await ctx.db.insert('serviceBookings', {
      userId: args.userId,
      userEmail: args.userEmail,
      serviceId: args.serviceId,
      category: args.category,
      serviceTitle: args.serviceTitle,
      provider: args.provider,
      date: args.date,
      time: args.time,
      notes: args.notes,
      amount: args.amount,
      confirmationCode,
      status: 'confirmed',
      createdAt,
    })

    const doc = await ctx.db.get('serviceBookings', id)
    if (!doc) {
      throw new Error('Failed to create booking')
    }
    return doc
  },
})

export const listByUser = query({
  args: { userId: v.string() },
  returns: v.array(bookingDocValidator),
  handler: async (ctx, args) => {
    if (!args.userId.trim()) {
      throw new Error('Not authenticated')
    }

    return await ctx.db
      .query('serviceBookings')
      .withIndex('by_user_and_created', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect()
  },
})

/** Provider dashboard: recent bookings across services (scoped by provider name when set) */
export const listForProvider = query({
  args: {
    providerName: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(bookingDocValidator),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50
    const all = await ctx.db.query('serviceBookings').order('desc').take(limit)

    if (args.providerName?.trim()) {
      const name = args.providerName.trim().toLowerCase()
      return all.filter((b) => b.provider.toLowerCase().includes(name))
    }

    return all
  },
})

export const cancelBooking = mutation({
  args: {
    bookingId: v.id('serviceBookings'),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!args.userId.trim()) {
      throw new Error('Not authenticated')
    }

    const booking = await ctx.db.get('serviceBookings', args.bookingId)
    if (!booking) {
      throw new Error('Booking not found')
    }
    if (booking.userId !== args.userId) {
      throw new Error('Unauthorized')
    }

    await ctx.db.patch('serviceBookings', args.bookingId, { status: 'cancelled' })
    return null
  },
})
