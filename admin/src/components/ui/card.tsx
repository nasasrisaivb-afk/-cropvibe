import { cn } from '@/lib/cn'

/** Figma "Connected experience" container — the base surface for every module block. */
export function Card({
  children,
  className,
  hover,
  as: Tag = 'div',
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
  as?: 'div' | 'section' | 'article'
}) {
  return (
    <Tag
      className={cn(
        'rounded-xl border border-border-default bg-bg-surface shadow-card',
        hover && 'transition-colors hover:border-border-strong hover:bg-bg-surfaceHover',
        className
      )}
    >
      {children}
    </Tag>
  )
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('border-b border-border-light px-6 py-4', className)}>{children}</div>
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('p-6', className)}>{children}</div>
}

/** Card header with title, optional description and right-aligned actions. */
export function CardTitleRow({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b border-border-light px-6 py-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-text-secondary">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
