'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { CreateField } from '@/lib/resources/types'

export function CreateDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  onSubmit,
  pending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fields: CreateField[]
  onSubmit: (values: Record<string, string>) => void
  pending?: boolean
}) {
  const initial = () =>
    Object.fromEntries(fields.map((f) => [f.name, f.defaultValue != null ? String(f.defaultValue) : f.options?.[0]?.value ?? '']))
  const [values, setValues] = useState<Record<string, string>>(initial)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (open) {
      setValues(initial())
      setTouched(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const errors = Object.fromEntries(
    fields.map((f) => {
      const v = values[f.name]?.trim() ?? ''
      if (f.required && !v) return [f.name, `${f.label} is required`]
      if (f.type === 'number' && v && (!Number.isFinite(Number(v)) || (f.min != null && Number(v) < f.min)))
        return [f.name, f.min != null ? `Must be ${f.min} or more` : 'Enter a number']
      return [f.name, '']
    })
  )
  const invalid = Object.values(errors).some(Boolean)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={title} description={description} className="w-[min(100%-2rem,36rem)]">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            setTouched(true)
            if (!invalid) onSubmit(values)
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {fields.map((f) => {
            const id = `create-${f.name}`
            const err = touched ? errors[f.name] : ''
            const common = {
              id,
              value: values[f.name] ?? '',
              'aria-invalid': Boolean(err),
              onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
                setValues((v) => ({ ...v, [f.name]: e.target.value })),
            }
            return (
              <div key={f.name} className={f.type === 'textarea' ? 'sm:col-span-2' : undefined}>
                <label htmlFor={id} className="cv-label">
                  {f.label}
                  {f.required ? <span className="text-status-error"> *</span> : null}
                </label>
                {f.type === 'select' ? (
                  <select {...common} className="cv-control">
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea {...common} rows={3} placeholder={f.placeholder} className="cv-control h-auto py-2" />
                ) : (
                  <input
                    {...common}
                    type={f.type}
                    min={f.min}
                    placeholder={f.placeholder}
                    className="cv-control"
                  />
                )}
                {err ? <p className="mt-1.5 text-xs text-status-error">{err}</p> : null}
              </div>
            )
          })}
          <div className="flex justify-end gap-2 pt-1 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              {title}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
