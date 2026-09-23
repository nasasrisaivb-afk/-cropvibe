import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDownIcon, Cog6ToothIcon, QuestionMarkCircleIcon, StarIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { ROLE_LABELS } from '../../config/navigation'
import { useAppStore } from '../../store/appStore'
import type { PageId } from '../../types/roles'
import { ROLE_ICONS } from '../../types/roles'
import { RoleSwitcher } from './RoleSwitcher'
import { Sheet } from './Sheet'

interface HeaderAccountMenuProps {
  onNavigate: (page: PageId) => void
}

/**
 * Account control in the top nav bar.
 * Mobile: bottom sheet. Desktop: dropdown with role switch + profile links.
 */
export function HeaderAccountMenu({ onNavigate }: HeaderAccountMenuProps) {
  const user = useAppStore((s) => s.user)
  const switchRole = useAppStore((s) => s.switchRole)
  const logout = useAppStore((s) => s.logout)
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const role = user?.activeRole ?? 'seller'
  const roles = user?.roles ?? []
  const initial = (user?.profile.name ?? 'U').slice(0, 1)
  const multiRole = roles.length > 1
  const firstName = user?.profile.name?.split(' ')[0] ?? 'User'

  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  return (
    <>
      {/* Mobile trigger → sheet */}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={sheetOpen}
        aria-label={multiRole ? 'Account and switch role' : 'Account'}
        className="cv-touch focus-ring flex items-center gap-1 rounded-full border border-[var(--cv-border)] bg-[var(--cv-elevated)] pl-0.5 pr-1.5 md:hidden"
        onClick={() => setSheetOpen(true)}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--cv-btn-bg)] text-sm font-bold text-[var(--cv-btn-text)]">
          {initial}
        </span>
        <span className="flex max-w-[4.5rem] flex-col items-start leading-tight">
          <span className="truncate text-[10px] font-semibold text-[var(--cv-text)]">
            {ROLE_ICONS[role]} {ROLE_LABELS[role].split(' ')[0]}
          </span>
        </span>
        <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 text-[var(--cv-muted)]" strokeWidth={2} />
      </button>

      {/* Desktop trigger → dropdown */}
      <div ref={ref} className="relative hidden md:block">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Account menu"
          className="focus-ring flex max-w-[220px] items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-left transition hover:bg-[var(--cv-elevated)]"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--cv-btn-bg)] text-sm font-bold text-[var(--cv-btn-text)]">
            {initial}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold leading-tight text-[var(--cv-text)]">
              {firstName}
            </span>
            <span className="block truncate text-[11px] leading-tight text-[var(--cv-muted)]">
              {ROLE_LABELS[role]}
            </span>
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 shrink-0 text-[var(--cv-muted)] transition ${menuOpen ? 'rotate-180' : ''}`}
            strokeWidth={1.5}
          />
        </button>

        {menuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-[14px] border border-[var(--cv-border)] bg-[var(--cv-surface)] shadow-[var(--shadow-lg)]"
          >
            <div className="border-b border-[var(--cv-border)] px-3 py-3">
              <p className="truncate text-sm font-semibold text-[var(--cv-text)]">{user?.profile.name}</p>
              <p className="truncate text-xs text-[var(--cv-muted)]">{ROLE_LABELS[role]}</p>
            </div>

            {multiRole ? (
              <>
                <p className="px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--cv-muted)]">
                  Switch role
                </p>
                <ul className="max-h-56 overflow-y-auto px-1.5 pb-1.5">
                  {roles.map((r) => {
                    const active = r === role
                    return (
                      <li key={r}>
                        <button
                          type="button"
                          role="menuitem"
                          className={`flex min-h-10 w-full items-center gap-2.5 rounded-[8px] px-2.5 text-left text-sm transition ${
                            active
                              ? 'bg-[var(--cv-primary-soft)] font-semibold text-[var(--cv-primary)]'
                              : 'text-[var(--cv-text)] hover:bg-[var(--cv-elevated)]'
                          }`}
                          onClick={() => {
                            if (!active) switchRole(r)
                            setMenuOpen(false)
                          }}
                        >
                          <span className="text-base">{ROLE_ICONS[r]}</span>
                          <span className="truncate">{ROLE_LABELS[r]}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </>
            ) : null}

            <div className="border-t border-[var(--cv-border)] p-1.5">
              <button
                type="button"
                role="menuitem"
                className="flex min-h-10 w-full items-center gap-2.5 rounded-[8px] px-2.5 text-left text-sm text-[var(--cv-text)] hover:bg-[var(--cv-elevated)]"
                onClick={() => {
                  setMenuOpen(false)
                  onNavigate('profile')
                }}
              >
                <UserCircleIcon className="h-4 w-4 text-[var(--cv-muted)]" strokeWidth={1.5} />
                Profile
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex min-h-10 w-full items-center gap-2.5 rounded-[8px] px-2.5 text-left text-sm text-[var(--cv-text)] hover:bg-[var(--cv-elevated)]"
                onClick={() => {
                  setMenuOpen(false)
                  onNavigate('reviews')
                }}
              >
                <StarIcon className="h-4 w-4 text-[var(--cv-muted)]" strokeWidth={1.5} />
                Reviews
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex min-h-10 w-full items-center gap-2.5 rounded-[8px] px-2.5 text-left text-sm text-[var(--cv-text)] hover:bg-[var(--cv-elevated)]"
                onClick={() => {
                  setMenuOpen(false)
                  onNavigate('settings')
                }}
              >
                <Cog6ToothIcon className="h-4 w-4 text-[var(--cv-muted)]" strokeWidth={1.5} />
                Settings
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex min-h-10 w-full items-center gap-2.5 rounded-[8px] px-2.5 text-left text-sm text-[var(--cv-text)] hover:bg-[var(--cv-elevated)]"
                onClick={() => {
                  setMenuOpen(false)
                  onNavigate('help')
                }}
              >
                <QuestionMarkCircleIcon className="h-4 w-4 text-[var(--cv-muted)]" strokeWidth={1.5} />
                Help
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex min-h-10 w-full items-center gap-2.5 rounded-[8px] px-2.5 text-left text-sm text-[var(--cv-danger)] hover:bg-[var(--cv-elevated)]"
                onClick={() => {
                  setMenuOpen(false)
                  logout()
                  navigate('/login')
                }}
              >
                Log out
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <Sheet open={sheetOpen} title="Your account" onClose={() => setSheetOpen(false)}>
        <div className="space-y-5 pb-2">
          <div className="flex items-center gap-3 rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface)] px-3 py-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--cv-btn-bg)] text-lg font-bold text-[var(--cv-btn-text)]">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-[var(--cv-text)]">{user?.profile.name}</p>
              <p className="truncate text-sm text-[var(--cv-muted)]">{ROLE_LABELS[role]}</p>
            </div>
          </div>

          {multiRole ? (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--cv-muted)]">
                Switch role
              </p>
              <RoleSwitcher compact onSwitched={() => setSheetOpen(false)} />
            </div>
          ) : null}

          <div className="grid gap-2">
            <button
              type="button"
              className="focus-ring flex min-h-12 items-center gap-3 rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface)] px-3 text-left text-sm font-semibold text-[var(--cv-text)]"
              onClick={() => {
                setSheetOpen(false)
                onNavigate('profile')
              }}
            >
              <UserCircleIcon className="h-5 w-5 text-[var(--cv-muted)]" strokeWidth={1.5} />
              View profile
            </button>
            <button
              type="button"
              className="focus-ring flex min-h-12 items-center gap-3 rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface)] px-3 text-left text-sm font-semibold text-[var(--cv-text)]"
              onClick={() => {
                setSheetOpen(false)
                onNavigate('reviews')
              }}
            >
              <StarIcon className="h-5 w-5 text-[var(--cv-muted)]" strokeWidth={1.5} />
              Reviews
            </button>
            <button
              type="button"
              className="focus-ring flex min-h-12 items-center gap-3 rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface)] px-3 text-left text-sm font-semibold text-[var(--cv-text)]"
              onClick={() => {
                setSheetOpen(false)
                onNavigate('settings')
              }}
            >
                <Cog6ToothIcon className="h-5 w-5 text-[var(--cv-muted)]" strokeWidth={1.5} />
                Settings
              </button>
              <button
                type="button"
                className="focus-ring flex min-h-12 items-center gap-3 rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface)] px-3 text-left text-sm font-semibold text-[var(--cv-text)]"
                onClick={() => {
                  setSheetOpen(false)
                  onNavigate('help')
                }}
              >
                <QuestionMarkCircleIcon className="h-5 w-5 text-[var(--cv-muted)]" strokeWidth={1.5} />
                Help
              </button>
              <button
                type="button"
                className="focus-ring flex min-h-12 items-center gap-3 rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface)] px-3 text-left text-sm font-semibold text-[var(--cv-danger)]"
                onClick={() => {
                  setSheetOpen(false)
                  logout()
                  navigate('/login')
                }}
              >
                Log out
              </button>
          </div>
        </div>
      </Sheet>
    </>
  )
}

/** @deprecated Use HeaderAccountMenu — kept as alias for any leftover imports */
export const MobileAccountMenu = HeaderAccountMenu
