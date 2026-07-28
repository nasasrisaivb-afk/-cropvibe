import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { Role } from '../../types/roles'
import { cn } from '../../utils/format'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
  /** Kept for API compat; primary uses brand green */
  roleColor?: Role
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  roleColor: _roleColor,
  ...props
}: ButtonProps) {
  void _roleColor
  const sizes = {
    sm: 'min-h-9 px-3 py-1.5 text-sm rounded-[10px]',
    md: 'min-h-11 px-4 py-2 text-sm rounded-[12px]',
    lg: 'min-h-12 px-5 py-3 text-base rounded-[12px]',
  }

  const base = cn(
    'inline-flex items-center justify-center gap-2 font-semibold transition focus-ring disabled:cursor-not-allowed disabled:opacity-50',
    sizes[size],
    fullWidth && 'w-full',
    className,
  )

  if (variant === 'primary') {
    return (
      <button
        className={cn(base, 'hover:brightness-105 active:brightness-95')}
        disabled={disabled || loading}
        style={{
          backgroundColor: 'var(--cv-btn-bg)',
          color: 'var(--cv-btn-text)',
          ...style,
        }}
        {...props}
      >
        {loading ? 'Please wait...' : children}
      </button>
    )
  }

  if (variant === 'accent') {
    return (
      <button
        className={cn(base, 'hover:brightness-105 active:brightness-95')}
        disabled={disabled || loading}
        style={{
          backgroundColor: 'var(--cv-accent)',
          color: 'var(--cv-btn-text)',
          ...style,
        }}
        {...props}
      >
        {loading ? 'Please wait...' : children}
      </button>
    )
  }

  if (variant === 'danger') {
    return (
      <button
        className={cn(base, 'bg-[var(--cv-danger)] text-white hover:brightness-110')}
        disabled={disabled || loading}
        style={style}
        {...props}
      >
        {loading ? 'Please wait...' : children}
      </button>
    )
  }

  if (variant === 'secondary') {
    return (
      <button
        className={cn(
          base,
          'border border-[var(--cv-primary)]/30 bg-[var(--cv-surface)] text-[var(--cv-primary)] hover:bg-[var(--cv-primary-soft)]',
        )}
        disabled={disabled || loading}
        style={style}
        {...props}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      className={cn(
        base,
        'bg-transparent text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)] hover:text-[var(--cv-text)]',
      )}
      disabled={disabled || loading}
      style={style}
      {...props}
    >
      {children}
    </button>
  )
}
