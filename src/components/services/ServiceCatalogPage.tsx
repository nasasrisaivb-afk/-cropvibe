import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { PageHeader } from '../common/PageHeader'
import { useToast } from '../common/Toast'
import { useAppStore } from '../../store/appStore'
import { useServiceBookingStore } from '../../store/serviceBookingStore'
import { ServiceCard } from './ServiceCard'
import { ServiceCatalogSkeleton } from './ServiceCatalogSkeleton'
import { ServiceFilters } from './ServiceFilters'
import { statusLabel } from './serviceCatalogData'
import { DEFAULT_FILTERS, filterAndSortServices } from './serviceCatalogUtils'
import type { ServiceCategory, ServiceFiltersState, ServiceItem } from './serviceCatalogTypes'
import { serviceDetailPath } from './serviceCatalogTypes'

const ServiceBookingSheet = lazy(() =>
  import('./ServiceBookingSheet').then((m) => ({ default: m.ServiceBookingSheet })),
)

export type { ServiceCategory }

const PAGE_COPY: Record<
  ServiceCategory,
  {
    buyer: { eyebrow: string; title: string; subtitle: string }
    provider: { eyebrow: string; title: string; subtitle: string }
  }
> = {
  consultancy: {
    buyer: {
      eyebrow: 'Services / Consultancy',
      title: 'Find expert consultants',
      subtitle:
        'Connect with certified farm advisors for crop planning, soil health, and farm operations.',
    },
    provider: {
      eyebrow: 'My account / My services / Consultancy',
      title: 'My consultancy services',
      subtitle: 'View, manage, and promote your consultancy offerings and bookings.',
    },
  },
  testing: {
    buyer: {
      eyebrow: 'Services / Testing',
      title: 'Find testing services',
      subtitle: 'Book soil, water, and crop testing packages from verified labs.',
    },
    provider: {
      eyebrow: 'My account / My services / Testing',
      title: 'My testing services',
      subtitle: 'Manage lab packages, sample slots, and customer bookings.',
    },
  },
  repair: {
    buyer: {
      eyebrow: 'Services / Repair',
      title: 'Find repair services',
      subtitle: 'On-site maintenance and repair for farm equipment.',
    },
    provider: {
      eyebrow: 'My account / My services / Repair',
      title: 'My repair services',
      subtitle: 'Manage visit slots, diagnostics, and service requests.',
    },
  },
  aerial: {
    buyer: {
      eyebrow: 'Services / Aerial',
      title: 'Find aerial services',
      subtitle: 'Drone spraying, imaging, and scouting for your fields.',
    },
    provider: {
      eyebrow: 'My account / My services / Aerial',
      title: 'My aerial services',
      subtitle: 'Manage drone slots, coverage areas, and bookings.',
    },
  },
  irrigation: {
    buyer: {
      eyebrow: 'Services / Irrigation',
      title: 'Find irrigation services',
      subtitle: 'Installation and setup for drip, pump, and irrigation systems.',
    },
    provider: {
      eyebrow: 'My account / My services / Irrigation',
      title: 'My irrigation services',
      subtitle: 'Manage installation offers, site visits, and project bookings.',
    },
  },
}

interface Props {
  category: ServiceCategory
}

export function ServiceCatalogPage({ category }: Props) {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const isProviderView = user?.activeRole === 'service'
  const copy = PAGE_COPY[category][isProviderView ? 'provider' : 'buyer']
  const { showToast, ToastStack } = useToast()
  const addBooking = useServiceBookingStore((s) => s.addBooking)

  const [filters, setFilters] = useState<ServiceFiltersState>(DEFAULT_FILTERS)
  const [loading, setLoading] = useState(true)
  const [bookingItem, setBookingItem] = useState<ServiceItem | null>(null)

  useEffect(() => {
    setLoading(true)
    const t = window.setTimeout(() => setLoading(false), 400)
    return () => window.clearTimeout(t)
  }, [category, filters])

  const items = useMemo(() => filterAndSortServices(category, filters), [category, filters])

  const openBooking = (item: ServiceItem) => {
    if (item.status !== 'open') {
      showToast({
        type: 'warning',
        title: 'Not available to book',
        message: `${item.title} is ${statusLabel(item.status).toLowerCase()}.`,
        duration: 4000,
      })
      return
    }
    setBookingItem(item)
  }

  const handleConfirmBooking = (payload: { date: string; time: string; notes: string }) => {
    if (!bookingItem) return
    const record = addBooking({
      serviceId: bookingItem.id,
      category,
      serviceTitle: bookingItem.title,
      provider: bookingItem.provider,
      date: payload.date,
      time: payload.time,
      notes: payload.notes,
      amount: bookingItem.rate,
    })
    showToast({
      type: 'success',
      title: 'Booking confirmed',
      message: `${record.confirmationCode} · ${bookingItem.title} on ${payload.date} at ${payload.time}`,
      actionLabel: 'View bookings',
      onAction: () => navigate('/dashboard/orders'),
      duration: 8000,
    })
    setBookingItem(null)
  }

  return (
    <div className="space-y-6">
      <ToastStack />

      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          isProviderView ? (
            <Button onClick={() => navigate('/dashboard/create')}>+ Add service slot</Button>
          ) : undefined
        }
      />

      <ServiceFilters category={category} filters={filters} onChange={setFilters} />

      {loading ? (
        <ServiceCatalogSkeleton />
      ) : items.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-lg font-semibold">
            {filters.q ? `No results for "${filters.q}"` : 'No services match'}
          </p>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">
            Try different keywords or clear your filters.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button variant="secondary" onClick={() => setFilters(DEFAULT_FILTERS)}>
              Clear filters
            </Button>
            {isProviderView ? (
              <Button onClick={() => navigate('/dashboard/create')}>+ Create your first service</Button>
            ) : null}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ServiceCard
              key={item.id}
              item={item}
              isProviderView={isProviderView}
              onBook={() => openBooking(item)}
              onDetails={() => navigate(serviceDetailPath(category, item.id))}
              onManageBookings={() => navigate('/dashboard/orders')}
            />
          ))}
        </div>
      )}

      {isProviderView && !loading ? (
        <div className="flex justify-center pt-2">
          <Button variant="secondary" onClick={() => navigate('/dashboard/create')}>
            + Add new service
          </Button>
        </div>
      ) : null}

      <Suspense fallback={null}>
        <ServiceBookingSheet
          open={bookingItem != null}
          service={bookingItem}
          onClose={() => setBookingItem(null)}
          onConfirm={handleConfirmBooking}
        />
      </Suspense>
    </div>
  )
}
