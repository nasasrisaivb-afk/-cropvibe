'use client'

import { useState } from 'react'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts'
import { Table2, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Chart kit — "emphasis" form throughout: the series that matters in CropVibe lime,
 * comparison series in neutral gray. No categorical rainbow, so charts stay inside
 * the 60/30/10 balance. Grids are solid hairlines; every chart has a hover tooltip
 * and a table view.
 */
export const CHART = {
  accent: '#CCFF00',
  compare: '#6E6E6E',
  grid: '#333333',
  tick: '#8F8F8F',
  surface: '#242424',
}

export interface SeriesDef {
  key: string
  label: string
  /** 'accent' = the series the chart is about; 'compare' = context */
  role?: 'accent' | 'compare'
}

type Formatter = (v: number) => string

function ChartTooltip({
  active,
  payload,
  label,
  format,
  series,
}: TooltipProps<number, string> & { format: Formatter; series: SeriesDef[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border-strong bg-bg-surfaceAlt px-3 py-2 shadow-pop">
      <p className="mb-1 text-xs text-text-muted">{label}</p>
      {payload.map((p) => {
        const def = series.find((s) => s.key === p.dataKey)
        return (
          <p key={String(p.dataKey)} className="flex items-center gap-2 text-sm">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: def?.role === 'compare' ? CHART.compare : CHART.accent }}
              aria-hidden
            />
            <span className="text-text-secondary">{def?.label ?? p.name}</span>
            <span className="tabular ml-auto pl-3 font-semibold text-text-primary">{format(Number(p.value))}</span>
          </p>
        )
      })}
    </div>
  )
}

function Legend({ series }: { series: SeriesDef[] }) {
  if (series.length < 2) return null
  return (
    <ul className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
      {series.map((s) => (
        <li key={s.key} className="flex items-center gap-1.5">
          <span
            className={cn('h-0.5 w-4 rounded-full', s.role === 'compare' ? 'bg-[#6E6E6E]' : 'bg-brand-lime')}
            aria-hidden
          />
          {s.label}
        </li>
      ))}
    </ul>
  )
}

/** Card wrapper with title, legend, and a chart ⇄ table toggle for screen readers and exports. */
export function ChartCard({
  title,
  description,
  series = [],
  data,
  xKey,
  format = (v) => String(v),
  actions,
  children,
  className,
  height = 260,
}: {
  title: string
  description?: string
  series?: SeriesDef[]
  data?: Record<string, unknown>[]
  xKey?: string
  format?: Formatter
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  height?: number
}) {
  const [asTable, setAsTable] = useState(false)
  const canTable = Boolean(data && xKey && series.length)
  return (
    <section className={cn('flex flex-col rounded-xl border border-border-default bg-bg-surface shadow-card', className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 px-6 pb-2 pt-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          {description ? <p className="mt-0.5 text-sm text-text-secondary">{description}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {canTable ? (
            <button
              type="button"
              onClick={() => setAsTable((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border-default text-text-muted transition hover:text-text-primary"
              aria-label={asTable ? 'Show chart' : 'Show as table'}
              title={asTable ? 'Show chart' : 'Show as table'}
            >
              {asTable ? <BarChart3 className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}
            </button>
          ) : null}
        </div>
      </header>
      <div className="px-6">
        <Legend series={series} />
      </div>
      <div className="flex-1 px-3 pb-4 pt-3" style={{ minHeight: height }}>
        {asTable && canTable ? (
          <div className="scrollbar-thin max-h-[320px] overflow-auto px-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="cv-th px-2 text-left">{xKey}</th>
                  {series.map((s) => (
                    <th key={s.key} className="cv-th px-2 text-right">
                      {s.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data!.map((row, i) => (
                  <tr key={i} className="border-b border-border-light last:border-0">
                    <td className="px-2 py-2 text-text-secondary">{String(row[xKey!])}</td>
                    {series.map((s) => (
                      <td key={s.key} className="tabular px-2 py-2 text-right text-text-primary">
                        {format(Number(row[s.key]))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  )
}

const axisProps = {
  stroke: CHART.grid,
  tick: { fill: CHART.tick, fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const

/** Trend over time — one accent area, optional gray comparison line (e.g. last period). */
export function TrendChart({
  data,
  xKey,
  series,
  format = (v) => String(v),
  height = 260,
}: {
  data: Record<string, unknown>[]
  xKey: string
  series: SeriesDef[]
  format?: Formatter
  height?: number
}) {
  const accent = series.find((s) => s.role !== 'compare')
  const compare = series.filter((s) => s.role === 'compare')
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="cv-accent-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.accent} stopOpacity={0.22} />
            <stop offset="100%" stopColor={CHART.accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} minTickGap={24} />
        <YAxis {...axisProps} width={56} tickFormatter={(v) => format(Number(v))} />
        <Tooltip
          cursor={{ stroke: CHART.tick, strokeWidth: 1 }}
          content={(props) => <ChartTooltip {...(props as TooltipProps<number, string>)} format={format} series={series} />}
        />
        {compare.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} stroke={CHART.compare} strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: CHART.surface, strokeWidth: 2 }} />
        ))}
        {accent ? (
          <Area
            type="monotone"
            dataKey={accent.key}
            stroke={CHART.accent}
            strokeWidth={2}
            fill="url(#cv-accent-fill)"
            activeDot={{ r: 5, fill: CHART.accent, stroke: CHART.surface, strokeWidth: 2 }}
          />
        ) : null}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

/** Magnitude by category or period — single hue columns, 4px rounded data ends. */
export function ColumnChart({
  data,
  xKey,
  series,
  format = (v) => String(v),
  height = 260,
  highlightLast,
}: {
  data: Record<string, unknown>[]
  xKey: string
  series: SeriesDef[]
  format?: Formatter
  height?: number
  /** Accent only the latest column and gray the rest (emphasis form) */
  highlightLast?: boolean
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }} barGap={2} barCategoryGap="28%">
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} width={56} tickFormatter={(v) => format(Number(v))} />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          content={(props) => <ChartTooltip {...(props as TooltipProps<number, string>)} format={format} series={series} />}
        />
        {series.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            fill={s.role === 'compare' ? CHART.compare : CHART.accent}
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
            shape={
              highlightLast && s.role !== 'compare'
                ? (props: unknown) => {
                    const p = props as { x: number; y: number; width: number; height: number; index: number }
                    const last = p.index === data.length - 1
                    return (
                      <rect
                        x={p.x}
                        y={p.y}
                        width={p.width}
                        height={Math.max(0, p.height)}
                        rx={4}
                        fill={last ? CHART.accent : CHART.compare}
                      />
                    )
                  }
                : undefined
            }
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

/** Ranked horizontal bars in HTML — direct labels, accessible, one hue. */
export function BarList({
  items,
  format = (v) => String(v),
  max,
}: {
  items: { label: string; value: number; sub?: string }[]
  format?: Formatter
  max?: number
}) {
  const top = max ?? Math.max(1, ...items.map((i) => i.value))
  return (
    <ul className="space-y-3.5 px-3">
      {items.map((item, i) => (
        <li key={`${item.label}-${i}`} className="group" title={`${item.label}: ${format(item.value)}`}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-text-primary">
              {item.label}
              {item.sub ? <span className="ml-2 text-xs text-text-muted">{item.sub}</span> : null}
            </span>
            <span className="tabular shrink-0 font-semibold text-text-primary">{format(item.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-bg-elevated">
            <div
              className="h-full rounded-full bg-brand-lime transition-opacity group-hover:opacity-80"
              style={{ width: `${Math.max(2, (item.value / top) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
