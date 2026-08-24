import { Button } from '../common/Button'
import type { ServiceReview } from './serviceCatalogTypes'

interface Props {
  reviews: ServiceReview[]
  rating: number
  reviewCount: number
}

export function ServiceReviewsSection({ reviews, rating, reviewCount }: Props) {
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }))

  return (
    <section aria-labelledby="reviews-heading" className="cv-dashboard-panel space-y-4 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="reviews-heading" className="text-lg font-semibold text-[var(--cv-text)]">
          Reviews
        </h2>
        <p className="text-sm text-[var(--cv-muted)]">
          <span className="text-lg font-bold text-[var(--cv-text)]">{rating.toFixed(1)}</span> ★ ·{' '}
          {reviewCount} reviews
        </p>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-2">
          {distribution.map(({ stars, count }) => (
            <div key={stars} className="flex items-center gap-2 text-xs text-[var(--cv-muted)]">
              <span className="w-8">{stars} ★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--cv-border)]">
                <div
                  className="h-full rounded-full bg-[var(--cv-primary)]"
                  style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                />
              </div>
              <span className="w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      ) : null}

      <ul className="space-y-4">
        {reviews.length === 0 ? (
          <li className="text-sm text-[var(--cv-muted)]">No reviews yet. Be the first to book!</li>
        ) : (
          reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4"
            >
              <div className="flex items-center gap-2">
                <span aria-label={`${review.rating} out of 5 stars`}>
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </span>
                {review.verified ? (
                  <span className="rounded-full bg-[var(--cv-success,#4CAF50)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--cv-success,#4CAF50)]">
                    Verified booking
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--cv-text)]">&ldquo;{review.text}&rdquo;</p>
              <p className="mt-2 text-xs text-[var(--cv-muted)]">
                {review.author} · {review.date}
              </p>
            </li>
          ))
        )}
      </ul>

      <Button size="sm" variant="secondary" type="button">
        Write a review
      </Button>
    </section>
  )
}
