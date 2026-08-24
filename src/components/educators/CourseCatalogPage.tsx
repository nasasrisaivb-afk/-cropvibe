import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'
import { PageHeader } from '../common/PageHeader'
import { Select } from '../common/Select'
import { Sheet } from '../common/Sheet'
import { useToast } from '../common/Toast'
import { useAppStore } from '../../store/appStore'
import { formatCurrency } from '../../utils/format'

export type CourseCategory = 'selfpaced' | 'live' | 'certifications'

type CourseStatus = 'active' | 'draft' | 'closed'

interface CourseItem {
  id: string
  title: string
  subtitle: string
  instructor: string
  rate: number
  unit: string
  status: CourseStatus
  students: number
  rating: number
  duration: string
  includes: string[]
}

const DATA: Record<CourseCategory, CourseItem[]> = {
  selfpaced: [
    {
      id: 'C-101',
      title: 'Organic Farming 101',
      subtitle: 'Video modules + quizzes',
      instructor: 'Dr. Ananya Rao',
      rate: 1800,
      unit: 'enrollment',
      status: 'active',
      students: 35,
      rating: 4.8,
      duration: '6 weeks',
      includes: ['12 video lessons', 'Quizzes', 'Downloadable notes', 'Certificate of completion'],
    },
    {
      id: 'C-102',
      title: 'Soil Health Mastery',
      subtitle: 'Self-paced cohort',
      instructor: 'Priya Sharma',
      rate: 2600,
      unit: 'enrollment',
      status: 'active',
      students: 24,
      rating: 4.9,
      duration: '8 weeks',
      includes: ['Soil lab walkthroughs', 'Practice assignments', 'Mentor Q&A board'],
    },
  ],
  live: [
    {
      id: 'C-201',
      title: 'IPM Live Workshop',
      subtitle: 'Live weekend cohort',
      instructor: 'Rakesh Kumar',
      rate: 3200,
      unit: 'seat',
      status: 'active',
      students: 18,
      rating: 4.6,
      duration: '2 weekends',
      includes: ['Live sessions', 'Field case studies', 'Recording access for 30 days'],
    },
    {
      id: 'C-202',
      title: 'Irrigation Design Workshop',
      subtitle: 'Weekly sessions',
      instructor: 'HydroGrow Faculty',
      rate: 4200,
      unit: 'seat',
      status: 'draft',
      students: 7,
      rating: 4.5,
      duration: '4 weeks',
      includes: ['Layout exercises', 'Live critiques', 'Template pack'],
    },
  ],
  certifications: [
    {
      id: 'C-301',
      title: 'Crop Advisor Certification',
      subtitle: 'Exam + project',
      instructor: 'CropVibe Academy',
      rate: 9800,
      unit: 'program',
      status: 'active',
      students: 12,
      rating: 4.7,
      duration: '12 weeks',
      includes: ['Proctored exam', 'Capstone project', 'Verified credential'],
    },
    {
      id: 'C-302',
      title: 'Pest Management Certificate',
      subtitle: 'Assessment-based',
      instructor: 'CropVibe Academy',
      rate: 6500,
      unit: 'program',
      status: 'closed',
      students: 4,
      rating: 4.4,
      duration: '8 weeks',
      includes: ['Study pack', 'Mock exam', 'Assessor review'],
    },
  ],
}

const PAGE_COPY: Record<
  CourseCategory,
  { learner: { eyebrow: string; title: string; subtitle: string }; educator: { eyebrow: string; title: string; subtitle: string } }
