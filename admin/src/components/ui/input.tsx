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
      <div className="space-y-1.5">
        {label ? (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        ) : null}
        <input
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-brand-lime focus:outline-none focus:ring-2 focus:ring-brand-lime disabled:cursor-not-allowed disabled:bg-bg-disabled',
            error && 'border-status-error',
            className
          )}
          ref={ref}
          {...props}
        />
        {error ? <p className="text-xs text-status-error">{error}</p> : null}
      </div>
    )
  }
)
Input.displayName = 'Input'
