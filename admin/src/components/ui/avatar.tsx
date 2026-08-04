import { cn } from '@/lib/cn'

export function Avatar({
  name,
  src,
  size = 'md',
}: {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' }
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size])} />
    )
  }
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-brand-lime/20 font-semibold text-brand-limeAlt',
        sizes[size]
      )}
      aria-hidden
    >
      {initials}
    </div>
  )
}
