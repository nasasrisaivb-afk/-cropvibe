import { Card } from '../common/Card'
import { MetricCard } from '../common/MetricCard'

interface ModulePageProps {
  title: string
  description: string
}

export function ModulePage({ title, description }: ModulePageProps) {
  return (
    <section className="space-y-4">
      <Card title={title}>
        <p className="text-sm text-slate-600">{description}</p>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard delta="+7.2%" title="Active items" value="124" />
        <MetricCard delta="+3.1%" title="This week" value="58" />
        <MetricCard delta="+12.9%" title="Pending actions" value="16" />
      </div>
    </section>
  )
}
