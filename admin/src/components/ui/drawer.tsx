'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Right-side detail panel (Figma "KYC verification | right side pop up").
 * Keeps the list in view so admins can triage without losing their place.
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  eyebrow,
  headerExtra,
  footer,
  children,
  width = 'md',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  eyebrow?: React.ReactNode
  headerExtra?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  width?: 'md' | 'lg'
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 animate-fade-in bg-black/60" />
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-full animate-slide-in-right flex-col border-l border-border-default bg-bg-surface shadow-drawer focus:outline-none',
            width === 'md' ? 'sm:max-w-[640px]' : 'sm:max-w-[880px]'
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border-default px-6 py-5">
            <div className="min-w-0">
              {eyebrow ? <div className="mb-1.5 text-xs text-text-muted">{eyebrow}</div> : null}
              <DialogPrimitive.Title className="truncate text-xl font-bold text-text-primary">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-1 text-sm text-text-secondary">
                  {description}
                </DialogPrimitive.Description>
              ) : (
                <DialogPrimitive.Description className="sr-only">Record details</DialogPrimitive.Description>
              )}
              {headerExtra ? <div className="mt-3">{headerExtra}</div> : null}
            </div>
            <DialogPrimitive.Close
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-default text-text-secondary transition hover:bg-bg-surfaceHover hover:text-text-primary"
              aria-label="Close panel"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>
          <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer ? (
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border-default bg-bg-surface px-6 py-4">
              {footer}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
