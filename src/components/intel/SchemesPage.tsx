import { useState } from 'react'
import { OverviewSearch, OverviewShell, OverviewTabs, StatusPill } from '../common/DataOverview'
import { Button } from '../common/Button'

const SCHEMES = [
  {
    id: 'pmkisan',
    title: 'PM-KISAN',
    category: 'Income support',
    summary: 'Income support instalment window is open. Check status on the official site.',
    deadline: '28 Sep 2026',
    likely: true,
  },
  {
    id: 'pmfby',
    title: 'PM Fasal Bima Yojana',
    category: 'Crop insurance',
    summary: 'Crop insurance information and official apply link. CropVibe is not an authorised seller of insurance.',
    deadline: '15 Oct 2026',
    likely: true,
  },
  {
    id: 'smam',
    title: 'Sub-Mission on Agricultural Mechanisation',
    category: 'Farm mechanisation',
    summary: 'Support for custom hiring centres and machinery. Likely relevant if you rent equipment.',
    deadline: '30 Nov 2026',
    likely: true,
  },
  {
    id: 'soil',
    title: 'Soil Health Card',
    category: 'Irrigation',
    summary: 'Test soil and get a card. Useful to attach on a field report.',
    deadline: 'Rolling',
    likely: false,
  },
]

export function SchemesPage() {
  const [tab, setTab] = useState('for-you')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [checker, setChecker] = useState<'idle' | 'likely' | 'unlikely'>('idle')
  const visible = SCHEMES.filter((item) => {
    const q = query.trim().toLowerCase()
    const match = !q || item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    if (tab === 'for-you') return match && item.likely
    if (tab === 'saved') return match && item.id === 'pmkisan'
    return match
  })
  const detail = SCHEMES.find((item) => item.id === openId)

  return (
    <OverviewShell
      title="Schemes & Support"
      subtitle="CropVibe is not a government service. We show likely relevance, never a guarantee of eligibility."
    >
      <div className="cv-dashboard-panel overflow-hidden">
        <OverviewTabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'for-you', label: 'May be relevant' },
            { value: 'browse', label: 'Browse' },
            { value: 'saved', label: 'My schemes' },
          ]}
        />
        <div className="p-4">
          <OverviewSearch placeholder="Search schemes..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <ul className="divide-y divide-[var(--cv-border)]">
          {visible.map((item) => (
            <li key={item.id} className="px-5 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-[var(--cv-text)]">{item.title}</h3>
                    <StatusPill tone={item.likely ? 'info' : 'neutral'}>{item.likely ? 'Likely relevant' : item.category}</StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-[var(--cv-muted)]">{item.summary}</p>
                  <p className="mt-1 text-xs text-[var(--cv-muted)]">Deadline {item.deadline} · last verified 12 Sep 2026</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setOpenId(item.id)}>
                  View details
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {detail ? (
        <article className="cv-dashboard-panel mt-4 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cv-muted)]">{detail.category}</p>
          <h3 className="mt-1 text-xl font-semibold">{detail.title}</h3>
          <p className="mt-2 text-sm text-[var(--cv-muted)]">{detail.summary}</p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--cv-text)]">
            <li>Who it is for: farmers with land records in the opted-in state profile</li>
            <li>Documents typically needed: Aadhaar, bank, land record — confirm on the official site</li>
            <li>CropVibe cannot show live PM-KISAN payment status. Use the official beneficiary page.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setChecker('likely')}>
              Check if likely eligible
            </Button>
            <Button size="sm" variant="secondary" onClick={() => window.open('https://www.india.gov.in/', '_blank')}>
              Official site (external)
            </Button>
          </div>
          {checker !== 'idle' ? (
            <p className="mt-3 rounded-xl bg-[var(--cv-elevated)] px-3 py-2 text-sm">
              Likely eligible based on Maharashtra + land size in your profile. This is not confirmation. Always verify with
              the issuing office.
            </p>
          ) : null}
          <p className="mt-3 text-[11px] text-[var(--cv-muted)]">Source: curated scheme brief · last verified 12 Sep 2026</p>
        </article>
      ) : null}
    </OverviewShell>
  )
}
