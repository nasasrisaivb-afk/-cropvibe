import { useMemo, useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'
import { PageHeader } from '../common/PageHeader'
import { cn } from '../../utils/format'

interface Conversation {
  id: string
  name: string
  preview: string
  time: string
  unread: number
  orderRef?: string
}

const THREADS: Conversation[] = [
  {
    id: 'c1',
    name: 'Green Mart',
    preview: 'Can you deliver tomatoes by tomorrow morning?',
    time: '11:40 AM',
    unread: 2,
    orderRef: 'PO-8922',
  },
  {
    id: 'c2',
    name: 'ABC Farm',
    preview: 'Tractor pickup confirmed for 9 AM.',
    time: 'Yesterday',
    unread: 0,
    orderRef: 'BK-5432',
  },
  {
    id: 'c3',
    name: 'CropVibe Support',
    preview: 'Your KYC documents are under review.',
    time: 'Mon',
    unread: 1,
  },
]

const MESSAGES: Record<string, { from: 'me' | 'them'; text: string; time: string }[]> = {
  c1: [
    { from: 'them', text: 'Namaste! Need 50kg organic tomatoes.', time: '10:12 AM' },
    { from: 'me', text: 'Available. Packed and ready for dispatch today.', time: '10:18 AM' },
    { from: 'them', text: 'Can you deliver tomatoes by tomorrow morning?', time: '11:40 AM' },
  ],
  c2: [
    { from: 'them', text: 'Confirming tractor #1 for 28–31 Jul.', time: 'Yesterday' },
    { from: 'me', text: 'Confirmed. Please bring ID at pickup.', time: 'Yesterday' },
    { from: 'them', text: 'Tractor pickup confirmed for 9 AM.', time: 'Yesterday' },
  ],
  c3: [
    { from: 'them', text: 'Your KYC documents are under review.', time: 'Mon' },
    { from: 'them', text: 'Typical approval takes 24–48 hours.', time: 'Mon' },
  ],
}

export function MessagesPage() {
  const user = useAppStore((s) => s.user)
  const [activeId, setActiveId] = useState(THREADS[0].id)
  const [draft, setDraft] = useState('')
  const [mobileChat, setMobileChat] = useState(false)
  const active = THREADS.find((t) => t.id === activeId) ?? THREADS[0]
  const msgs = useMemo(() => MESSAGES[activeId] ?? [], [activeId])

  return (
    <div className="space-y-4">
      <PageHeader
        title="Messages"
        subtitle="Order-linked chats with read receipts. Attachments supported."
      />

      <div className="grid h-[min(70vh,720px)] overflow-hidden rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface)] lg:grid-cols-[320px_1fr]">
        <aside
          className={cn(
            'border-r border-[var(--cv-border)]',
            mobileChat ? 'hidden lg:block' : 'block',
          )}
        >
          <div className="border-b border-[var(--cv-border)] p-3">
            <FormInput label="Search conversations" placeholder="Buyer, order, or booking ID" />
          </div>
          <ul className="overflow-y-auto">
            {THREADS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full flex-col gap-1 border-b border-[var(--cv-border)] px-4 py-3 text-left transition hover:bg-[var(--cv-elevated)]',
                    activeId === t.id && 'bg-[var(--cv-primary-soft)]',
                  )}
                  onClick={() => {
                    setActiveId(t.id)
                    setMobileChat(true)
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[var(--cv-text)]">{t.name}</span>
                    <span className="text-xs text-[var(--cv-muted)]">{t.time}</span>
                  </div>
                  <p className="truncate text-sm text-[var(--cv-muted)]">{t.preview}</p>
                  <div className="flex items-center gap-2">
                    {t.orderRef ? (
                      <span className="rounded-full bg-[var(--cv-elevated)] px-2 py-0.5 text-[10px] font-medium text-[var(--cv-muted)]">
                        {t.orderRef}
                      </span>
                    ) : null}
                    {t.unread > 0 ? (
                      <span className="rounded-full bg-[var(--cv-accent)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--cv-text)]">
                        {t.unread}
                      </span>
                    ) : null}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className={cn('flex flex-col', !mobileChat ? 'hidden lg:flex' : 'flex')}>
          <header className="flex items-center justify-between border-b border-[var(--cv-border)] px-4 py-3">
            <div>
              <button
                type="button"
                className="mb-1 text-sm text-[var(--cv-primary)] lg:hidden"
                onClick={() => setMobileChat(false)}
              >
                ← Inbox
              </button>
              <h2 className="font-semibold">{active.name}</h2>
              {active.orderRef ? (
                <p className="text-xs text-[var(--cv-muted)]">Linked to {active.orderRef}</p>
              ) : null}
            </div>
            <Button size="sm" variant="secondary">
              View order
            </Button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[var(--cv-bg)] p-4">
            {msgs.map((m, i) => (
              <div
                key={`${m.time}-${i}`}
                className={cn('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-[12px] px-3 py-2 text-sm shadow-sm',
                    m.from === 'me'
                      ? 'bg-[var(--cv-primary)] text-[var(--cv-btn-text)]'
                      : 'bg-[var(--cv-surface)] text-[var(--cv-text)]',
                  )}
                >
                  <p>{m.text}</p>
                  <p
                    className={cn(
                      'mt-1 text-[10px]',
                      m.from === 'me' ? 'text-white/75' : 'text-[var(--cv-muted)]',
                    )}
                  >
                    {m.time}
                    {m.from === 'me' ? ' · Read' : ''}
                  </p>
                </div>
              </div>
            ))}
            <p className="text-center text-xs text-[var(--cv-muted)]">
              {user?.profile.name?.split(' ')[0] ?? 'You'} is typing… (placeholder)
            </p>
          </div>

          <footer className="border-t border-[var(--cv-border)] p-3">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                setDraft('')
              }}
            >
              <Button type="button" variant="secondary" size="sm">
                Attach
              </Button>
              <input
                className="cv-input focus-ring min-h-11 flex-1 rounded-[12px] px-3 text-sm"
                placeholder="Write a message…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                aria-label="Message"
              />
              <Button type="submit" disabled={!draft.trim()}>
                Send
              </Button>
            </form>
          </footer>
        </section>
      </div>

      <Card className="!rounded-[12px] lg:hidden">
        <p className="text-sm text-[var(--cv-muted)]">
          Tip: conversations stay linked to orders and bookings for dispute-ready history.
        </p>
      </Card>
    </div>
  )
}
