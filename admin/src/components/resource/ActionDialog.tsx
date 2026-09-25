'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { ActionInput, ResourceAction } from '@/lib/resources/types'
import { formatInr } from '@/lib/utils'

/**
 * Confirmation step for every state-changing action (error prevention).
 * Destructive actions require a reason, which is written to the audit log.
 */
export function ActionDialog<T>({
  action,
  rows,
  open,
  onOpenChange,
  onConfirm,
  pending,
}: {
  action: ResourceAction<T> | null
  rows: T[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (input: ActionInput) => void
  pending?: boolean
}) {
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [choice, setChoice] = useState('')
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState<string>('')
  const [touched, setTouched] = useState(false)

  const cfg = action?.confirm
  const first = rows[0]

  useEffect(() => {
    if (!open) return
    setReason('')
    setNote('')
    setTouched(false)
    setChoice(cfg?.choice?.defaultValue ?? cfg?.choice?.options[0]?.value ?? '')
    setDate('')
    setAmount(cfg?.amount?.defaultValue && first ? String(cfg.amount.defaultValue(first)) : '')
  }, [open, cfg, first])

  if (!action || !first) return null

  const title =
    typeof cfg?.title === 'function' ? cfg.title(first) : cfg?.title ?? action.label
  const description =
    typeof cfg?.description === 'function' ? cfg.description(first) : cfg?.description
  const bulk = rows.length > 1
  const showDate = cfg?.date && (!cfg.date.showWhenChoice || cfg.date.showWhenChoice === choice)
  const maxAmount = cfg?.amount?.max ? cfg.amount.max(first) : undefined
  const amountNum = Number(amount)

  const errors = {
    reason: cfg?.reasonRequired && !reason.trim() ? 'A reason is required and is shared in the audit log.' : '',
    date: showDate && !date ? 'Pick an end date.' : '',
    amount:
      cfg?.amount && (!amount || !Number.isFinite(amountNum) || amountNum <= 0)
        ? 'Enter an amount greater than zero.'
        : cfg?.amount && maxAmount != null && amountNum > maxAmount
          ? `Cannot exceed ${formatInr(maxAmount)}.`
          : '',
  }
  const invalid = Object.values(errors).some(Boolean)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (invalid) return
    onConfirm({
      reason: reason.trim() || undefined,
      note: note.trim() || undefined,
      choice: choice || undefined,
      date: showDate ? date : undefined,
      amount: cfg?.amount ? amountNum : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={bulk ? `${action.label} · ${rows.length} records` : title}
        description={bulk ? 'This will apply to every selected record.' : description}
        className="w-[min(100%-2rem,32rem)]"
      >
        <form onSubmit={submit} className="space-y-4" noValidate>
          {cfg?.destructive ? (
            <div className="flex gap-2.5 rounded-lg border border-status-error/30 bg-status-error/10 p-3 text-sm text-text-primary">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-error" aria-hidden />
              <p>The affected users are notified, and the action is recorded against your name.</p>
            </div>
          ) : null}

          {cfg?.choice ? (
            <fieldset>
              <legend className="cv-label">{cfg.choice.label}</legend>
              <div className="grid grid-cols-2 gap-2">
                {cfg.choice.options.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 text-sm transition ${
                      choice === opt.value
                        ? 'border-brand-lime bg-brand-lime/10 text-text-primary'
                        : 'border-border-default text-text-secondary hover:border-border-strong'
                    }`}
                  >
                    <input
                      type="radio"
                      name="choice"
                      value={opt.value}
                      checked={choice === opt.value}
                      onChange={() => setChoice(opt.value)}
                      className="accent-brand-lime"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          {showDate ? (
            <div>
              <label htmlFor="action-date" className="cv-label">
                {cfg!.date!.label}
              </label>
              <input
                id="action-date"
                type="date"
                value={date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDate(e.target.value)}
                className="cv-control"
              />
              {touched && errors.date ? <p className="mt-1.5 text-xs text-status-error">{errors.date}</p> : null}
            </div>
          ) : null}

          {cfg?.amount ? (
            <div>
              <label htmlFor="action-amount" className="cv-label">
                {cfg.amount.label}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
                  ₹
                </span>
                <input
                  id="action-amount"
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="cv-control pl-7"
                />
              </div>
              {maxAmount != null ? (
                <p className="mt-1.5 text-xs text-text-muted">Maximum {formatInr(maxAmount)}</p>
              ) : null}
              {touched && errors.amount ? <p className="mt-1 text-xs text-status-error">{errors.amount}</p> : null}
            </div>
          ) : null}

          {cfg?.reasonOptions || cfg?.reasonRequired || cfg?.reasonLabel ? (
            <div>
              <label htmlFor="action-reason" className="cv-label">
                {cfg?.reasonLabel ?? 'Reason'}
                {cfg?.reasonRequired ? <span className="text-status-error"> *</span> : null}
              </label>
              {cfg?.reasonOptions ? (
                <select
                  id="action-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="cv-control"
                >
                  <option value="">Select a reason…</option>
                  {cfg.reasonOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              ) : cfg?.reasonMultiline ? (
                <textarea
                  id="action-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={5}
                  className="cv-control h-auto resize-y py-2"
                />
              ) : (
                <input
                  id="action-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="cv-control"
                  placeholder="Short reason visible to the team"
                />
              )}
              {touched && errors.reason ? <p className="mt-1.5 text-xs text-status-error">{errors.reason}</p> : null}
            </div>
          ) : null}

          {cfg?.hideNote ? null : (
          <div>
            <label htmlFor="action-note" className="cv-label">
              {cfg?.noteLabel ?? 'Internal note'} <span className="font-normal text-text-muted">(optional)</span>
            </label>
            <textarea
              id="action-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={cfg?.notePlaceholder ?? 'Context for other admins — not shown to the user'}
              className="cv-control h-auto resize-y py-2"
            />
          </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant={cfg?.destructive ? 'danger' : 'primary'} loading={pending}>
              {cfg?.confirmLabel ?? action.label}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
