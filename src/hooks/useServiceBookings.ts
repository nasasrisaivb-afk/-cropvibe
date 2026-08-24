import { useCallback, useMemo } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import type { ServiceBookingRecord, ServiceCategory } from '../components/services/serviceCatalogTypes'
import { useAppStore } from '../store/appStore'
import { useServiceBookingStore } from '../store/serviceBookingStore'

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined
export const isConvexEnabled = Boolean(convexUrl?.trim())

interface BookingPayload {
  serviceId: string
  category: ServiceCategory
  serviceTitle: string
  provider: string
  date: string
  time: string
  notes: string
  amount: number
}

function mapConvexDoc(doc: {
  _id: Id<'serviceBookings'>
  serviceId: string
  category: ServiceCategory
  serviceTitle: string
  provider: string
  date: string
  time: string
  notes: string
  amount: number
  confirmationCode: string
  createdAt: number
  status: 'confirmed' | 'cancelled'
}): ServiceBookingRecord {
  return {
    id: doc._id,
    serviceId: doc.serviceId,
    category: doc.category,
    serviceTitle: doc.serviceTitle,
    provider: doc.provider,
    date: doc.date,
    time: doc.time,
    notes: doc.notes,
    amount: doc.amount,
    confirmationCode: doc.confirmationCode,
    createdAt: new Date(doc.createdAt).toISOString(),
    status: doc.status,
  }
}

export function useServiceBookings() {
  const user = useAppStore((s) => s.user)
  const localBookings = useServiceBookingStore((s) => s.bookings)
  const addLocalBooking = useServiceBookingStore((s) => s.addBooking)

  const userId = user?.id ?? ''
  const isServiceProvider = user?.activeRole === 'service'

  const convexUserBookings = useQuery(
    api.serviceBookings.listByUser,
    isConvexEnabled && userId ? { userId } : 'skip',
  )

  const convexProviderBookings = useQuery(
    api.serviceBookings.listForProvider,
    isConvexEnabled && isServiceProvider
      ? { providerName: user?.profile.name, limit: 50 }
      : 'skip',
  )

  const createConvexBooking = useMutation(api.serviceBookings.createBooking)

  const convexBookings = useMemo((): ServiceBookingRecord[] => {
    if (!isConvexEnabled) return []

    if (isServiceProvider && convexProviderBookings) {
      return convexProviderBookings
        .filter((b) => b.status === 'confirmed')
        .map(mapConvexDoc)
    }

    if (convexUserBookings) {
      return convexUserBookings
        .filter((b) => b.status === 'confirmed')
        .map(mapConvexDoc)
    }

    return []
  }, [convexProviderBookings, convexUserBookings, isServiceProvider])

  const bookings = isConvexEnabled ? convexBookings : localBookings

  const isLoading =
    isConvexEnabled &&
    (isServiceProvider ? convexProviderBookings === undefined : convexUserBookings === undefined)

  const addBooking = useCallback(
    async (payload: BookingPayload): Promise<ServiceBookingRecord> => {
      if (!user) {
        throw new Error('Sign in to book a service')
      }

      if (isConvexEnabled) {
        const doc = await createConvexBooking({
          userId: user.id,
          userEmail: user.profile.email,
          ...payload,
        })
        return mapConvexDoc(doc)
      }

      return addLocalBooking(payload)
    },
    [addLocalBooking, createConvexBooking, user],
  )

  return {
    bookings,
    addBooking,
    isLoading,
    isConvexEnabled,
  }
}
