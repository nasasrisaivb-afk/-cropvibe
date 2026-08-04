import type { ReactNode } from 'react'
import { LargeTitle } from './LargeTitle'
import { useScrollCollapse } from '../../hooks/useScrollCollapse'

interface PageHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
  actions?: ReactNode
}

/** Standard page header with Apple large-title collapse on scroll */
export function PageHeader({ title, subtitle, eyebrow, actions }: PageHeaderProps) {
  const collapsed = useScrollCollapse()
  return (
    <LargeTitle
      collapsed={collapsed}
      title={title}
      subtitle={subtitle}
      eyebrow={eyebrow}
      actions={actions}
    />
  )
}
