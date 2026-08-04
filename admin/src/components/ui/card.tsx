import { cn } from '@/lib/cn'

export function Card({
  children,
  className,
  hover,
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border-default bg-bg-surface shadow-sm',
        hover && 'transition-all hover:bg-bg-surfaceHover hover:shadow-md',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('border-b border-border-light px-5 py-4', className)}>{children}</div>
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('p-5', className)}>{children}</div>
}
