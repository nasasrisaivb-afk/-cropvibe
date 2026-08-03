import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'
import { Select } from '../common/Select'
import { formatCurrency } from '../../utils/format'

export type CourseCategory = 'selfpaced' | 'live' | 'certifications'

type CourseStatus = 'active' | 'draft' | 'closed'

interface CourseItem {
  id: string
  name: string
  meta: string
  rate: number
  unit: string
  status: CourseStatus
  students: number
}

const DATA: Record<CourseCategory, CourseItem[]> = {
  selfpaced: [
    { id: 'C-101', name: 'Organic farming 101', meta: 'Video modules + quizzes', rate: 1800, unit: 'enrollment', status: 'active', students: 35 },
    { id: 'C-102', name: 'Soil health mastery', meta: 'Self-paced cohort', rate: 2600, unit: 'enrollment', status: 'active', students: 24 },
  ],
  live: [
    { id: 'C-201', name: 'IPM live workshop', meta: 'Live weekend cohort', rate: 3200, unit: 'seat', status: 'active', students: 18 },
    { id: 'C-202', name: 'Irrigation design workshop', meta: 'Weekly sessions', rate: 4200, unit: 'seat', status: 'draft', students: 7 },
  ],
  certifications: [
    { id: 'C-301', name: 'Crop advisor certification', meta: 'Exam + project', rate: 9800, unit: 'program', status: 'active', students: 12 },
    { id: 'C-302', name: 'Pest management cert', meta: 'Assessment-based', rate: 6500, unit: 'program', status: 'closed', students: 4 },
  ],
}

const TITLES: Record<CourseCategory, { title: string; description: string }> = {
  selfpaced: { title: 'Self-paced', description: 'Flexible learning paths for independent learners.' },
  live: { title: 'Live cohorts', description: 'Weekly and weekend workshops for guided learning.' },
  certifications: { title: 'Certifications', description: 'Credentialed programmes with exams and assessments.' },
}

function statusBadge(status: CourseStatus) {
  if (status === 'active') return 'active'
  if (status === 'draft') return 'pending'
  return 'inactive'
}

interface Props {
  category: CourseCategory
}

export function CourseCatalogPage({ category }: Props) {
  const navigate = useNavigate()
  const copy = TITLES[category]
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')

  const items = useMemo(() => {
    return DATA[category].filter((item) => {
      const matchQ = !q || item.name.toLowerCase().includes(q.toLowerCase()) || item.id.toLowerCase().includes(q.toLowerCase())
      const matchS = status === 'all' || item.status === status
      return matchQ && matchS
    })
  }, [category, q, status])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{copy.title}</h1>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">{copy.description}</p>
        </div>
        <Button onClick={() => navigate('/dashboard/create')}>+ Create course</Button>
      </div>

      <div className="flex flex-col gap-3 rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface)] p-4 sm:flex-row sm:items-end">
        <FormInput label="Search" placeholder="Course name or ID" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'active', label: 'Active' },
            { value: 'draft', label: 'Draft' },
            { value: 'closed', label: 'Closed' },
          ]}
        />
      </div>

      {items.length === 0 ? (
        <Card className="!rounded-[12px] py-12 text-center">
          <p className="text-lg font-semibold">No courses match</p>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">Try another search or create a new course.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="!rounded-[12px]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-[var(--cv-muted)]">{item.id}</p>
                  <h3 className="mt-1 font-semibold text-[var(--cv-text)]">{item.name}</h3>
                  <p className="mt-1 text-sm text-[var(--cv-muted)]">{item.meta}</p>
                </div>
                <Badge status={statusBadge(item.status)} />
              </div>
              <p className="mt-3 text-sm text-[var(--cv-muted)]">{item.students} enrolled</p>
              <p className="mt-1 text-lg font-bold text-[var(--cv-primary)]">
                {formatCurrency(item.rate)}
                <span className="text-sm font-medium text-[var(--cv-muted)]"> / {item.unit}</span>
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard/orders')}>Enrollments</Button>
                <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/reviews')}>Reviews</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
