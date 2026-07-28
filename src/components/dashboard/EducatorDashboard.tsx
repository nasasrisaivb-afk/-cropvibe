import { useNavigate } from 'react-router-dom'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { MetricCard } from '../common/MetricCard'
import { useAppStore } from '../../store/appStore'
import { formatCurrency } from '../../utils/format'

const COURSES = [
  { name: 'Organic Farming 101', students: 35, completion: 78, rating: 4.8 },
  { name: 'IPM Techniques', students: 24, completion: 65, rating: 4.5 },
  { name: 'Soil Health Mastery', students: 18, completion: 82, rating: 4.9 },
  { name: 'Crop Planning 101', students: 28, completion: 71, rating: 4.4 },
  { name: 'Irrigation Design', students: 22, completion: 69, rating: 4.7 },
]

const ENGAGEMENT = [
  { month: 'Feb', enrollments: 18, completion: 62 },
  { month: 'Mar', enrollments: 22, completion: 65 },
  { month: 'Apr', enrollments: 28, completion: 70 },
  { month: 'May', enrollments: 24, completion: 72 },
  { month: 'Jun', enrollments: 32, completion: 75 },
  { month: 'Jul', enrollments: 35, completion: 78 },
]

const REVENUE = [
  { name: 'Organic Farming 101', amount: 85000, pct: 100 },
  { name: 'Soil Health Mastery', amount: 58200, pct: 68 },
  { name: 'IPM Techniques', amount: 42100, pct: 50 },
  { name: 'Crop Planning 101', amount: 38600, pct: 45 },
  { name: 'Irrigation Design', amount: 28300, pct: 33 },
]

export function EducatorDashboard() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const kycPending = user?.kycStatus === 'pending'
  const name = user?.profile.name?.split(' ')[0] ?? 'Ms. Patel'

  return (
    <div className="space-y-6">
      {kycPending && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>KYC Pending.</strong> Creating courses is locked until approval.
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold">Hello, {name}! 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Last login: 4 hours ago | Ahmedabad, India</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard title="Total Revenue" value={formatCurrency(215400)} subtitle="5 courses" icon="💰" roleColor="educator" />
        <MetricCard title="This Month" value={formatCurrency(45600)} delta="₹ 12,300" deltaPositive icon="📊" roleColor="educator" />
        <MetricCard title="Total Students" value="127" subtitle="98 active" icon="👨‍🎓" roleColor="educator" />
        <MetricCard title="Avg Completion" value="78%" delta="Up 8%" deltaPositive icon="📈" roleColor="educator" />
        <MetricCard title="Student Rating" value="4.6/5.0 ⭐" subtitle="92 reviews" icon="⭐" roleColor="educator" />
        <MetricCard title="Certificates" value="45" subtitle="This month: 12" icon="🎓" roleColor="educator" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button roleColor="educator" disabled={kycPending} onClick={() => navigate('/dashboard/create')}>+ Create Course</Button>
        <Button variant="secondary" roleColor="educator" onClick={() => navigate('/dashboard/listings')}>View Courses</Button>
        <Button variant="secondary" roleColor="educator" onClick={() => navigate('/dashboard/orders')}>Manage Students</Button>
        <Button variant="secondary" roleColor="educator">Issue Certificates</Button>
      </div>

      <Card title="Active Courses">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                <th className="px-3 py-2">Course</th>
                <th className="px-3 py-2">Students</th>
                <th className="px-3 py-2">Completion</th>
                <th className="px-3 py-2">Rating</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {COURSES.map((c) => (
                <tr key={c.name} className="border-b border-slate-100">
                  <td className="px-3 py-3 font-medium">{c.name}</td>
                  <td className="px-3 py-3">{c.students}</td>
                  <td className="px-3 py-3">{c.completion}%</td>
                  <td className="px-3 py-3">{c.rating}⭐</td>
                  <td className="px-3 py-3">
                    <button type="button" className="font-semibold text-purple-900 hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 md:hidden">
          {COURSES.map((c) => (
            <div key={c.name} className="rounded-lg border p-3">
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-slate-500">{c.students} students · {c.completion}% · {c.rating}⭐</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Student Engagement">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ENGAGEMENT}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="enrollments" stroke="#3498DB" strokeWidth={2} name="Enrollments" />
                <Line type="monotone" dataKey="completion" stroke="#27AE60" strokeWidth={2} name="Completion %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <div className="space-y-6">
          <Card title="Student Progress Alerts">
            <div className="space-y-3">
              <div className="rounded-lg bg-orange-50 p-3">
                <p className="text-sm text-orange-700">⚠️ 3 students at risk (&lt; 30% progress)</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" roleColor="educator">Contact students</Button>
                  <Button size="sm" variant="secondary" roleColor="educator">Offer support</Button>
                </div>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-sm text-green-700">✓ 12 students ready for certificate</p>
                <div className="mt-2">
                  <Button size="sm" roleColor="educator">Issue certificates</Button>
                </div>
              </div>
            </div>
          </Card>
          <Card title="Recent Reviews">
            <ul className="space-y-2 text-sm text-slate-600">
              <li>⭐⭐⭐⭐⭐ &quot;Best farming course ever!&quot; — Student A</li>
              <li>⭐⭐⭐⭐⭐ &quot;Very practical and useful.&quot; — Student B</li>
            </ul>
          </Card>
        </div>
      </div>

      <Card title="Revenue Breakdown">
        <div className="space-y-4">
          {REVENUE.map((r) => (
            <div key={r.name}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{r.name}</span>
                <span className="font-semibold text-purple-900">{formatCurrency(r.amount)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-purple-900" style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
