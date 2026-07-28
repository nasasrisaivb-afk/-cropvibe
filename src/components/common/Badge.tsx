import { cn } from '../../utils/format'

export type BadgeStatus =
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'active'
  | 'inactive'
  | 'verified'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'accepted'
  | 'high'
  | 'medium'
  | 'low'

const CONFIG: Record<BadgeStatus, { bg: string; text: string; icon: string; label: string }> = {
  approved: { bg: 'bg-[var(--cv-primary-soft)]', text: 'text-[var(--cv-primary)]', icon: '✓', label: 'Approved' },
  pending: { bg: 'bg-[var(--cv-accent-soft)]', text: 'text-[var(--cv-warning)]', icon: '⏱', label: 'Pending' },
  rejected: { bg: 'bg-[rgba(239,68,68,0.14)]', text: 'text-[var(--cv-danger)]', icon: '✗', label: 'Rejected' },
  active: { bg: 'bg-[var(--cv-primary-soft)]', text: 'text-[var(--cv-primary)]', icon: '●', label: 'Active' },
  inactive: { bg: 'bg-[var(--cv-elevated)]', text: 'text-[var(--cv-muted)]', icon: '○', label: 'Inactive' },
  verified: { bg: 'bg-[var(--cv-primary-soft)]', text: 'text-[var(--cv-primary)]', icon: '✓', label: 'Verified' },
  packed: { bg: 'bg-[var(--cv-primary-soft)]', text: 'text-[var(--cv-primary)]', icon: '✓', label: 'Packed' },
  shipped: { bg: 'bg-[rgba(56,189,248,0.14)]', text: 'text-[var(--cv-info)]', icon: '🚚', label: 'Shipped' },
  delivered: { bg: 'bg-[var(--cv-primary-soft)]', text: 'text-[var(--cv-primary)]', icon: '✓', label: 'Delivered' },
  completed: { bg: 'bg-[var(--cv-elevated)]', text: 'text-[var(--cv-muted)]', icon: '✓', label: 'Completed' },
  accepted: { bg: 'bg-[rgba(56,189,248,0.14)]', text: 'text-[var(--cv-info)]', icon: '●', label: 'Accepted' },
  high: { bg: 'bg-[rgba(239,68,68,0.14)]', text: 'text-[var(--cv-danger)]', icon: '!', label: 'High' },
  medium: { bg: 'bg-[var(--cv-accent-soft)]', text: 'text-[var(--cv-warning)]', icon: '!', label: 'Medium' },
  low: { bg: 'bg-[var(--cv-elevated)]', text: 'text-[var(--cv-muted)]', icon: '•', label: 'Low' },
}

interface BadgeProps {
  status?: BadgeStatus
  children?: string
  showIcon?: boolean
  className?: string
}

export function Badge({ status = 'pending', children, showIcon = true, className }: BadgeProps) {
  const config = CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        config.bg,
        config.text,
        className,
      )}
    >
      {showIcon ? <span aria-hidden>{config.icon}</span> : null}
      <span>{children ?? config.label}</span>
    </span>
  )
}
