import { Card } from '../common/Card'

export function ServiceCatalogSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading services">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="animate-pulse space-y-3">
          <div className="h-5 w-2/3 rounded bg-[var(--cv-border)]" />
          <div className="h-4 w-1/2 rounded bg-[var(--cv-border)]" />
          <div className="h-4 w-3/4 rounded bg-[var(--cv-border)]" />
          <div className="h-6 w-1/3 rounded bg-[var(--cv-border)]" />
          <div className="flex gap-2 pt-2">
            <div className="h-10 flex-1 rounded bg-[var(--cv-border)]" />
            <div className="h-10 flex-1 rounded bg-[var(--cv-border)]" />
          </div>
        </Card>
      ))}
    </div>
  )
}
