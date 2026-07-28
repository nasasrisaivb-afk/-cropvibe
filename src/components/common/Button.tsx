import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { Role } from '../../types/roles'
import { cn } from '../../utils/format'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  /** Kept for API compat; primary CTA uses brand lime on dark */
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
    sm: 'min-h-9 px-3 py-1.5 text-sm',
    md: 'min-h-11 px-4 py-2 text-sm',
    lg: 'min-h-12 px-5 py-3 text-base',
  }

  const base = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus-ring disabled:cursor-not-allowed disabled:opacity-50',
    sizes[size],
    fullWidth && 'w-full',
    className,
  )

  if (variant === 'primary') {
    return (
      <button
        className={cn(base, 'hover:brightness-110')}
        disabled={disabled || loading}
        style={{
          backgroundColor: 'var(--cv-btn-bg)',
          color: 'var(--cv-btn-text)',
          border: '1px solid rgba(201,255,53,0.25)',
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
        className={cn(base, 'bg-[var(--cv-danger)] text-[var(--cv-btn-bg)] hover:brightness-110')}
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
        className={cn(base, 'border border-[var(--cv-accent)]/40 bg-transparent hover:bg-[var(--cv-accent-soft)]')}
        disabled={disabled || loading}
        style={{ color: 'var(--cv-accent)', ...style }}
        {...props}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      className={cn(base, 'bg-transparent text-[var(--cv-muted)] hover:bg-[var(--cv-elevated)] hover:text-[var(--cv-text)]')}
      disabled={disabled || loading}
      style={style}
      {...props}
    >
      {children}
    </button>
  )
}
