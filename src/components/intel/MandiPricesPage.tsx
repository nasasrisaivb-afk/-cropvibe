import { useState } from 'react'
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'
import { OverviewShell, OverviewTabs } from '../common/DataOverview'
import { Button } from '../common/Button'

const WATCHLIST = [
  { crop: 'Tomato', mandi: 'Nagpur', modal: 2140, min: 1980, max: 2280, change: 3.2 },
  { crop: 'Potato', mandi: 'Pune', modal: 1260, min: 1180, max: 1340, change: 4.1 },
  { crop: 'Onion', mandi: 'Lasalgaon', modal: 1420, min: 1280, max: 1550, change: -2.4 },
  { crop: 'Soybean', mandi: 'Wardha', modal: 4320, min: 4180, max: 4460, change: 0.6 },
]

export function MandiPricesPage() {
  const [tab, setTab] = useState('watch')
  return (
    <OverviewShell
      title="Mandi Prices"
      subtitle="CropVibe is not a government service. Prices from AGMARKNET · last updated 2 hours ago."
    >
      <div className="cv-dashboard-panel overflow-hidden">
        <OverviewTabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'watch', label: 'My crops' },
            { value: 'alerts', label: 'Price alerts' },
          ]}
        />
        {tab === 'watch' ? (
          <ul className="divide-y divide-[var(--cv-border)]">
            {WATCHLIST.map((row) => {
              const up = row.change >= 0
              const Trend = up ? ArrowTrendingUpIcon : ArrowTrendingDownIcon
              return (
                <li key={row.crop} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-[var(--cv-text)]">
                      {row.crop} · {row.mandi} mandi
                    </p>
                    <p className="text-xs text-[var(--cv-muted)]">
                      Min ₹{row.min.toLocaleString('en-IN')} · Max ₹{row.max.toLocaleString('en-IN')} / qtl
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold tabular-nums">₹ {row.modal.toLocaleString('en-IN')}</p>
                    <p className="inline-flex items-center gap-1 text-xs text-[var(--cv-muted)]">
                      <Trend className="h-3.5 w-3.5" />
                      {up ? '↑' : '↓'} {Math.abs(row.change)}% · 7-day
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="space-y-4 p-5">
            <p className="text-sm text-[var(--cv-muted)]">
              Alert when tomato at Nagpur is above ₹2,300 / qtl. Channel follows Settings → Notifications.
            </p>
            <Button size="sm">Add price alert</Button>
          </div>
        )}
        <p className="border-t border-[var(--cv-border)] px-5 py-3 text-[11px] text-[var(--cv-muted)]">
          Source: AGMARKNET via data.gov.in · last updated 23 Sep 2026, 16:10 IST
        </p>
      </div>
    </OverviewShell>
  )
}
