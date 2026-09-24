'use client'

import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '@/lib/cn'

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  label,
  className,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  label: string
  className?: string
}) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border-default transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-brand-lime data-[state=checked]:bg-brand-lime data-[state=unchecked]:bg-bg-elevated',
        className
      )}
    >
      <SwitchPrimitive.Thumb className="block h-4 w-4 translate-x-1 rounded-full bg-text-primary shadow transition-transform data-[state=checked]:translate-x-6 data-[state=checked]:bg-brand-ink" />
    </SwitchPrimitive.Root>
  )
}

/** Figma settings row: label, "Description of what this control will do", and the switch. */
export function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description ? <p className="mt-0.5 text-sm text-text-secondary">{description}</p> : null}
      </div>
      <Switch label={label} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  )
}
