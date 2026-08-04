'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AnalyticsData } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatInr } from '@/lib/utils'

export default function AnalyticsCharts({ data }: { data: AnalyticsData }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><h2 className="font-semibold">User Acquisition</h2></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.userAcquisition}>
              <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis stroke="#6B6B6B" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1F1F1F', border: '1px solid #2A2A2A' }} />
              <Area type="monotone" dataKey="count" stroke="#CCFF00" fill="rgba(204,255,0,0.15)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><h2 className="font-semibold">GMV Trend</h2></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.gmvTrend}>
              <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis stroke="#6B6B6B" fontSize={11} />
              <Tooltip
                contentStyle={{ background: '#1F1F1F', border: '1px solid #2A2A2A' }}
                formatter={(v) => formatInr(Number(v))}
              />
              <Bar dataKey="amount" fill="#B8E600" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
