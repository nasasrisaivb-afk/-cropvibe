import { useEffect, useRef, useState } from 'react'
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline'
import { ROLE_LABELS, ROLE_SHORT } from '../../config/navigation'
import { useAppStore } from '../../store/appStore'
import type { PageId, Role } from '../../types/roles'
import { ROLE_ICONS, ROLE_PILL } from '../../types/roles'
import { cn } from '../../utils/format'

const ROLE_UNREAD: Record<Role, number> = {
  seller: 3,
  buyer: 2,
  rental: 4,
  service: 2,
  educator: 5,
}

export function HeaderRoleSwitcher({
  compact,
  onAddRole,
}: {
  compact?: boolean
  onAddRole: (page: PageId) => void
}) {
  const user = useAppStore((s) => s.user)
  const switchRole = useAppStore((s) => s.switchRole)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const role = user?.activeRole ?? 'seller'
  const roles = user?.roles ?? [role]
  const pill = ROLE_PILL[role]

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Active workspace: ${ROLE_LABELS[role]}. Switch role`}
        className={cn(
          'focus-ring inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-left shadow-sm',
          compact && 'max-w-[11rem]',
        )}
        style={{ background: pill.bg, color: pill.fg }}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden className="text-sm leading-none">
          {ROLE_ICONS[role]}
        </span>
        <span className="truncate text-[13px] font-semibold">{ROLE_SHORT[role]}</span>
        <ChevronDownIcon className={cn('h-3.5 w-3.5 shrink-0 transition', open && 'rotate-180')} strokeWidth={2} />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Switch workspace role"
          className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-surface)] shadow-[var(--shadow-lg)]"
        >
          <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--cv-muted)]">
            Your roles
          </p>
          <ul>
            {roles.map((item) => {
              const active = item === role
              const unread = ROLE_UNREAD[item]
              const itemPill = ROLE_PILL[item]
              return (
                <li key={item}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-[var(--cv-elevated)]',
                      active && 'bg-[var(--cv-elevated)]',
                    )}
                    onClick={() => {
                      if (!active) switchRole(item)
                      setOpen(false)
                    }}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full text-sm"
                      style={{ background: itemPill.bg, color: itemPill.fg }}
                    >
                      {ROLE_ICONS[item]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[var(--cv-text)]">
                        {ROLE_LABELS[item]}
                      </span>
                      <span className="block text-[11px] text-[var(--cv-muted)]">
                        {active ? 'Current workspace' : 'Switch workspace'}
                      </span>
                    </span>
                    {unread > 0 ? (
                      <span className="rounded-md bg-[var(--cv-sidebar-badge-bg)] px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--cv-text)]">
                        {unread}
                      </span>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
          <button
            type="button"
            className="flex w-full items-center gap-2 border-t border-[var(--cv-border)] px-3 py-3 text-sm font-semibold text-[var(--cv-text)] hover:bg-[var(--cv-elevated)]"
            onClick={() => {
              setOpen(false)
              onAddRole('profile')
            }}
          >
            <PlusIcon className="h-4 w-4" strokeWidth={2} />
            Add a role
          </button>
        </div>
      ) : null}
    </div>
  )
}
