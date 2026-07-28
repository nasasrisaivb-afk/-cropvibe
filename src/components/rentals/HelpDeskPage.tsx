import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput, FormTextarea } from '../common/FormInput'
import { Select } from '../common/Select'

const FAQ = [
  {
    q: 'When is my security deposit released?',
    a: 'After return verification with no damage, deposits refund within 1–2 business days to the original payment method or wallet.',
  },
  {
    q: 'How do unpaid bookings expire?',
    a: 'Unpaid booking holds auto-expire after 30 minutes so calendar slots reopen for other renters.',
  },
  {
    q: 'What documents are needed for KYC?',
    a: 'Aadhaar, PAN, and equipment ownership proof (for machinery). Insurance certificate is recommended.',
  },
]

const TICKETS = [
  { id: 'TCK-901', subject: 'Payout delayed beyond SLA', status: 'in progress' as const, sla: '4h left' },
  { id: 'TCK-884', subject: 'Listing moderation question', status: 'resolved' as const, sla: 'Closed' },
]

export function HelpDeskPage() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('payouts')
  const [body, setBody] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Help desk</h1>
        <p className="mt-1 text-sm text-[var(--cv-muted)]">
          FAQ, tickets, and live support for rental providers.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="!rounded-[12px]" title="Frequently asked">
          <ul className="space-y-4">
            {FAQ.map((f) => (
              <li key={f.q}>
                <p className="font-semibold text-[var(--cv-text)]">{f.q}</p>
                <p className="mt-1 text-sm text-[var(--cv-muted)]">{f.a}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="!rounded-[12px]" title="Create support ticket">
          {submitted ? (
            <div className="rounded-[12px] bg-[var(--cv-primary-soft)] px-4 py-3 text-sm text-[var(--cv-primary)]">
              Ticket submitted. Typical first response within 2 business hours.
            </div>
          ) : (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                setSubmitted(true)
              }}
            >
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'payouts', label: 'Payouts & wallet' },
                  { value: 'bookings', label: 'Bookings & calendar' },
                  { value: 'kyc', label: 'KYC & verification' },
                  { value: 'damage', label: 'Damage & deposits' },
                  { value: 'other', label: 'Other' },
                ]}
              />
              <FormInput
                label="Subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Short summary of the issue"
              />
              <FormTextarea
                label="Description"
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Include booking IDs, dates, and what you already tried."
              />
              <Button type="submit" disabled={!subject.trim() || body.trim().length < 20}>
                Submit ticket
              </Button>
            </form>
          )}
        </Card>
      </div>

      <Card className="!rounded-[12px]" title="Your tickets">
        <ul className="space-y-3">
          {TICKETS.map((t) => (
            <li
              key={t.id}
              className="flex flex-col gap-2 rounded-[12px] bg-[var(--cv-elevated)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">
                  {t.id} · {t.subject}
                </p>
                <p className="text-xs text-[var(--cv-muted)]">SLA: {t.sla}</p>
              </div>
              <Badge status={t.status === 'resolved' ? 'completed' : 'pending'}>{t.status}</Badge>
            </li>
          ))}
        </ul>
        <Button className="mt-4" size="sm" variant="secondary" onClick={() => navigate('/dashboard/messages')}>
          Open live chat placeholder
        </Button>
      </Card>
    </div>
  )
}
