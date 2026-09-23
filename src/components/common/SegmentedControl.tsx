import { cn } from '../../utils/format'

export interface SegmentOption<T extends string = string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel?: string
  className?: string
  fullWidth?: boolean
}

/** Pill segmented control with sliding selected state */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  ariaLabel = 'View options',
  className,
  fullWidth,
}: SegmentedControlProps<T>) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  )

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'relative inline-grid rounded-xl border border-[var(--cv-border)] bg-white p-1 shadow-[var(--shadow-sm)]',
        fullWidth && 'flex w-full',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-1 bottom-1 rounded-[10px] bg-[var(--cv-blue)] shadow-[0_6px_14px_rgba(91,92,226,0.25)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)]"
        style={{
          width: `calc((100% - 8px) / ${options.length})`,
          transform: `translateX(calc(${index} * 100% + ${index * 0}px))`,
          left: 4,
        }}
      />
      {options.map((opt) => {
        const selected = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={cn(
              'relative z-10 min-h-9 rounded-[8px] px-3 text-sm font-semibold transition-colors duration-150',
              selected ? 'text-white' : 'text-[var(--cv-text)] hover:text-black',
            )}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
