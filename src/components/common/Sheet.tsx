import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '../../utils/format'

interface SheetProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  /** Desktop: centered dialog. Mobile: bottom sheet with drag handle */
  className?: string
}

export function Sheet({ open, title, onClose, children, className }: SheetProps) {
  const startY = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:px-4">
      <button
        aria-label="Close sheet"
        className="absolute inset-0 bg-[var(--color-overlay)] backdrop-blur-[12px] transition-opacity duration-300"
        type="button"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-sheet-title"
        className={cn(
          'cv-spring relative z-10 w-full max-w-lg border border-[var(--cv-border)] bg-[var(--cv-elevated)] shadow-[var(--shadow-lg)]',
          'rounded-t-[20px] sm:rounded-[20px]',
          'animate-[cv-sheet-up_420ms_cubic-bezier(0.32,0.72,0,1)]',
          className,
        )}
        onTouchStart={(e) => {
          startY.current = e.touches[0]?.clientY ?? null
        }}
        onTouchEnd={(e) => {
          if (startY.current == null) return
          const endY = e.changedTouches[0]?.clientY ?? startY.current
          if (endY - startY.current > 80) onClose()
          startY.current = null
        }}
      >
        <div className="flex flex-col items-center pt-3 sm:hidden">
          <span
            aria-hidden
            className="h-1 w-10 rounded-full bg-[var(--cv-muted)]/40"
          />
        </div>
        <div className="flex items-center justify-between gap-3 px-6 pb-2 pt-3 sm:pt-6">
          <h3 id="cv-sheet-title" className="text-lg font-semibold text-[var(--cv-text)]">
            {title}
          </h3>
          <button
            type="button"
            className="focus-ring cv-touch flex items-center justify-center rounded-[8px] text-sm font-medium text-[var(--cv-muted)] hover:text-[var(--cv-text)]"
            onClick={onClose}
          >
            Done
          </button>
        </div>
        <div className="max-h-[min(70dvh,560px)] overflow-y-auto px-6 pb-[max(1.5rem,var(--cv-safe-bottom))]">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes cv-sheet-up {
          from { transform: translateY(100%); opacity: 0.6; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (min-width: 640px) {
          @keyframes cv-sheet-up {
            from { transform: translateY(12px) scale(0.98); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes cv-sheet-up {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        }
      `}</style>
    </div>
  )
}
