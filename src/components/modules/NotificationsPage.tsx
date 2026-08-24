import { useState } from 'react'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { PageHeader } from '../common/PageHeader'
import { SegmentedControl } from '../common/SegmentedControl'
import { cn } from '../../utils/format'

type NotifType = 'order' | 'message' | 'system' | 'review'

interface Notification {
  id: string
  type: NotifType
  title: string
  body: string
  time: string
  read: boolean
}

const INITIAL: Notification[] = [
  {
    id: 'n1',
    type: 'order',
    title: 'New order PO-8922',
    body: 'FreshStore ordered 100 kg Potatoes — awaiting acceptance.',
    time: '12 min ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'message',
    title: 'Message from Green Mart',
    body: 'Can you deliver tomatoes by tomorrow morning?',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'review',
    title: 'New 5★ review',
    body: 'Organic Hub rated your Carrots delivery.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'n4',
    type: 'system',
    title: 'Quiet hours reminder',
    body: 'SMS alerts pause between 10 PM – 6 AM as per your preferences.',
    time: '2 days ago',
    read: true,
  },
]

const TYPE_LABEL: Record<NotifType, string> = {
  order: 'Order',
  message: 'Message',
  system: 'System',
  review: 'Review',
}

export function NotificationsPage() {
  const [items, setItems] = useState(INITIAL)
  const [filter, setFilter] = useState<'all' | NotifType>('all')
  const visible = filter === 'all' ? items : items.filter((i) => i.type === filter)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        subtitle="Stay on top of bookings, payments, and KYC — without missing a confirmation."
        actions={
          <Button
            variant="secondary"
            onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}
          >
            Mark all read
          </Button>
        }
      />

      <SegmentedControl
        fullWidth
        ariaLabel="Filter notifications"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'All' },
          { value: 'order', label: TYPE_LABEL.order },
          { value: 'message', label: TYPE_LABEL.message },
          { value: 'review', label: TYPE_LABEL.review },
          { value: 'system', label: TYPE_LABEL.system },
        ]}
      />

      <Card className="!rounded-[12px] !p-0 overflow-hidden">
        <ul className="divide-y divide-[var(--cv-border)]">
          {visible.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                className={cn(
                  'flex w-full flex-col gap-1 px-5 py-4 text-left hover:bg-[var(--cv-elevated)]',
                  !n.read && 'bg-[var(--cv-primary-soft)]/40',
                )}
                onClick={() =>
                  setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[var(--cv-text)]">{n.title}</span>
                  <span className="text-xs text-[var(--cv-muted)]">{n.time}</span>
                </div>
                <p className="text-sm text-[var(--cv-muted)]">{n.body}</p>
                <span className="mt-1 w-fit rounded-full bg-[var(--cv-elevated)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--cv-muted)]">
                  {TYPE_LABEL[n.type]}
                  {!n.read ? ' · Unread' : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
