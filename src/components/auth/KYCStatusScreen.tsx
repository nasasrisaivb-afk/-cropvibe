import { useLocation, useNavigate } from 'react-router-dom'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { useAppStore } from '../../store/appStore'
import type { Role, User } from '../../types/roles'

export function KYCStatusScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAppStore((s) => s.login)
  const setKycStatus = useAppStore((s) => s.setKycStatus)
  const user = useAppStore((s) => s.user)

  const state = location.state as
    | { fromSignup?: boolean; roles?: Role[]; name?: string; email?: string }
    | null

  const ensureUser = () => {
    if (user) return user
    const roles = state?.roles?.length ? state.roles : (['seller', 'buyer'] as Role[])
    const demo: User = {
      id: 'u-new',
      profile: {
        name: state?.name || 'New User',
        email: state?.email || 'user@cropvibe.app',
        phone: '',
        location: 'Hyderabad, India',
      },
      roles,
      activeRole: roles[0],
      kycStatus: 'pending',
    }
    login(demo)
    return demo
  }

  const status = user?.kycStatus ?? 'pending'

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--cv-bg)] px-4 py-10">
      <div className="w-full max-w-lg rounded-xl border border-[var(--cv-border)] bg-[var(--cv-surface)] p-8">
        <div className="text-center">
          <span className="text-4xl">🌱</span>
          <h1 className="cv-logo mt-4 text-3xl">
            {status === 'approved' ? 'Account Verified' : 'Submitted for Review'}
          </h1>
          <div className="mt-3 flex justify-center">
            <Badge status={status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending'} />
          </div>
        </div>

        <p className="mt-4 text-center text-[var(--cv-muted)]">
          {status === 'approved'
            ? 'Welcome! Your account is fully verified.'
            : 'Typically approved within 24–48 hours. You can browse as a buyer while waiting.'}
        </p>

        <div className="mt-6 space-y-3 rounded-lg bg-[var(--cv-elevated)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cv-muted)]">Document checklist</p>
          {['Aadhaar Card', 'PAN Card', 'Role documents'].map((doc) => (
            <div key={doc} className="flex items-center justify-between text-sm text-[var(--cv-text)]">
              <span>{doc}</span>
              <Badge status={status === 'approved' ? 'approved' : 'pending'} />
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-[var(--cv-warning)]/30 bg-[rgba(245,185,66,0.12)] p-3 text-sm text-[var(--cv-warning)]">
          <strong>KYC Pending — Review status</strong>
          <p className="mt-1">Locked until approval: Create listings, rent equipment, offer services, full messaging.</p>
          <p className="mt-1">Available: Browse as buyer, wallet (read-only), limited messages, profile view.</p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            fullWidth
            size="lg"
            onClick={() => {
              ensureUser()
              if (status === 'pending') setKycStatus('pending')
              navigate('/dashboard')
            }}
          >
            Go to Dashboard
          </Button>
          {(status === 'rejected' || status === 'resubmit') && (
            <Button fullWidth variant="secondary" onClick={() => navigate('/register')}>
              Resubmit Documents
            </Button>
          )}
          <Button
            fullWidth
            variant="ghost"
            onClick={() => {
              ensureUser()
              setKycStatus('approved')
              navigate('/dashboard')
            }}
          >
            Simulate KYC Approval (demo)
          </Button>
        </div>
      </div>
    </main>
  )
}
