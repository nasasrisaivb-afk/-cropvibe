import { CloudIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { OverviewShell } from '../common/DataOverview'
import { Button } from '../common/Button'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/appStore'

const DAYS = [
  { day: 'Wed', date: '23', temp: '31°', rain: '20%', note: 'Haze' },
  { day: 'Thu', date: '24', temp: '29°', rain: '70%', note: 'Rain — delay field work' },
  { day: 'Fri', date: '25', temp: '28°', rain: '65%', note: 'Showers' },
  { day: 'Sat', date: '26', temp: '32°', rain: '15%', note: 'Clear' },
  { day: 'Sun', date: '27', temp: '33°', rain: '10%', note: 'Hot afternoon' },
]

export function WeatherPage() {
  const navigate = useNavigate()
  const setPage = useAppStore((s) => s.setCurrentPage)
  return (
    <OverviewShell
      title="Weather & Alerts"
      subtitle="Nagpur district · CropVibe is not a government service. IMD · updated 25 minutes ago."
    >
      <section className="mb-4 flex items-start gap-3 rounded-2xl border border-[var(--cv-warning)]/30 bg-[var(--color-warning-soft)] px-4 py-3">
        <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 text-[var(--cv-warning)]" />
        <div>
          <p className="text-sm font-semibold">Rain likely Thursday–Friday</p>
          <p className="text-sm text-[var(--cv-muted)]">
            Linked booking BK-4413 and dispatch PO-8923 fall on wet days. Reschedule via Messages if needed.
          </p>
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-5">
        {DAYS.map((d) => (
          <article key={d.date} className="cv-dashboard-panel p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cv-muted)]">
              {d.day} {d.date}
            </p>
            <CloudIcon className="mx-auto my-3 h-8 w-8 text-[var(--cv-info)]" />
            <p className="text-xl font-semibold">{d.temp}</p>
            <p className="mt-1 text-xs text-[var(--cv-muted)]">Rain {d.rain}</p>
            <p className="mt-2 text-xs text-[var(--cv-text)]">{d.note}</p>
          </article>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-[var(--cv-muted)]">Source: IMD · last updated 23 Sep 2026, 18:10 IST</p>
      <Button
        className="mt-4"
        variant="secondary"
        size="sm"
        onClick={() => {
          setPage('settings')
          navigate('/dashboard/settings')
        }}
      >
        Weather alert settings
      </Button>
    </OverviewShell>
  )
}
