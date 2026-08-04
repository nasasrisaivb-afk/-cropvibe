import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '../../utils/format'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'
import { PageHeader } from '../common/PageHeader'

interface DamageReport {
  id: string
  bookingId: string
  equipment: string
  renter: string
  severity: 'low' | 'medium' | 'high'
  estimate: number
  status: 'open' | 'negotiating' | 'charged' | 'closed'
  note: string
}

const INITIAL: DamageReport[] = [
  {
    id: 'DMG-441',
    bookingId: 'BK-5432',
    equipment: 'Tractor #2',
    renter: 'ABC Farm',
    severity: 'medium',
    estimate: 3500,
    status: 'open',
    note: 'Minor dents on fender, headlight cracked on return.',
  },
  {
    id: 'DMG-438',
    bookingId: 'BK-5410',
    equipment: 'Boom Sprayer 400L',
    renter: 'MNO Farm',
    severity: 'low',
    estimate: 800,
    status: 'charged',
    note: 'Nozzle assembly replaced from security deposit.',
  },
  {
    id: 'DMG-420',
    bookingId: 'BK-5388',
    equipment: 'Harvester #1',
    renter: 'XYZ Inc',
    severity: 'high',
    estimate: 18500,
    status: 'negotiating',
    note: 'Belt housing damage — photos attached; awaiting renter response.',
  },
]

export function DamageReportsPage() {
  const navigate = useNavigate()
  const [reports, setReports] = useState(INITIAL)
  const [q, setQ] = useState('')

  const visible = reports.filter(
    (r) =>
      !q ||
      r.id.toLowerCase().includes(q.toLowerCase()) ||
      r.bookingId.toLowerCase().includes(q.toLowerCase()) ||
      r.equipment.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Damage claims, inspection notes, and compliance report history."
        actions={
          <Button variant="secondary" onClick={() => navigate('/dashboard/scheduling')}>
            Open scheduling
          </Button>
        }
      />

      <FormInput
        label="Search reports"
        placeholder="Report ID, booking, or equipment"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="space-y-3">
        {visible.map((r) => (
          <Card key={r.id} className="!rounded-[12px]">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{r.id}</p>
              <Badge status={r.severity} />
              <Badge
                status={
                  r.status === 'charged' || r.status === 'closed'
                    ? 'completed'
                    : r.status === 'negotiating'
                      ? 'pending'
                      : 'accepted'
                }
              >
                {r.status}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-[var(--cv-muted)]">
              {r.equipment} · {r.renter} · Booking {r.bookingId}
            </p>
            <p className="mt-2 text-sm">{r.note}</p>
            <p className="mt-2 font-semibold text-[var(--cv-accent-muted)]">
              Estimate {formatCurrency(r.estimate)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {r.status === 'open' || r.status === 'negotiating' ? (
                <>
                  <Button
                    size="sm"
                    onClick={() =>
                      setReports((prev) =>
                        prev.map((x) => (x.id === r.id ? { ...x, status: 'charged' } : x)),
                      )
                    }
                  >
                    Charge deposit
                  </Button>
                  <Button size="sm" variant="secondary">
                    Upload photos
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="ghost">
                  View receipt
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
