import { useNavigate } from 'react-router-dom'
import { Button } from '../common/Button'
import { Card } from '../common/Card'

interface ModulePageProps {
  title: string
  description: string
  ctaLabel?: string
  ctaPath?: string
}

export function ModulePage({ title, description, ctaLabel, ctaPath }: ModulePageProps) {
  const navigate = useNavigate()
  return (
    <section className="space-y-4">
      <Card className="!rounded-2xl" title={title}>
        <p className="text-sm text-[var(--cv-muted)]">{description}</p>
        {ctaLabel && ctaPath ? (
          <Button className="mt-4" onClick={() => navigate(ctaPath)}>
            {ctaLabel}
          </Button>
        ) : null}
      </Card>
    </section>
  )
}
