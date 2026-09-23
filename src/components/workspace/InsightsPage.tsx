import { HOME_CONTENT } from '../../config/homeContent'
import { useAppStore } from '../../store/appStore'
import { OverviewShell } from '../common/DataOverview'

export function InsightsPage() {
  const role = useAppStore((s) => s.user?.activeRole ?? 'seller')
  const data = HOME_CONTENT[role]
  const copy = {
    seller: 'Earnings by crop, price realised vs mandi, repeat buyers, listing conversion.',
    buyer: 'Spend by crop and supplier, price paid vs mandi, what is in season now.',
    rental: 'Utilisation and revenue by machine.',
    service: 'Appointments completed and report turnaround.',
    educator: 'Enrolments, completion funnel, drop-off by lesson.',
  } as const

  return (
    <OverviewShell title="Insights" subtitle={copy[role]}>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="cv-dashboard-panel p-5">
          <h2 className="text-[15px] font-semibold">{data.chartTitle}</h2>
          <p className="text-xs text-[var(--cv-muted)]">{data.chartHint}</p>
          <div className="mt-4 flex h-40 items-end gap-2" role="img" aria-label={`${data.chartTitle} chart`}>
            {data.chartPoints.map((point) => (
              <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-[var(--cv-primary)]"
                  style={{ height: `${Math.max(12, (point.value / Math.max(...data.chartPoints.map((p) => p.value))) * 100)}%` }}
                />
                <span className="text-[11px] text-[var(--cv-muted)]">{point.label}</span>
              </div>
            ))}
          </div>
          <table className="mt-4 w-full text-left text-xs text-[var(--cv-muted)]">
            <caption className="sr-only">{data.chartTitle} data table</caption>
            <tbody>
              <tr className="text-[var(--cv-text)]">
                {data.chartPoints.map((point) => (
                  <td key={point.label} className="pr-2 tabular-nums">
                    {point.value.toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </section>
        <section className="cv-dashboard-panel p-5">
          <h2 className="text-[15px] font-semibold">Highlights</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {data.activity.map((item) => (
              <li key={item.text} className="flex gap-3">
                <span className="w-16 shrink-0 text-xs text-[var(--cv-muted)]">{item.time}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </OverviewShell>
  )
}
