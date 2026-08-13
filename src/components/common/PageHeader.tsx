import type { ReactNode } from 'react'
import { LargeTitle } from './LargeTitle'

interface PageHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
  actions?: ReactNode
}

/** Standard Pointsale-style page header panel */
export function PageHeader({ title, subtitle, eyebrow, actions }: PageHeaderProps) {
  return (
    <LargeTitle title={title} subtitle={subtitle} eyebrow={eyebrow} actions={actions} />
  )
}
