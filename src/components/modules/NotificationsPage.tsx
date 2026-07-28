import { useState } from 'react'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">
            Push, SMS, email, and in-app alerts with quiet hours support.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}
        >
          Mark all read
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'order', 'message', 'review', 'system'] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium capitalize',
              filter === f
                ? 'bg-[var(--cv-primary)] text-white'
                : 'bg-[var(--cv-elevated)] text-[var(--cv-muted)]',
            )}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : TYPE_LABEL[f]}
          </button>
        ))}
      </div>

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
