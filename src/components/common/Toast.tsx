import { useEffect, useState } from 'react'
import { cn } from '../../utils/format'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  type: ToastType
  title: string
  message?: string
  actionLabel?: string
  onAction?: () => void
  duration?: number | null
}

const BORDER: Record<ToastType, string> = {
  success: 'border-l-[var(--cv-success,#4CAF50)]',
  error: 'border-l-[var(--cv-danger,#f44336)]',
  info: 'border-l-[var(--cv-primary,#2563eb)]',
  warning: 'border-l-[var(--cv-warning,#ff9800)]',
}

interface ToastStackProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[min(100vw-2rem,380px)] flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem
  onDismiss: (id: string) => void
}) {
  useEffect(() => {
    if (toast.duration === null) return
    const ms = toast.duration ?? 4000
    const timer = window.setTimeout(() => onDismiss(toast.id), ms)
    return () => window.clearTimeout(timer)
  }, [toast, onDismiss])

  return (
    <div
      className={cn(
        'pointer-events-auto cv-dashboard-panel flex gap-3 border-l-4 p-4 shadow-[var(--shadow-lg)]',
        BORDER[toast.type],
      )}
      role="status"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--cv-text)]">{toast.title}</p>
        {toast.message ? (
          <p className="mt-0.5 text-sm text-[var(--cv-muted)]">{toast.message}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        {toast.actionLabel && toast.onAction ? (
          <button
            type="button"
            className="focus-ring text-xs font-semibold text-[var(--cv-primary)]"
            onClick={toast.onAction}
          >
            {toast.actionLabel}
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Dismiss notification"
          className="focus-ring text-xs text-[var(--cv-muted)] hover:text-[var(--cv-text)]"
          onClick={() => onDismiss(toast.id)}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const showToast = (item: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { ...item, id }])
    return id
  }

  return { toasts, showToast, dismiss, ToastStack: () => <ToastStack toasts={toasts} onDismiss={dismiss} /> }
}
