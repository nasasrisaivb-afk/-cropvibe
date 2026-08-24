import { useEffect, useMemo, useState } from 'react'
import { Button } from '../common/Button'
import { Sheet } from '../common/Sheet'
import { formatCurrency } from '../../utils/format'
import { ServiceAvailabilityCalendar } from './ServiceAvailabilityCalendar'
import { generateAvailability } from './serviceCatalogUtils'
import type { ServiceAvailabilityDay } from './serviceCatalogTypes'
import type { ServiceItem } from './serviceCatalogTypes'

interface Props {
  open: boolean
  service: ServiceItem | null
  onClose: () => void
  onConfirm: (payload: { date: string; time: string; notes: string }) => void | Promise<void>
}

export function ServiceBookingSheet({ open, service, onClose, onConfirm }: Props) {
  const [step, setStep] = useState(1)
  const [selectedDay, setSelectedDay] = useState<ServiceAvailabilityDay | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const availability = useMemo(
    () => (service ? generateAvailability(service.id) : []),
    [service],
  )

  const availableDays = availability.filter((d) => d.available)

  const reset = () => {
    setStep(1)
    setSelectedDay(null)
    setSelectedTime(null)
    setNotes('')
    setSubmitting(false)
    setSubmitError(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  useEffect(() => {
    if (!open) reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!service) return null

  const title =
    step === 4 ? 'Booking confirmed' : `Book ${service.title} — Step ${step} of 3`

  const progress = step === 4 ? 100 : Math.round((step / 3) * 100)

  const handleConfirm = async () => {
    if (!selectedDay || !selectedTime) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onConfirm({
        date: `${selectedDay.label} (${selectedDay.weekday})`,
        time: selectedTime,
        notes,
      })
      setStep(4)
    } catch {
      setSubmitError('Booking failed. This slot may have been taken. Try another time.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} title={title} onClose={handleClose}>
      {step < 4 ? (
        <div className="mb-4">
          <div
            className="h-1.5 overflow-hidden rounded-full bg-[var(--cv-border)]"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-[var(--cv-primary)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-[var(--cv-muted)]">Step {step} of 3</p>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--cv-muted)]">Select a date from the next 30 days</p>
          {availableDays.length === 0 ? (
            <div className="rounded-[12px] border border-[var(--cv-border)] p-4 text-center text-sm text-[var(--cv-muted)]">
              <p>This consultant is fully booked.</p>
              <Button className="mt-3" size="sm" variant="secondary" onClick={handleClose}>
                Browse similar services
              </Button>
            </div>
          ) : (
            <ServiceAvailabilityCalendar
              days={availability}
              selectedIso={selectedDay?.iso ?? null}
              onSelect={setSelectedDay}
            />
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={!selectedDay} onClick={() => setStep(2)}>
              Next: Select time
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--cv-muted)]">
            {selectedDay?.label} — pick a time slot
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Time slots">
            {(selectedDay?.times ?? []).map((time) => (
              <button
                key={time}
                type="button"
                aria-pressed={selectedTime === time}
                className={`focus-ring cv-touch min-h-[44px] rounded-[10px] border px-3 py-2.5 text-sm font-medium ${
                  selectedTime === time
                    ? 'border-[var(--cv-primary)] bg-[var(--cv-primary)]/10'
                    : 'border-[var(--cv-border)] hover:border-[var(--cv-primary)]'
                }`}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
          <div className="flex justify-between gap-2 pt-2">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button disabled={!selectedTime} onClick={() => setStep(3)}>
              Next: Review
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <div className="rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4 text-sm">
            <p className="font-semibold text-[var(--cv-text)]">{service.title}</p>
            <p className="mt-1 text-[var(--cv-muted)]">With {service.provider}</p>
            <p className="mt-2">
              {selectedDay?.label} at {selectedTime}
              {service.durationMinutes > 0 ? ` · ${service.durationMinutes} min` : ''}
            </p>
            <p className="mt-2 text-lg font-bold text-[var(--cv-primary)]">
              {formatCurrency(service.rate)}
              <span className="text-sm font-medium text-[var(--cv-muted)]"> / {service.unit}</span>
            </p>
            <p className="mt-1 text-xs text-[var(--cv-muted)]">{service.cancellationPolicy}</p>
          </div>
          <label className="block text-sm">
            <span className="font-medium text-[var(--cv-text)]">Notes (optional)</span>
            <textarea
              id="booking-notes"
              className="focus-ring mt-1.5 w-full rounded-[10px] border border-[var(--cv-border)] bg-[var(--cv-bg)] px-3 py-2 text-sm"
              placeholder="Crop type, farm size, or questions"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          {submitError ? (
            <p className="text-sm text-[var(--cv-danger,#f44336)]" role="alert">
              {submitError}
            </p>
          ) : null}
          <div className="flex justify-between gap-2 pt-2">
            <Button variant="secondary" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button loading={submitting} onClick={handleConfirm}>
              Confirm booking
            </Button>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4 text-center">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--cv-success,#4CAF50)]/15 text-2xl"
            aria-hidden
          >
            ✓
          </div>
          <p className="text-lg font-semibold text-[var(--cv-text)]">Booking confirmed</p>
          <p className="text-sm text-[var(--cv-muted)]">
            Your session with {service.provider} is on {selectedDay?.label} at {selectedTime}.
          </p>
          <Button variant="secondary" onClick={handleClose}>
            Done
          </Button>
        </div>
      ) : null}
    </Sheet>
  )
}
