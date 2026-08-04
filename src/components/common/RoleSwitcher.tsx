import { ROLE_LABELS } from '../../config/navigation'
import { useAppStore } from '../../store/appStore'
import type { Role } from '../../types/roles'
import { ROLE_ICONS } from '../../types/roles'
import { cn } from '../../utils/format'

interface RoleSwitcherProps {
  /** Compact list for sheets / menus */
  compact?: boolean
  className?: string
  onSwitched?: (role: Role) => void
}

/** Interactive role picker — used on Profile and mobile account sheet */
export function RoleSwitcher({ compact, className, onSwitched }: RoleSwitcherProps) {
  const user = useAppStore((s) => s.user)
  const switchRole = useAppStore((s) => s.switchRole)
  const roles = user?.roles ?? []
  const active = user?.activeRole

  if (roles.length <= 1) {
    return (
      <p className={cn('text-sm text-[var(--cv-muted)]', className)}>
        This account has a single role: {ROLE_LABELS[active ?? 'seller']}.
      </p>
    )
  }

  return (
    <ul className={cn('grid gap-2', compact ? 'grid-cols-1' : 'sm:grid-cols-2', className)}>
      {roles.map((r) => {
        const isActive = r === active
        return (
          <li key={r}>
            <button
              type="button"
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'focus-ring flex min-h-12 w-full items-center gap-3 rounded-[12px] border px-3 py-2.5 text-left transition duration-150',
                isActive
                  ? 'border-[var(--cv-primary)]/40 bg-[var(--cv-primary-soft)]'
                  : 'border-[var(--cv-border)] bg-[var(--cv-surface)] hover:bg-[var(--cv-elevated)]',
              )}
              onClick={() => {
                if (!isActive) switchRole(r)
                onSwitched?.(r)
              }}
            >
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-lg',
                  isActive ? 'bg-[var(--cv-primary-soft)]' : 'bg-[var(--cv-elevated)]',
                )}
              >
                {ROLE_ICONS[r]}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block truncate text-sm font-semibold',
                    isActive ? 'text-[var(--cv-primary)]' : 'text-[var(--cv-text)]',
                  )}
                >
                  {ROLE_LABELS[r]}
                </span>
                <span className="block text-[12px] text-[var(--cv-muted)]">
                  {isActive ? 'Currently active' : 'Tap to switch'}
                </span>
              </span>
              {isActive ? (
                <span className="shrink-0 rounded-full bg-[var(--cv-btn-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--cv-btn-text)]">
                  Active
                </span>
              ) : null}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
