import { useNavigate } from 'react-router-dom'
import {
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  BookOpenIcon,
  ChartBarIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  StarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
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
import { DashboardStatCard } from '../common/DashboardStatCard'
import { LargeTitle } from '../common/LargeTitle'
import { useAppStore } from '../../store/appStore'
import { CHART_THEME } from '../../theme/chartTheme'
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

const REVIEWS = [
  { text: 'Best farming course ever!', author: 'Student A' },
  { text: 'Very practical and useful.', author: 'Student B' },
]

function StatCard(props: Parameters<typeof DashboardStatCard>[0] & { emphasize?: boolean }) {
  const { emphasize, ...rest } = props
  return <DashboardStatCard featured={emphasize} {...rest} />
}

export function EducatorDashboard() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const theme = useAppStore((s) => s.theme)
  const chart = CHART_THEME[theme]
  const kycPending = user?.kycStatus === 'pending'
  const name = user?.profile.name?.split(' ')[0] ?? 'Ms. Patel'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="space-y-5 lg:space-y-6">
      {kycPending ? (
        <div className="flex items-start gap-3 rounded-[16px] border border-[var(--cv-warning)]/30 bg-[var(--color-warning-soft)] px-4 py-3 text-sm text-[var(--cv-warning)]">
          <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} />
          <div>
            <strong>KYC Pending — Review status.</strong> Creating courses stays locked until approval.
          </div>
        </div>
      ) : null}

      <LargeTitle
        eyebrow="Educator"
        title={`${greeting}, ${name}`}
        subtitle={`Last login: 4 hours ago · ${user?.profile.location ?? 'Ahmedabad, India'}`}
        actions={
          <>
            <Button disabled={kycPending} onClick={() => navigate('/dashboard/selfpaced')}>
              + Create Course
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard/selfpaced')}>
              View Courses
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <StatCard title="Total Revenue" value={formatCurrency(215400)} hint="5 courses" icon={CurrencyRupeeIcon} emphasize />
        <StatCard title="This Month" value={formatCurrency(45600)} hint="₹ 12,300" positive icon={ArrowTrendingUpIcon} />
        <StatCard title="Total Students" value="127" hint="98 active" icon={UserGroupIcon} />
        <StatCard title="Avg Completion" value="78%" hint="Up 8%" positive icon={ChartBarIcon} emphasize />
        <StatCard title="Student Rating" value="4.6 / 5.0" hint="92 reviews" icon={StarIcon} />
        <StatCard title="Certificates" value="45" hint="12 this month" icon={AcademicCapIcon} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Card className="!rounded-2xl !p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--cv-border)] px-5 py-4">
            <div>
              <h3 className="font-semibold text-[var(--cv-text)]">Active Courses</h3>
              <p className="text-xs text-[var(--cv-muted)]">Enrollment and completion snapshot</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/live')}>
              Manage all
            </Button>
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--cv-border)] text-xs uppercase tracking-wide text-[var(--cv-muted)]">
                  <th className="px-5 py-3 font-medium">Course</th>
                  <th className="px-5 py-3 font-medium">Students</th>
                  <th className="px-5 py-3 font-medium">Completion</th>
                  <th className="px-5 py-3 font-medium">Rating</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {COURSES.map((c) => (
                  <tr key={c.name} className="border-b border-[var(--cv-border)] last:border-0 hover:bg-[var(--cv-elevated)]">
                    <td className="px-5 py-3.5 font-semibold text-[var(--cv-text)]">{c.name}</td>
                    <td className="px-5 py-3.5 text-[var(--cv-muted)]">{c.students}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--cv-elevated)]">
                          <div className="h-full rounded-full bg-[var(--cv-primary)]" style={{ width: `${c.completion}%` }} />
                        </div>
                        <span className="text-[var(--cv-muted)]">{c.completion}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[var(--cv-text)]">{c.rating}</td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        className="font-semibold text-[var(--cv-primary)] hover:underline"
                        onClick={() => navigate('/dashboard/listings')}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-2 p-4 md:hidden">
            {COURSES.map((c) => (
              <div key={c.name} className="rounded-xl border border-[var(--cv-border)] bg-[var(--cv-elevated)] p-3">
                <p className="font-semibold text-[var(--cv-text)]">{c.name}</p>
                <p className="mt-1 text-sm text-[var(--cv-muted)]">
                  {c.students} students · {c.completion}% · {c.rating}★
                </p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="!rounded-2xl border-[var(--cv-warning)]/30 bg-[var(--color-warning-soft)]">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-warning-soft)] text-[var(--cv-warning)]">
                <ExclamationTriangleIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[var(--cv-text)]">Students at risk</h3>
                <p className="mt-1 text-sm text-[var(--cv-muted)]">
                  <strong className="text-[var(--cv-text)]">3 students</strong> below 30% progress.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => navigate('/dashboard/messages')}>
                    Contact students
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/orders')}>
                    Offer support
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="!rounded-2xl border-[var(--cv-primary)]/20 bg-[var(--cv-primary-soft)]">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--cv-surface)] text-[var(--cv-primary)]">
                <AcademicCapIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[var(--cv-text)]">Certificates ready</h3>
                <p className="mt-1 text-sm text-[var(--cv-muted)]">
                  <strong className="text-[var(--cv-text)]">12 students</strong> completed their courses.
                </p>
                <div className="mt-3">
                  <Button size="sm">Issue certificates</Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="!rounded-2xl" title="Recent Reviews">
            <ul className="space-y-3">
              {REVIEWS.map((r) => (
                <li key={r.author} className="text-sm text-[var(--cv-muted)]">
                  <span className="text-[var(--cv-primary)]">★★★★★</span>
                  <span className="mt-1 block">
                    &quot;{r.text}&quot; — {r.author}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="!rounded-2xl">
          <div className="mb-4">
            <h3 className="font-semibold text-[var(--cv-text)]">Student Engagement</h3>
            <p className="text-xs text-[var(--cv-muted)]">Enrollments vs completion rate</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ENGAGEMENT}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: chart.tick }} />
                <YAxis tick={{ fontSize: 12, fill: chart.tick }} />
                <Tooltip
                  contentStyle={{
                    background: chart.tooltipBg,
                    border: `1px solid ${chart.tooltipBorder}`,
                    borderRadius: 12,
                    color: 'var(--cv-text)',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="enrollments" stroke={chart.accent} strokeWidth={2} name="Enrollments" />
                <Line type="monotone" dataKey="completion" stroke={chart.secondary} strokeWidth={2} name="Completion %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="!rounded-2xl" title="Revenue by Course">
          <div className="space-y-4">
            {REVENUE.map((r) => (
              <div key={r.name}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium text-[var(--cv-muted)]">{r.name}</span>
                  <span className="font-semibold text-[var(--cv-primary)]">{formatCurrency(r.amount)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--cv-elevated)]">
                  <div className="h-full rounded-full bg-[var(--cv-primary)]" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => navigate('/dashboard/orders')}>
          <UserGroupIcon className="h-4 w-4" />
          Manage Students
        </Button>
        <Button variant="ghost" onClick={() => navigate('/dashboard/listings')}>
          <BookOpenIcon className="h-4 w-4" />
          Course Catalog
        </Button>
      </div>
    </div>
  )
}
