import { useEffect, useRef, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { CREATE_MENU } from '../../config/navigation'
import { useAppStore } from '../../store/appStore'
import type { PageId } from '../../types/roles'

export function CreateMenu({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const role = useAppStore((s) => s.user?.activeRole ?? 'seller')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const items = CREATE_MENU[role]

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
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Create"
        className="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--cv-border)] bg-[var(--cv-btn-bg)] text-[var(--cv-btn-text)]"
        onClick={() => setOpen((v) => !v)}
      >
        <PlusIcon className="h-5 w-5" strokeWidth={2} />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-surface)] py-1 shadow-[var(--shadow-lg)]"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className="flex w-full px-3 py-2.5 text-left text-sm font-medium text-[var(--cv-text)] hover:bg-[var(--cv-elevated)]"
              onClick={() => {
                setOpen(false)
                onNavigate(item.page)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
