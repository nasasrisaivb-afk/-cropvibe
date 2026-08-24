import { verificationLabel } from './serviceCatalogData'
import type { ServiceProviderProfile, VerificationBadge } from './serviceCatalogTypes'

interface Props {
  providerName: string
  profile: ServiceProviderProfile
}

const BADGE_ICONS: Record<VerificationBadge, string> = {
  identity: '🪪',
  email: '✉️',
  phone: '📱',
  tax: '🧾',
  expert: '✓',
}

export function ServiceProviderSection({ providerName, profile }: Props) {
  return (
    <section aria-labelledby="provider-heading" className="cv-dashboard-panel space-y-4 p-5">
      <h2 id="provider-heading" className="text-lg font-semibold text-[var(--cv-text)]">
        Provider
      </h2>
      <div className="flex gap-4">
        <div
          aria-hidden
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--cv-primary)]/15 text-xl font-bold text-[var(--cv-primary)]"
        >
          {providerName.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold text-[var(--cv-text)]">{providerName}</p>
          <p className="text-sm text-[var(--cv-muted)]">{profile.title}</p>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">
            {profile.experienceYears}+ years · Responds in {profile.responseTime}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Response rate" value={`${profile.responseRate}%`} />
        <Stat label="Acceptance" value={`${profile.acceptanceRate}%`} />
        <Stat label="On-time" value={`${profile.onTimeRate}%`} />
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--cv-text)]">Specializations</p>
        <ul className="mt-1.5 flex flex-wrap gap-2">
          {profile.specializations.map((s) => (
            <li
              key={s}
              className="rounded-full border border-[var(--cv-border)] px-2.5 py-0.5 text-xs text-[var(--cv-muted)]"
            >
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--cv-text)]">Certifications</p>
        <ul className="mt-1.5 space-y-1 text-sm text-[var(--cv-muted)]">
          {profile.certifications.map((c) => (
            <li key={c}>✓ {c}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--cv-text)]">Verification</p>
        <ul className="mt-1.5 flex flex-wrap gap-2">
          {profile.verifications.map((v) => (
            <li
              key={v}
              className="flex items-center gap-1 rounded-[8px] bg-[var(--cv-success,#4CAF50)]/10 px-2 py-1 text-xs font-medium text-[var(--cv-text)]"
            >
              <span aria-hidden>{BADGE_ICONS[v]}</span>
              {verificationLabel(v)}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-2 border-t border-[var(--cv-border)] pt-4 text-sm text-[var(--cv-muted)] sm:grid-cols-3">
        <p>📊 {profile.verifiedBookings} verified bookings</p>
        <p>👥 {profile.repeatCustomers} repeat customers</p>
        <p>📍 Serves: {profile.serviceAreas.join(', ')}</p>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[var(--cv-border)] bg-[var(--cv-surface)] px-3 py-2">
      <p className="text-xs text-[var(--cv-muted)]">{label}</p>
      <p className="text-sm font-semibold text-[var(--cv-text)]">{value}</p>
    </div>
  )
}
