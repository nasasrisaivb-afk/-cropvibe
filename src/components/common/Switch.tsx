import { cn } from '../../utils/format'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  /** Accessible name when visible label is rendered separately */
  'aria-label'?: string
  disabled?: boolean
  id?: string
}

/** iOS-style pill switch — lime when on, neutral when off */
export function Switch({
  checked,
  onChange,
  label,
  'aria-label': ariaLabel,
  disabled,
  id,
}: SwitchProps) {
  const switchId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  const name = ariaLabel ?? label ?? (checked ? 'On' : 'Off')

  return (
    <label
      className={cn(
        'inline-flex min-h-11 cursor-pointer items-center gap-3',
        disabled && 'cursor-not-allowed opacity-45',
      )}
      htmlFor={switchId}
    >
      {label ? <span className="text-sm font-medium text-[var(--cv-text)]">{label}</span> : null}
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={name}
        disabled={disabled}
        className={cn(
          'focus-ring relative h-7 w-12 shrink-0 rounded-full transition-[background-color] duration-200 ease-out',
          checked ? 'bg-[var(--cv-btn-bg)]' : 'bg-[#d7dbe8]',
        )}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span
          aria-hidden
          className={cn(
            'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-[var(--color-switch-thumb)] shadow-[var(--shadow-sm)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)]',
            checked && 'translate-x-5',
          )}
          style={checked ? { backgroundColor: 'var(--cv-btn-text)' } : undefined}
        />
      </button>
    </label>
  )
}
