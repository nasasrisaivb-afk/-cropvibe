import { Heart } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Wordmark } from './Wordmark'

/** Figma footer bar: wordmark, legal links, "Crafted with ♥ in Hyderabad, India". */
export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn('mt-10 border-t border-brand-lime/50 bg-bg-base', className)}>
      <div className="flex min-h-[68px] flex-col items-center gap-3 px-4 py-4 text-xs md:flex-row md:justify-between md:px-6">
        <Wordmark size="sm" />
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-text-secondary">
          <span>Copyright © {new Date().getFullYear()}</span>
          <a href="https://cropvibe.com/privacy" className="transition hover:text-text-primary">
            Privacy Policy
          </a>
          <a href="mailto:support@cropvibe.com" className="transition hover:text-text-primary">
            Contact Us
          </a>
          <span className="inline-flex items-center gap-1 text-brand-lime">
            Crafted with <Heart className="h-3.5 w-3.5 fill-status-error text-status-error" aria-label="love" /> in
            Hyderabad, India
          </span>
        </div>
      </div>
    </footer>
  )
}
