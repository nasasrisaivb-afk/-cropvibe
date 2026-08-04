import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { Role } from '../../types/roles'
import { cn } from '../../utils/format'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
  /** Kept for API compat; accent is brand lime */
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
    sm: 'min-h-9 px-3 py-1.5 text-[13px] rounded-[8px]',
    md: 'min-h-11 px-4 py-2 text-sm rounded-[8px]',
    lg: 'min-h-12 px-5 py-3 text-base rounded-[8px]',
  }

  const base = cn(
    'cv-pressable inline-flex items-center justify-center gap-2 font-semibold transition-[background-color,color,box-shadow,transform,opacity] duration-150 ease-out focus-ring disabled:cursor-not-allowed disabled:opacity-45',
    sizes[size],
    fullWidth && 'w-full',
    className,
  )

  if (variant === 'primary' || variant === 'accent') {
    return (
      <button
        className={cn(base, 'hover:brightness-95 active:brightness-90')}
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

  if (variant === 'danger') {
    return (
      <button
        className={cn(
          base,
          'bg-[rgba(248,113,113,0.14)] text-[var(--cv-danger)] hover:bg-[rgba(248,113,113,0.22)]',
        )}
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
          'border border-[var(--cv-border)] bg-[var(--cv-surface)] text-[var(--cv-text)] hover:bg-[var(--cv-elevated)]',
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
        'bg-transparent text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)] hover:text-[var(--cv-primary)]',
      )}
      disabled={disabled || loading}
      style={style}
      {...props}
    >
      {children}
    </button>
  )
}
