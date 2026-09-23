import { useState } from 'react'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { PageHeader } from '../common/PageHeader'
import { Select } from '../common/Select'

interface Review {
  id: string
  author: string
  rating: number
  text: string
  date: string
  reply?: string
}

const INITIAL: Review[] = [
  {
    id: 'r1',
    author: 'Green Mart',
    rating: 5,
    text: 'Fresh tomatoes, packed well, delivered on time. Will reorder.',
    date: '26 Jul 2026',
  },
  {
    id: 'r2',
    author: 'ABC Farm',
    rating: 4,
    text: 'Tractor was clean and fueled. Pickup process was smooth.',
    date: '24 Jul 2026',
    reply: 'Thank you! Looking forward to your next booking.',
  },
  {
    id: 'r3',
    author: 'Student cohort · Organic 101',
    rating: 5,
    text: 'Practical modules and clear field demos. Highly recommended.',
    date: '22 Jul 2026',
  },
]

export function ReviewsPage() {
  const [filter, setFilter] = useState('all')
  const [reviews, setReviews] = useState(INITIAL)
  const [replying, setReplying] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  const visible =
    filter === 'write'
      ? []
      : filter === 'all' || filter === 'given'
        ? reviews
        : reviews.filter((r) => r.rating === Number(filter))

  const avg =
    reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        subtitle="Reputation center — respond to feedback and track rating mix."
        actions={
          <Select
            label="Filter by stars"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Received' },
              { value: '5', label: '5 stars' },
              { value: '4', label: '4 stars' },
              { value: 'given', label: 'Given' },
              { value: 'write', label: 'To write' },
            ]}
          />
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="!rounded-[12px]">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">Average</p>
          <p className="mt-2 text-3xl font-bold text-[var(--cv-primary)]">{avg.toFixed(1)} / 5.0</p>
          <p className="mt-1 text-xs text-[var(--cv-muted)]">{reviews.length} reviews</p>
        </Card>
        <Card className="!rounded-[12px] sm:col-span-2" title="Rating breakdown">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length
            const pct = (count / Math.max(reviews.length, 1)) * 100
            return (
              <div key={star} className="mb-2 flex items-center gap-3 text-sm last:mb-0">
                <span className="w-10 text-[var(--cv-muted)]">{star}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--cv-elevated)]">
                  <div
                    className="h-full rounded-full bg-[var(--cv-accent)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-right text-[var(--cv-muted)]">{count}</span>
              </div>
            )
          })}
        </Card>
      </div>

      <div className="space-y-3">
        {visible.map((r) => (
          <Card key={r.id} className="!rounded-[12px]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{r.author}</p>
                <p className="text-xs text-[var(--cv-muted)]">{r.date}</p>
              </div>
              <p className="font-semibold text-[var(--cv-accent-muted)]">{'★'.repeat(r.rating)}</p>
            </div>
            <p className="mt-3 text-sm text-[var(--cv-muted)]">{r.text}</p>
            {r.reply ? (
              <div className="mt-3 rounded-[10px] bg-[var(--cv-elevated)] px-3 py-2 text-sm">
                <p className="text-xs font-semibold text-[var(--cv-primary)]">Your reply</p>
                <p className="mt-1 text-[var(--cv-muted)]">{r.reply}</p>
              </div>
            ) : replying === r.id ? (
              <div className="mt-3 space-y-2">
                <textarea
                  className="cv-input focus-ring w-full rounded-[12px] px-3 py-2 text-sm"
                  rows={3}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a professional reply…"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setReviews((prev) =>
                        prev.map((x) => (x.id === r.id ? { ...x, reply: draft.trim() } : x)),
                      )
                      setReplying(null)
                      setDraft('')
                    }}
                    disabled={!draft.trim()}
                  >
                    Post reply
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setReplying(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button className="mt-3" size="sm" variant="secondary" onClick={() => setReplying(r.id)}>
                Respond
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
