import * as React from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div>
        {label ? (
          <label htmlFor={inputId} className="cv-label">
            {label}
          </label>
        ) : null}
        <input
          id={inputId}
          className={cn(
            'cv-control',
            error && 'border-status-error',
            className
          )}
          ref={ref}
          {...props}
        />
        {error ? <p className="mt-1.5 text-xs text-status-error">{error}</p> : null}
      </div>
    )
  }
)
Input.displayName = 'Input'
