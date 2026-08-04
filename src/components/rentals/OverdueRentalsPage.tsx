import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '../../utils/format'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { PageHeader } from '../common/PageHeader'

const OVERDUE = [
  {
    id: 'BK-5419',
    equipment: 'Tractor #1',
    renter: 'Farm Ltd',
    due: 'Yesterday 6:00 PM',
    lateHours: 18,
    lateFee: 750,
    phone: '+91 98XXX 44120',
  },
  {
    id: 'BK-5401',
    equipment: 'Power Tiller VST',
    renter: 'Village Co-op',
    due: '2 days ago',
    lateHours: 46,
    lateFee: 1800,
    phone: '+91 98XXX 22011',
  },
]

export function OverdueRentalsPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overdue rentals"
        subtitle="Late returns, accrued fees, and escalation actions."
        actions={
          <Button variant="secondary" onClick={() => navigate('/dashboard/scheduling')}>
            All scheduling
          </Button>
        }
      />

      {OVERDUE.length === 0 ? (
        <Card className="!rounded-[12px] py-12 text-center">
          <p className="text-lg font-semibold">No overdue rentals</p>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">All equipment returned on time.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {OVERDUE.map((o) => (
            <Card key={o.id} className="!rounded-[12px] border-[var(--cv-danger)]/20">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{o.id}</p>
                <Badge status="rejected">Overdue</Badge>
              </div>
              <p className="mt-2 text-sm text-[var(--cv-muted)]">
                {o.equipment} · {o.renter}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3 text-sm">
                <div>
                  <p className="text-xs text-[var(--cv-muted)]">Was due</p>
                  <p className="font-medium">{o.due}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--cv-muted)]">Late by</p>
                  <p className="font-medium">{o.lateHours} hours</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--cv-muted)]">Late fee so far</p>
                  <p className="font-medium text-[var(--cv-danger)]">{formatCurrency(o.lateFee)}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm">Call renter</Button>
                <Button size="sm" variant="secondary">
                  Send SMS reminder
                </Button>
                <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/messages')}>
                  Message
                </Button>
                <Button size="sm" variant="danger">
                  Escalate
                </Button>
              </div>
              <p className="mt-2 text-xs text-[var(--cv-muted)]">Contact: {o.phone}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
