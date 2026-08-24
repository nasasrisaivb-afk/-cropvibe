import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ServiceBookingRecord, ServiceCategory } from '../components/services/serviceCatalogTypes'

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

interface ServiceBookingState {
  bookings: ServiceBookingRecord[]
  addBooking: (payload: BookingPayload) => ServiceBookingRecord
  getBookingsForService: (serviceId: string) => ServiceBookingRecord[]
}

function makeConfirmationCode(): string {
  return `BC${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export const useServiceBookingStore = create<ServiceBookingState>()(
  persist(
    (set, get) => ({
      bookings: [],
      addBooking: (payload) => {
        const record: ServiceBookingRecord = {
          id: crypto.randomUUID(),
          ...payload,
          createdAt: new Date().toISOString(),
          confirmationCode: makeConfirmationCode(),
        }
        set({ bookings: [record, ...get().bookings] })
        return record
      },
      getBookingsForService: (serviceId) =>
        get().bookings.filter((b) => b.serviceId === serviceId),
    }),
    { name: 'cropvibe.service-bookings' },
  ),
)
