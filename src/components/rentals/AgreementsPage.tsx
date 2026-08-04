import { useMemo, useState } from 'react'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { PageHeader } from '../common/PageHeader'
import { FormInput } from '../common/FormInput'
import { Select } from '../common/Select'

const AGREEMENTS = [
  {
    id: 'AGR-8821',
    renter: 'ABC Farm',
    equipment: 'Mahindra 575 DI Tractor',
    period: '28–31 Jul 2026',
    status: 'active' as const,
    signed: true,
  },
  {
    id: 'AGR-8814',
    renter: 'Farm Ltd',
    equipment: 'John Deere Harvester W70',
    period: '25–28 Jul 2026',
    status: 'active' as const,
    signed: true,
  },
  {
    id: 'AGR-8802',
    renter: 'Green Fields Co-op',
    equipment: 'Cold store bay A',
    period: '01 Jul – 31 Aug 2026',
    status: 'pending' as const,
    signed: false,
  },
  {
    id: 'AGR-8788',
    renter: 'Sunrise Agro',
    equipment: 'Rotavator 7 ft',
    period: '10–12 Jul 2026',
    status: 'completed' as const,
    signed: true,
  },
]

export function AgreementsPage() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')

  const rows = useMemo(
    () =>
      AGREEMENTS.filter((a) => {
        const matchQ =
          !q ||
          a.id.toLowerCase().includes(q.toLowerCase()) ||
          a.renter.toLowerCase().includes(q.toLowerCase()) ||
          a.equipment.toLowerCase().includes(q.toLowerCase())
        const matchS = status === 'all' || a.status === status
        return matchQ && matchS
      }),
    [q, status],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agreements"
        subtitle="Digital rental agreements, e-signature status, and document history."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <FormInput label="Search" placeholder="Agreement ID, renter, equipment" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Awaiting signature' },
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
          ]}
        />
      </div>

      <div className="space-y-3">
        {rows.map((a) => (
          <Card key={a.id} className="!rounded-[12px]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{a.id}</p>
                  <Badge status={a.status} />
                  <Badge status={a.signed ? 'verified' : 'pending'}>
                    {a.signed ? 'E-signed' : 'Signature pending'}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-[var(--cv-muted)]">
                  {a.renter} · {a.equipment}
                </p>
                <p className="text-xs text-[var(--cv-muted)]">{a.period}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary">
                  Download PDF
                </Button>
                {!a.signed ? (
                  <Button size="sm">Send reminder</Button>
                ) : (
                  <Button size="sm" variant="ghost">
                    View history
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