> = {
  selfpaced: {
    learner: {
      eyebrow: 'Courses / Self-paced',
      title: 'Find self-paced courses',
      subtitle: 'Learn at your own pace with video modules, quizzes, and certificates.',
    },
    educator: {
      eyebrow: 'My account / Courses / Self-paced',
      title: 'My self-paced courses',
      subtitle: 'Manage enrollments, content, and ratings for your programmes.',
    },
  },
  live: {
    learner: {
      eyebrow: 'Courses / Live cohorts',
      title: 'Join live workshops',
      subtitle: 'Weekend and weekly cohorts with live faculty and peer discussion.',
    },
    educator: {
      eyebrow: 'My account / Courses / Live',
      title: 'My live cohorts',
      subtitle: 'Schedule sessions, manage seats, and track attendance.',
    },
  },
  certifications: {
    learner: {
      eyebrow: 'Courses / Certifications',
      title: 'Earn a farm credential',
      subtitle: 'Exam-backed programmes that verify your advisory skills.',
    },
    educator: {
      eyebrow: 'My account / Courses / Certifications',
      title: 'My certification programmes',
      subtitle: 'Assess learners, issue credentials, and track completion.',
    },
  },
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
  const isEducator = useAppStore((s) => s.user?.activeRole === 'educator')
  const copy = PAGE_COPY[category][isEducator ? 'educator' : 'learner']
  const { showToast } = useToast()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [details, setDetails] = useState<CourseItem | null>(null)

  const items = useMemo(() => {
    return DATA[category].filter((item) => {
      const query = q.toLowerCase()
      const matchQ =
        !q ||
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.instructor.toLowerCase().includes(query)
      const matchS = status === 'all' || item.status === status
      return matchQ && matchS
    })
  }, [category, q, status])

  const enroll = (item: CourseItem) => {
    if (item.status !== 'active') {
      showToast({
        type: 'warning',
        title: 'Not open for enrollment',
        message: `${item.title} is ${item.status}.`,
      })
      return
    }
    showToast({
      type: 'success',
      title: 'Enrollment confirmed',
      message: `You are enrolled in ${item.title}.`,
      actionLabel: 'View enrollments',
      onAction: () => navigate('/dashboard/orders'),
      duration: 6000,
    })
    setDetails(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          isEducator ? (
            <Button onClick={() => navigate('/dashboard/create')}>+ Create course</Button>
          ) : undefined
        }
      />

      <div className="cv-dashboard-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <FormInput
          label="Search"
          placeholder="Search by course, topic, or instructor"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'active', label: 'Open for enrollment' },
            { value: 'draft', label: 'Coming soon' },
            { value: 'closed', label: 'Closed' },
          ]}
        />
      </div>

      {items.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-lg font-semibold">{q ? `No results for “${q}”` : 'No courses match'}</p>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">Try different keywords or clear filters.</p>
          <Button className="mt-4" variant="secondary" onClick={() => { setQ(''); setStatus('all') }}>
            Clear filters
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-[var(--cv-text)]">{item.title}</h3>
                  <p className="mt-0.5 text-sm text-[var(--cv-muted)]">{item.subtitle}</p>
                </div>
                <Badge status={statusBadge(item.status)} />
              </div>
              <p className="mt-3 text-sm text-[var(--cv-muted)]">
                By {item.instructor} · {item.duration}
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--cv-primary)]">
                {formatCurrency(item.rate)}
                <span className="text-sm font-medium text-[var(--cv-muted)]"> / {item.unit}</span>
              </p>
              <p className="mt-1 text-xs text-[var(--cv-muted)]">
                ⭐ {item.rating.toFixed(1)} · {item.students} enrolled
              </p>
              <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row">
                {isEducator ? (
                  <>
                    <Button className="flex-1 cv-touch min-h-[44px]" size="sm" variant="secondary" onClick={() => navigate('/dashboard/orders')}>
                      Manage enrollments
                    </Button>
                    <Button className="flex-1 cv-touch min-h-[44px]" size="sm" variant="ghost" onClick={() => setDetails(item)}>
                      View details
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="flex-1 cv-touch min-h-[44px]"
                      size="sm"
                      disabled={item.status !== 'active'}
                      onClick={() => enroll(item)}
                    >
                      Enroll now
                    </Button>
                    <Button className="flex-1 cv-touch min-h-[44px]" size="sm" variant="secondary" onClick={() => setDetails(item)}>
                      View details
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {isEducator ? (
        <div className="flex justify-center pt-2">
          <Button variant="secondary" onClick={() => navigate('/dashboard/create')}>
            + Add new course
          </Button>
        </div>
      ) : null}

      <Sheet open={details != null} title={details?.title ?? 'Course'} onClose={() => setDetails(null)}>
        {details ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--cv-muted)]">
              By {details.instructor} · {details.duration}
            </p>
            <p className="text-sm leading-relaxed text-[var(--cv-muted)]">{details.subtitle}</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-[var(--cv-muted)]">
              {details.includes.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="text-lg font-bold text-[var(--cv-primary)]">
              {formatCurrency(details.rate)}
              <span className="text-sm font-medium text-[var(--cv-muted)]"> / {details.unit}</span>
            </p>
            {isEducator ? (
              <Button fullWidth variant="secondary" onClick={() => { setDetails(null); navigate('/dashboard/orders') }}>
                Manage enrollments
              </Button>
            ) : (
              <Button fullWidth disabled={details.status !== 'active'} onClick={() => enroll(details)}>
                Enroll now
              </Button>
            )}
          </div>
        ) : null}
      </Sheet>
    </div>
  )
}
