import { cn } from '../../utils/format'
import { StatusPill, type StatusTone } from './DataOverview'

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

const CONFIG: Record<BadgeStatus, { tone: StatusTone; label: string }> = {
  approved: { tone: 'success', label: 'Approved' },
  pending: { tone: 'warning', label: 'Pending' },
  rejected: { tone: 'danger', label: 'Rejected' },
  active: { tone: 'primary', label: 'Active' },
  inactive: { tone: 'neutral', label: 'Inactive' },
  verified: { tone: 'success', label: 'Verified' },
  packed: { tone: 'primary', label: 'Packed' },
  shipped: { tone: 'info', label: 'Shipped' },
  delivered: { tone: 'success', label: 'Delivered' },
  completed: { tone: 'neutral', label: 'Completed' },
  accepted: { tone: 'info', label: 'Accepted' },
  high: { tone: 'danger', label: 'High' },
  medium: { tone: 'warning', label: 'Medium' },
  low: { tone: 'neutral', label: 'Low' },
}

interface BadgeProps {
  status?: BadgeStatus
  children?: string
  showIcon?: boolean
  className?: string
}

export function Badge({ status = 'pending', children, showIcon = true, className }: BadgeProps) {
  const config = CONFIG[status]
  if (!showIcon) {
    return (
      <StatusPill tone={config.tone} className={cn('[&>svg]:hidden', className)}>
        {children ?? config.label}
      </StatusPill>
    )
  }
  return (
    <StatusPill tone={config.tone} className={className}>
      {children ?? config.label}
    </StatusPill>
  )
}
