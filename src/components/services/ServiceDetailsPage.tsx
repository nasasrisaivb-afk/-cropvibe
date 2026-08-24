import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { ArrowLeftIcon, ShareIcon } from '@heroicons/react/24/outline'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { useToast } from '../common/Toast'
import { useAppStore } from '../../store/appStore'
import { useServiceBookings } from '../../hooks/useServiceBookings'
import { formatCurrency } from '../../utils/format'
import { ServiceAvailabilityCalendar } from './ServiceAvailabilityCalendar'
import { ServiceProviderSection } from './ServiceProviderSection'
import { ServiceReviewsSection } from './ServiceReviewsSection'
import { statusBadge } from './serviceCatalogData'
import { generateAvailability } from './serviceCatalogUtils'
import type { ServiceAvailabilityDay, ServiceCategory } from './serviceCatalogTypes'
import { CATEGORY_LABELS, serviceDetailPath } from './serviceCatalogTypes'
import { getServiceById } from './serviceCatalogUtils'

const ServiceBookingSheet = lazy(() =>
  import('./ServiceBookingSheet').then((m) => ({ default: m.ServiceBookingSheet })),
)

interface Props {
  category: ServiceCategory
}

export function ServiceDetailsPage({ category }: Props) {
  const { serviceId } = useParams<{ serviceId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const isProviderView = user?.activeRole === 'service'
  const { showToast, ToastStack } = useToast()
  const { addBooking } = useServiceBookings()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(searchParams.get('book') === '1')
  const [previewDay, setPreviewDay] = useState<ServiceAvailabilityDay | null>(null)

  const service = serviceId ? getServiceById(category, serviceId) : undefined
  const availability = useMemo(
    () => (service ? generateAvailability(service.id) : []),
    [service],
  )

  useEffect(() => {
    setLoading(true)
    setError(false)
    const t = window.setTimeout(() => {
      if (!serviceId || !getServiceById(category, serviceId)) {
        setError(true)
      }
      setLoading(false)
    }, 350)
    return () => window.clearTimeout(t)
  }, [category, serviceId])

  useEffect(() => {
    setBookingOpen(searchParams.get('book') === '1')
  }, [searchParams])

  if (!serviceId) return <Navigate replace to={`/dashboard/${category}`} />

  if (!loading && (error || !service)) {
    return (
      <div className="cv-dashboard-panel space-y-4 p-8 text-center">
        <p className="text-lg font-semibold">Service not found</p>
        <p className="text-sm text-[var(--cv-muted)]">
          This service may have been removed or the link is incorrect.
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="secondary" onClick={() => navigate(`/dashboard/${category}`)}>
            Back to {CATEGORY_LABELS[category]}
          </Button>
        </div>
      </div>
    )
  }

  if (loading || !service) {
    return (
      <div className="space-y-4 animate-pulse" aria-busy="true">
        <div className="cv-dashboard-panel h-24" />
        <div className="cv-dashboard-panel h-64" />
        <div className="cv-dashboard-panel h-48" />
      </div>
    )
  }

  const openBooking = () => {
    if (isProviderView) {
      navigate('/dashboard/orders')
      return
    }
    if (service.status !== 'open') {
      showToast({
        type: 'warning',
        title: 'Not available',
        message: 'This service is not open for new bookings.',
      })
      return
    }
    setSearchParams({ book: '1' })
    setBookingOpen(true)
  }

  const closeBooking = () => {
    setSearchParams({})
    setBookingOpen(false)
  }

  const handleConfirm = async (payload: { date: string; time: string; notes: string }) => {
    try {
      const record = await addBooking({
        serviceId: service.id,
        category,
        serviceTitle: service.title,
        provider: service.provider,
        date: payload.date,
        time: payload.time,
        notes: payload.notes,
        amount: service.rate,
      })
      showToast({
        type: 'success',
        title: 'Booking confirmed',
        message: `Confirmation ${record.confirmationCode} · ${payload.date} at ${payload.time}`,
        actionLabel: 'View bookings',
        onAction: () => navigate('/dashboard/orders'),
        duration: 8000,
      })
      closeBooking()
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Booking failed',
        message: err instanceof Error ? err.message : 'Please try again.',
        duration: null,
      })
      throw err
    }
  }

  const share = async () => {
    const url = window.location.href.split('?')[0]
    try {
      if (navigator.share) {
        await navigator.share({ title: service.title, url })
      } else {
        await navigator.clipboard.writeText(url)
        showToast({ type: 'info', title: 'Link copied', message: 'Share this service with others.' })
      }
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      <ToastStack />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/dashboard/${category}`)}
          aria-label={`Back to ${CATEGORY_LABELS[category]}`}
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={share} aria-label="Share service">
            <ShareIcon className="h-4 w-4" aria-hidden />
            Share
          </Button>
        </div>
      </div>

      <header className="cv-dashboard-panel space-y-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--cv-muted)]">{service.subtitle}</p>
            <h1 className="mt-1 text-2xl font-semibold text-[var(--cv-text)] sm:text-3xl">{service.title}</h1>
            <p className="mt-2 text-sm text-[var(--cv-muted)]">
              By {service.provider} · {service.location}
            </p>
          </div>
          <Badge status={statusBadge(service.status)} />
        </div>
        <p className="text-sm leading-relaxed text-[var(--cv-muted)]">{service.description}</p>
        <div className="flex flex-wrap gap-4 text-sm text-[var(--cv-muted)]">
          {service.durationMinutes > 0 ? <span>⏱ {service.durationMinutes} min</span> : null}
          <span>📋 {service.format}</span>
          <span>⭐ {service.rating.toFixed(1)} ({service.reviewCount} reviews)</span>
        </div>
      </header>

      <ServiceProviderSection providerName={service.provider} profile={service.providerProfile} />

      <section className="cv-dashboard-panel space-y-4 p-5" aria-labelledby="details-heading">
        <h2 id="details-heading" className="text-lg font-semibold text-[var(--cv-text)]">
          Service details
        </h2>
        <div>
          <p className="text-sm font-medium text-[var(--cv-text)]">What&apos;s included</p>
          <ul className="mt-1.5 list-inside list-disc space-y-1 text-sm text-[var(--cv-muted)]">
            {service.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-[var(--cv-muted)]">{service.cancellationPolicy}</p>
      </section>

      <section className="cv-dashboard-panel space-y-4 p-5" aria-labelledby="pricing-heading">
        <h2 id="pricing-heading" className="text-lg font-semibold text-[var(--cv-text)]">
          Pricing & availability
        </h2>
        <p className="text-2xl font-bold text-[var(--cv-primary)]">
          {formatCurrency(service.rate)}
          <span className="text-base font-medium text-[var(--cv-muted)]"> / {service.unit}</span>
        </p>
        <p className="text-sm text-[var(--cv-muted)]">Total shown at checkout. No hidden fees.</p>
        <ServiceAvailabilityCalendar
          days={availability}
          selectedIso={previewDay?.iso ?? null}
          onSelect={setPreviewDay}
        />
        {previewDay?.available ? (
          <p className="text-sm text-[var(--cv-muted)]">
            {previewDay.label}: {previewDay.times.join(', ')}
          </p>
        ) : null}
      </section>

      <ServiceReviewsSection reviews={service.reviews} rating={service.rating} reviewCount={service.reviewCount} />

      {/* Desktop inline actions */}
      <div className="hidden flex-wrap gap-2 lg:flex">
        {isProviderView ? (
          <Button onClick={() => navigate('/dashboard/orders')}>Manage bookings</Button>
        ) : (
          <>
            <Button disabled={service.status !== 'open'} onClick={openBooking}>
              Book now
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard/messages')}>
              Message consultant
            </Button>
          </>
        )}
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-[calc(var(--cv-mobile-nav-height,0px)+var(--cv-safe-bottom,0px))] z-40 border-t border-[var(--cv-border)] bg-[var(--cv-bg)]/95 p-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-[1280px] gap-2">
          {isProviderView ? (
            <Button fullWidth onClick={() => navigate('/dashboard/orders')}>
              Manage bookings
            </Button>
          ) : (
            <>
              <Button
                fullWidth
                disabled={service.status !== 'open'}
                onClick={openBooking}
              >
                Book now
              </Button>
              <Button variant="secondary" onClick={() => navigate('/dashboard/messages')}>
                Message
              </Button>
            </>
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        <ServiceBookingSheet
          open={bookingOpen}
          service={service}
          onClose={closeBooking}
          onConfirm={handleConfirm}
        />
      </Suspense>
    </div>
  )
}

export function resolveServiceCategoryFromPath(segment: string): ServiceCategory | null {
  const cats: ServiceCategory[] = ['consultancy', 'testing', 'repair', 'aerial', 'irrigation']
  return cats.includes(segment as ServiceCategory) ? (segment as ServiceCategory) : null
}

export { serviceDetailPath }
