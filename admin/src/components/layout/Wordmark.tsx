import { cn } from '@/lib/cn'

/** CROPVIBE wordmark — Rocpar when licensed, Orbitron fallback. */
export function Wordmark({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span
      className={cn(
        'font-wordmark font-bold uppercase leading-none tracking-[0.12em] text-brand-lime',
        size === 'sm' && 'text-sm',
        size === 'md' && 'text-[1.375rem]',
        size === 'lg' && 'text-3xl',
        className
      )}
    >
      Cropvibe
    </span>
  )
}
