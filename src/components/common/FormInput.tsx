import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/format'

type Base = {
  label: string
  error?: string
  helperText?: string
  required?: boolean
}

type InputProps = Base &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
    as?: 'input'
  }

type TextareaProps = Base &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
    as: 'textarea'
  }

export type FormInputProps = InputProps | TextareaProps

export function FormInput(props: FormInputProps) {
  const { label, error, helperText, required, id } = props
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  const fieldClass = cn(
    'focus-ring cv-input w-full rounded-md px-3 py-3 text-base md:py-2 md:text-sm min-h-12 md:min-h-10',
    error ? 'border-[var(--cv-danger)]' : '',
  )

  return (
    <div className="block w-full space-y-1 text-sm text-[var(--cv-muted)]">
      <label className="text-[var(--cv-text)]" htmlFor={inputId}>
        {label}
        {required ? <span className="ml-1 text-[var(--cv-danger)]">*</span> : null}
      </label>
      {props.as === 'textarea' ? (
        <textarea
          id={inputId}
          className={cn(fieldClass, 'min-h-[120px] resize-y')}
          value={props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
          required={required}
          disabled={props.disabled}
          rows={4}
        />
      ) : (
        <input
          id={inputId}
          className={fieldClass}
          type={props.type ?? 'text'}
          value={props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
          required={required}
          disabled={props.disabled}
          maxLength={props.maxLength}
          minLength={props.minLength}
          min={props.min}
          max={props.max}
        />
      )}
      {error ? <p className="text-xs text-[var(--cv-danger)]">{error}</p> : null}
      {!error && helperText ? <p className="text-xs text-[var(--cv-muted)]">{helperText}</p> : null}
    </div>
  )
}

export function FormTextarea(props: Omit<TextareaProps, 'as'>) {
  return <FormInput {...props} as="textarea" />
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
}: {
  icon?: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--cv-border)] bg-[var(--cv-surface)] px-6 py-12 text-center">
      <span className="text-4xl">{icon}</span>
      <h3 className="mt-4 text-lg font-semibold text-[var(--cv-text)]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-[var(--cv-muted)]">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
