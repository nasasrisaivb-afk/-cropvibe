import { useMemo } from 'react'
import type { ServiceAvailabilityDay } from './serviceCatalogTypes'

interface Props {
  days: ServiceAvailabilityDay[]
  selectedIso: string | null
  onSelect: (day: ServiceAvailabilityDay) => void
  ariaLabel?: string
}

export function ServiceAvailabilityCalendar({
  days,
  selectedIso,
  onSelect,
  ariaLabel = 'Select an available date',
}: Props) {
  const weeks = useMemo(() => {
    const rows: ServiceAvailabilityDay[][] = []
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7))
    }
    return rows
  }, [days])

  return (
    <div aria-label={ariaLabel} className="space-y-2" role="group">
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-[var(--cv-muted)]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-1">
          {week.map((day) => {
            const selected = selectedIso === day.iso
            const disabled = !day.available
            return (
              <button
                key={day.iso}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                aria-label={`${day.weekday} ${day.label}${day.available ? ', available' : ', unavailable'}`}
                className={`focus-ring cv-touch flex min-h-[52px] flex-col items-center justify-center rounded-[10px] border text-xs transition-colors ${
                  selected
                    ? 'border-[var(--cv-primary)] bg-[var(--cv-primary)]/15 font-semibold text-[var(--cv-text)]'
                    : disabled
                      ? 'cursor-not-allowed border-[var(--cv-border)]/50 bg-[var(--cv-surface)]/50 text-[var(--cv-muted)]/50'
                      : 'border-[var(--cv-border)] bg-[var(--cv-surface)] text-[var(--cv-text)] hover:border-[var(--cv-primary)]'
                }`}
                onClick={() => onSelect(day)}
              >
                <span className="text-[10px] text-[var(--cv-muted)]">{day.weekday}</span>
                <span>{day.label.split(' ')[1] ?? day.label}</span>
              </button>
            )
          })}
          {week.length < 7
            ? Array.from({ length: 7 - week.length }).map((_, i) => (
                <span key={`pad-${i}`} aria-hidden className="min-h-[52px]" />
              ))
            : null}
        </div>
      ))}
      <p className="text-xs text-[var(--cv-muted)]">
        <span className="inline-block h-2 w-2 rounded-full bg-[var(--cv-primary)]" aria-hidden /> Available
        {' · '}
        <span className="inline-block h-2 w-2 rounded-full bg-[var(--cv-border)]" aria-hidden /> Unavailable
      </p>
    </div>
  )
}
