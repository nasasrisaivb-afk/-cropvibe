import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/appStore'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { PageHeader } from '../common/PageHeader'
import { cn } from '../../utils/format'

type DayStatus = 'available' | 'booked' | 'blocked' | 'maintenance'

const EVENT_CHIP: Record<DayStatus, string> = {
  available: '',
  booked: 'bg-[var(--color-info-soft)] text-[var(--cv-info)]',
  blocked: 'bg-[var(--cv-elevated)] text-[var(--cv-muted)]',
  maintenance: 'bg-[var(--color-warning-soft)] text-[var(--cv-warning)]',
}

function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: { day: number | null; status?: DayStatus; note?: string }[] = []
  for (let i = 0; i < startPad; i++) cells.push({ day: null })
  for (let d = 1; d <= daysInMonth; d++) {
    let status: DayStatus = 'available'
    let note: string | undefined
    if ([3, 4, 5, 12, 18, 19].includes(d)) {
      status = 'booked'
      note = d === 3 ? 'Tractor #1 · ABC Farm' : undefined
    } else if ([8, 9].includes(d)) {
      status = 'maintenance'
      note = 'Service window'
    } else if ([22, 23].includes(d)) {
      status = 'blocked'
      note = 'Owner blocked'
    }
    cells.push({ day: d, status, note })
  }
  return cells
}

export function CalendarPage() {
  const navigate = useNavigate()
  const role = useAppStore((s) => s.user?.activeRole ?? 'rental')
  const now = new Date()
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const cells = useMemo(() => buildMonth(cursor.y, cursor.m), [cursor])
  const title = new Date(cursor.y, cursor.m, 1).toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  const isService = role === 'service'
  const isEducator = role === 'educator'

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          isService ? 'Services / Calendar' : isEducator ? 'Courses / Schedule' : 'Bookings / Calendar'
        }
        title={
          isService ? 'Appointment calendar' : isEducator ? 'Course schedule' : 'Availability calendar'
        }
        subtitle={
          isService
            ? 'Confirm slots, buffer travel time, and avoid double bookings.'
            : isEducator
              ? 'Track live sessions, enrollment windows, and workshops.'
              : 'Green = available · Blue = booked · Amber = maintenance · Gray = blocked'
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate(role === 'rental' ? '/dashboard/scheduling' : '/dashboard/bookings')}
            >
              {role === 'rental' ? 'Open scheduling' : 'View bookings'}
            </Button>
            <Button onClick={() => navigate('/dashboard/create')}>
              {isService ? 'Set availability' : '+ Block dates'}
            </Button>
          </div>
        }
      />

      <Card className="!rounded-[24px] !border-[var(--cv-border)] !p-5 sm:!p-6 !shadow-none">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous month"
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-[var(--cv-border)] text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)] hover:text-[var(--cv-text)]"
              onClick={() =>
                setCursor((c) => {
                  const d = new Date(c.y, c.m - 1, 1)
                  return { y: d.getFullYear(), m: d.getMonth() }
                })
              }
            >
              ←
            </button>
            <h2 className="min-w-[10rem] text-center text-lg font-semibold tracking-tight text-[var(--cv-text)] sm:text-xl">
              {title}
            </h2>
            <button
              type="button"
              aria-label="Next month"
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-[var(--cv-border)] text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)] hover:text-[var(--cv-text)]"
              onClick={() =>
                setCursor((c) => {
                  const d = new Date(c.y, c.m + 1, 1)
                  return { y: d.getFullYear(), m: d.getMonth() }
                })
              }
            >
              →
            </button>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="!rounded-full"
            onClick={() => setCursor({ y: now.getFullYear(), m: now.getMonth() })}
          >
            Today
          </Button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-px text-center text-[11px] font-medium text-[var(--cv-muted)]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-[16px] border border-[var(--cv-border)] bg-[var(--cv-border)]">
          <div className="grid grid-cols-7 gap-px">
            {cells.map((cell, idx) => {
              const status = cell.status ?? 'available'
              const isToday =
                cell.day != null &&
                cell.day === now.getDate() &&
                cursor.m === now.getMonth() &&
                cursor.y === now.getFullYear()

              if (cell.day == null) {
                return (
                  <div
                    key={`e-${idx}`}
                    className="min-h-[4.75rem] bg-[var(--cv-surface)] sm:min-h-[5.5rem]"
                  />
                )
              }

              return (
                <button
                  key={cell.day}
                  type="button"
                  title={cell.note}
                  className="focus-ring flex min-h-[4.75rem] flex-col gap-1 bg-[var(--cv-surface)] p-2 text-left transition hover:bg-[var(--cv-elevated)]/60 sm:min-h-[5.5rem] sm:p-2.5"
                >
                  <span
                    className={cn(
                      'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                      isToday ? 'bg-[var(--cv-nav-active-fg)] text-[var(--cv-nav-active-bg)]' : 'text-[var(--cv-text)]',
                    )}
                  >
                    {cell.day}
                  </span>
                  {cell.note ? (
                    <span
                      className={cn(
                        'mt-auto truncate rounded-lg px-1.5 py-1 text-[10px] font-medium leading-tight',
                        EVENT_CHIP[status] || 'bg-[var(--cv-elevated)] text-[var(--cv-muted)]',
                      )}
                    >
                      {cell.note}
                    </span>
                  ) : status !== 'available' ? (
                    <span
                      className={cn(
                        'mt-auto h-1.5 w-full rounded-full',
                        status === 'booked' && 'bg-[var(--cv-info)]',
                        status === 'maintenance' && 'bg-[var(--cv-warning)]',
                        status === 'blocked' && 'bg-[var(--cv-muted)]',
                        status === 'blocked' && 'bg-[var(--cv-muted)]/35',
                      )}
                      aria-hidden
                    />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['available', 'Available'],
            ['booked', 'Booked'],
            ['maintenance', 'Maintenance'],
            ['blocked', 'Blocked'],
          ] as const
        ).map(([key, label]) => (
          <span
            key={key}
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
              key === 'available'
                ? 'bg-[var(--cv-elevated)] text-[var(--cv-muted)]'
                : EVENT_CHIP[key],
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
