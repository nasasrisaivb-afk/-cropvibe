import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/appStore'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { PageHeader } from '../common/PageHeader'
import { cn } from '../../utils/format'

type DayStatus = 'available' | 'booked' | 'blocked' | 'maintenance'

const STATUS_STYLE: Record<DayStatus, string> = {
  available: 'cv-cal-available border',
  booked: 'cv-cal-booked border',
  blocked: 'cv-cal-blocked border',
  maintenance: 'cv-cal-maintenance border',
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

      <Card className="!rounded-[12px]">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setCursor((c) => {
                const d = new Date(c.y, c.m - 1, 1)
                return { y: d.getFullYear(), m: d.getMonth() }
              })
            }
          >
            ← Prev
          </Button>
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setCursor((c) => {
                const d = new Date(c.y, c.m + 1, 1)
                return { y: d.getFullYear(), m: d.getMonth() }
              })
            }
          >
            Next →
          </Button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium uppercase tracking-wide text-[var(--cv-muted)]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, idx) =>
            cell.day == null ? (
              <div key={`e-${idx}`} className="min-h-16 rounded-[10px] bg-transparent" />
            ) : (
              <button
                key={cell.day}
                type="button"
                title={cell.note}
                className={cn(
                  'min-h-16 rounded-[10px] border p-2 text-left transition hover:brightness-95',
                  STATUS_STYLE[cell.status ?? 'available'],
                )}
              >
                <span className="text-sm font-semibold">{cell.day}</span>
                {cell.note ? (
                  <span className="mt-1 block truncate text-[10px] opacity-80">{cell.note}</span>
                ) : null}
              </button>
            ),
          )}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ['available', 'Available'],
            ['booked', 'Booked'],
            ['maintenance', 'Maintenance'],
            ['blocked', 'Blocked'],
          ] as const
        ).map(([key, label]) => (
          <div
            key={key}
            className={cn('rounded-[12px] border px-3 py-2 text-sm font-medium', STATUS_STYLE[key])}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
