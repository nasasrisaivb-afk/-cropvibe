import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { formatCurrency } from '../../utils/format'
import { statusBadge, statusLabel } from './serviceCatalogData'
import type { ServiceItem } from './serviceCatalogTypes'

interface Props {
  item: ServiceItem
  isProviderView: boolean
  onBook: () => void
  onDetails: () => void
  onManageBookings: () => void
}

export function ServiceCard({
  item,
  isProviderView,
  onBook,
  onDetails,
  onManageBookings,
}: Props) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-[var(--cv-text)]">{item.title}</h3>
          <p className="mt-0.5 text-sm text-[var(--cv-muted)]">{item.subtitle}</p>
        </div>
        <Badge status={statusBadge(item.status)} />
      </div>

      <p className="mt-3 text-sm text-[var(--cv-muted)]">
        By {item.provider} · {item.location}
      </p>

      <p className="mt-2 text-lg font-bold text-[var(--cv-primary)]">
        {formatCurrency(item.rate)}
        <span className="text-sm font-medium text-[var(--cv-muted)]"> / {item.unit}</span>
        {item.durationMinutes > 0 ? (
          <span className="text-sm font-medium text-[var(--cv-muted)]"> · {item.durationMinutes} min</span>
        ) : null}
      </p>

      {item.rating > 0 ? (
        <p className="mt-1 text-xs text-[var(--cv-muted)]">
          ⭐ {item.rating.toFixed(1)} ({item.reviewCount} reviews)
        </p>
      ) : null}

      {item.nextAvailable.length > 0 && item.status === 'open' ? (
        <p className="mt-2 text-xs text-[var(--cv-muted)]">
          Next: {item.nextAvailable.slice(0, 3).join(', ')}
        </p>
      ) : (
        <p className="mt-2 text-xs text-[var(--cv-muted)]">{statusLabel(item.status)}</p>
      )}

      <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row">
        {isProviderView ? (
          <>
            <Button className="flex-1 cv-touch min-h-[44px]" size="sm" variant="secondary" onClick={onManageBookings}>
              Manage bookings
            </Button>
            <Button className="flex-1 cv-touch min-h-[44px]" size="sm" variant="ghost" onClick={onDetails}>
              View details
            </Button>
          </>
        ) : (
          <>
            <Button
              className="flex-1 cv-touch min-h-[44px]"
              size="sm"
              disabled={item.status !== 'open'}
              onClick={onBook}
            >
              Book now
            </Button>
            <Button className="flex-1 cv-touch min-h-[44px]" size="sm" variant="secondary" onClick={onDetails}>
              View details
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}
