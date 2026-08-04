'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { OverviewKpis } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatInr } from '@/lib/utils'

const COLORS = ['#CCFF00', '#B8E600', '#3B82F6', '#A78BFA', '#F59E0B', '#22C55E', '#EF4444', '#38BDF8']

export default function Charts({ kpis }: { kpis: OverviewKpis }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-text-primary">User Growth (30d)</h2>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={kpis.userGrowth}>
              <defs>
                <linearGradient id="limeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#CCFF00" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#CCFF00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis stroke="#6B6B6B" fontSize={11} />
              <Tooltip
                contentStyle={{ background: '#1F1F1F', border: '1px solid #2A2A2A' }}
                labelStyle={{ color: '#A3A3A3' }}
              />
              <Area type="monotone" dataKey="count" stroke="#CCFF00" fill="url(#limeFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-text-primary">Role Distribution</h2>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={kpis.roleDistribution}
                dataKey="count"
                nameKey="role"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {kpis.roleDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1F1F1F', border: '1px solid #2A2A2A' }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-text-primary">Transaction Volume (7d)</h2>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kpis.transactionVolume}>
              <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="#6B6B6B" fontSize={11} />
              <YAxis stroke="#6B6B6B" fontSize={11} />
              <Tooltip
                contentStyle={{ background: '#1F1F1F', border: '1px solid #2A2A2A' }}
                formatter={(value, name) =>
                  name === 'amount' ? formatInr(Number(value)) : value
                }
              />
              <Bar dataKey="count" fill="#CCFF00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
