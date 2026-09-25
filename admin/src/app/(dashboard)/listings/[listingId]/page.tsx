'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getListingById, moderateListing } from '@/lib/api/listings.api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/loading'
import { formatInr, relativeTime } from '@/lib/utils'

export default function ListingDetailPage() {
  const { listingId } = useParams<{ listingId: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listings', listingId],
    queryFn: () => getListingById(listingId),
  })

  const mut = useMutation({
    mutationFn: (action: 'approve' | 'flag' | 'remove' | 'feature' | 'archive') =>
      moderateListing(listingId, action, reason, notes),
    onSuccess: (_, action) => {
      toast.success(`Listing ${action}`)
      void qc.invalidateQueries({ queryKey: ['listings'] })
      if (action === 'remove' || action === 'approve') router.push('/listings')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) return <Skeleton className="h-96 w-full" />
  if (!listing) return <p>Listing not found</p>

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => router.push('/listings')}>
        ← Back
      </Button>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold text-text-primary">
          {listing.type.replace('_', ' ')}: {listing.title}
        </h2>
        <Badge>{listing.status.replace('_', ' ')}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4 pt-5">
            <div className="flex gap-2 overflow-x-auto">
              {listing.images.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt={listing.title} className="h-48 rounded-lg object-cover" />
              ))}
            </div>
            <p className="text-text-secondary">{listing.description}</p>
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <div><dt className="text-text-muted">Seller</dt><dd>{listing.sellerName}</dd></div>
              <div><dt className="text-text-muted">Category</dt><dd>{listing.category} / {listing.subCategory}</dd></div>
              <div><dt className="text-text-muted">Price</dt><dd className="font-mono">{listing.price != null ? formatInr(listing.price) : '—'}</dd></div>
              <div><dt className="text-text-muted">Location</dt><dd>{listing.location.district}, {listing.location.state}</dd></div>
              <div><dt className="text-text-muted">Views</dt><dd>{listing.views}</dd></div>
              <div><dt className="text-text-muted">Inquiries</dt><dd>{listing.inquiries}</dd></div>
              <div><dt className="text-text-muted">Created</dt><dd>{relativeTime(listing.createdAt)}</dd></div>
              {listing.quantity != null ? <div><dt className="text-text-muted">Quantity</dt><dd>{listing.quantity}</dd></div> : null}
              {listing.rentalPeriod ? <div><dt className="text-text-muted">Rental</dt><dd>{listing.rentalPeriod}</dd></div> : null}
              {listing.capacity != null ? <div><dt className="text-text-muted">Capacity</dt><dd>{listing.capacity}</dd></div> : null}
            </dl>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader><h2 className="font-semibold">Moderation</h2></CardHeader>
          <CardContent className="space-y-3">
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="cv-control h-9"
            >
              <option value="">Reason (flag/remove)</option>
              <option value="Inappropriate content">Inappropriate content</option>
              <option value="Duplicate">Duplicate</option>
              <option value="Misleading">Misleading</option>
              <option value="Fraud suspected">Fraud suspected</option>
              <option value="Policy violation">Policy violation</option>
              <option value="Seller unverified">Seller unverified</option>
            </select>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes"
              className="cv-control h-20 py-2"
            />
            <div className="grid grid-cols-2 gap-2">
              <Button loading={mut.isPending} onClick={() => mut.mutate('approve')}>Approve</Button>
              <Button variant="secondary" loading={mut.isPending} onClick={() => mut.mutate('feature')}>Feature</Button>
              <Button variant="secondary" loading={mut.isPending} onClick={() => mut.mutate('flag')}>Flag</Button>
              <Button variant="danger" loading={mut.isPending} onClick={() => mut.mutate('remove')}>Remove</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
