'use client'

import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/cn'

export const DropdownMenu = DropdownPrimitive.Root
export const DropdownMenuTrigger = DropdownPrimitive.Trigger

export function DropdownMenuContent({
  children,
  align = 'end',
  className,
}: {
  children: React.ReactNode
  align?: 'start' | 'end' | 'center'
  className?: string
}) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        align={align}
        sideOffset={6}
        className={cn(
          'z-50 min-w-[12rem] animate-fade-in rounded-lg border border-border-default bg-bg-surfaceAlt p-1 shadow-pop',
          className
        )}
      >
        {children}
      </DropdownPrimitive.Content>
    </DropdownPrimitive.Portal>
  )
}

export function DropdownMenuItem({
  children,
  onSelect,
  destructive,
  disabled,
}: {
  children: React.ReactNode
  onSelect: () => void
  destructive?: boolean
  disabled?: boolean
}) {
  return (
    <DropdownPrimitive.Item
      disabled={disabled}
      onSelect={onSelect}
      className={cn(
        'flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-40 [&>svg]:h-4 [&>svg]:w-4',
        destructive
          ? 'text-status-error data-[highlighted]:bg-status-error/10'
          : 'text-text-primary data-[highlighted]:bg-bg-elevated'
      )}
    >
      {children}
    </DropdownPrimitive.Item>
  )
}

export function DropdownMenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <DropdownPrimitive.Label className="px-2.5 pb-1 pt-1.5 text-2xs font-semibold uppercase tracking-wider text-text-muted">
      {children}
    </DropdownPrimitive.Label>
  )
}

export function DropdownMenuSeparator() {
  return <DropdownPrimitive.Separator className="my-1 h-px bg-border-default" />
}
