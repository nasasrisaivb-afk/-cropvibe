import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/format'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
  error?: string
  helperText?: string
}

export function Select({
  label,
  options,
  error,
  helperText,
  className = '',
  id,
  required,
  ...props
}: SelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <label className="block w-full space-y-1 text-sm text-[var(--cv-muted)]" htmlFor={selectId}>
      <span className="text-[var(--cv-text)]">
        {label}
        {required ? <span className="ml-1 text-[var(--cv-danger)]">*</span> : null}
      </span>
      <select
        id={selectId}
        className={cn(
          'focus-ring cv-input w-full px-3 py-2.5 text-base md:text-sm',
          error ? 'border-[var(--cv-danger)]' : '',
          className,
        )}
        required={required}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-[var(--cv-danger)]">{error}</p> : null}
      {!error && helperText ? <p className="text-xs text-[var(--cv-muted)]">{helperText}</p> : null}
    </label>
  )
}
