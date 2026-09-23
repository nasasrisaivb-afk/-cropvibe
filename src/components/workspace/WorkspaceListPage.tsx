import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllNavPaths } from '../../config/navigation'
import { useAppStore } from '../../store/appStore'
import type { PageId } from '../../types/roles'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableRow,
  ExportButton,
  OverviewFooter,
  OverviewPanel,
  OverviewSearch,
  OverviewShell,
  OverviewTabs,
  OverviewToolbar,
  PrimaryActionButton,
  StatusPill,
  type StatusTone,
} from '../common/DataOverview'

export interface WorkspaceRow {
  id: string
  tab: string
  title: string
  subtitle?: string
  status: { label: string; tone: StatusTone }
  cells: string[]
}

export interface WorkspaceListConfig {
  title: string
  subtitle: string
  ctaLabel?: string
  ctaPage?: PageId
  tabs: { value: string; label: string }[]
  columns: string[]
  rows: WorkspaceRow[]
  empty: string
}

export function WorkspaceListPage({ config }: { config: WorkspaceListConfig }) {
  const navigate = useNavigate()
  const setCurrentPage = useAppStore((s) => s.setCurrentPage)
  const [tab, setTab] = useState(config.tabs[0]?.value ?? 'all')
  const [query, setQuery] = useState('')
  const paths = getAllNavPaths()

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const item of config.tabs) {
      map[item.value] =
        item.value === config.tabs[0]?.value
          ? config.rows.length
          : config.rows.filter((row) => row.tab === item.value).length
    }
    return map
  }, [config])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return config.rows.filter((row) => {
      const tabOk = tab === config.tabs[0]?.value || row.tab === tab
      const searchOk =
        !q ||
        row.title.toLowerCase().includes(q) ||
        row.subtitle?.toLowerCase().includes(q) ||
        row.id.toLowerCase().includes(q) ||
        row.cells.some((cell) => cell.toLowerCase().includes(q))
      return tabOk && searchOk
    })
  }, [config, query, tab])

  const goCta = () => {
    if (!config.ctaPage) return
    setCurrentPage(config.ctaPage)
    navigate(paths[config.ctaPage] ?? '/dashboard')
  }

  return (
    <OverviewShell
      title={config.title}
      subtitle={config.subtitle}
      actions={
        <>
          <ExportButton>Export CSV</ExportButton>
          {config.ctaLabel ? <PrimaryActionButton onClick={goCta}>{config.ctaLabel}</PrimaryActionButton> : null}
        </>
      }
    >
      <OverviewPanel>
        <OverviewTabs
          value={tab}
          onChange={setTab}
          tabs={config.tabs.map((item) => ({ ...item, count: counts[item.value] }))}
        />
        <OverviewToolbar>
          <OverviewSearch
            placeholder={`Search ${config.title.toLowerCase()}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </OverviewToolbar>

        {visible.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm font-semibold text-[var(--cv-text)]">{query ? 'No matches for these filters' : config.empty}</p>
            {query ? (
              <button type="button" className="mt-2 text-sm font-semibold text-[var(--cv-primary)]" onClick={() => setQuery('')}>
                Clear search
              </button>
            ) : config.ctaLabel ? (
              <button type="button" className="mt-3 text-sm font-semibold text-[var(--cv-primary)]" onClick={goCta}>
                {config.ctaLabel}
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="space-y-3 p-4 lg:hidden">
              {visible.map((row) => (
                <article key={row.id} className="rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--cv-text)]">{row.title}</p>
                      <p className="text-xs text-[var(--cv-muted)]">{row.subtitle ?? row.id}</p>
                    </div>
                    <StatusPill tone={row.status.tone}>{row.status.label}</StatusPill>
                  </div>
                  <p className="mt-2 text-sm text-[var(--cv-muted)]">{row.cells.filter(Boolean).join(' · ')}</p>
                </article>
              ))}
            </div>
            <div className="hidden lg:block">
              <DataTable>
                <DataTableHead columns={config.columns} />
                <DataTableBody>
                  {visible.map((row) => (
                    <DataTableRow key={row.id}>
                      {row.cells.map((cell, index) => (
                        <DataTableCell key={`${row.id}-${index}`} strong={index === 0} mono={index === 0 && cell.startsWith('PO-')}>
                          {index === config.columns.length - 1 ? (
                            <StatusPill tone={row.status.tone}>{row.status.label}</StatusPill>
                          ) : (
                            cell
                          )}
                        </DataTableCell>
                      ))}
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </DataTable>
            </div>
            <OverviewFooter countLabel={`${visible.length} records`} disablePrev disableNext />
          </>
        )}
      </OverviewPanel>
    </OverviewShell>
  )
}
