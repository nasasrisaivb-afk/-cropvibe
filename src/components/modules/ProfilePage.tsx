import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRightIcon,
  CurrencyRupeeIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { getActionNavItems, ROLE_LABELS } from '../../config/navigation'
import { useAppStore } from '../../store/appStore'
import type { PageId } from '../../types/roles'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'
import { PageHeader } from '../common/PageHeader'
import { RoleSwitcher } from '../common/RoleSwitcher'

const ACTION_ICONS: Partial<Record<PageId, typeof StarIcon>> = {
  reviews: StarIcon,
  mandi: CurrencyRupeeIcon,
}

export function ProfilePage() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const logout = useAppStore((s) => s.logout)
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState(user?.profile.name ?? '')
  const [phone, setPhone] = useState(user?.profile.phone ?? '')
  const [email, setEmail] = useState(user?.profile.email ?? '')
  const [location, setLocation] = useState(user?.profile.location ?? '')

  const kyc = user?.kycStatus ?? 'none'
  const roleCount = user?.roles?.length ?? 0
  const actionItems = getActionNavItems(user?.activeRole ?? 'seller')
  const kycPending = kyc === 'pending'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        subtitle={`Personal and business identity for ${ROLE_LABELS[user?.activeRole ?? 'seller']}.`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setSaved(true)
                setTimeout(() => setSaved(false), 2000)
              }}
            >
              Save changes
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              Logout
            </Button>
          </div>
        }
      />

      {saved ? (
        <div className="rounded-[12px] border border-[var(--cv-primary)]/30 bg-[var(--cv-primary-soft)] px-4 py-3 text-sm text-[var(--cv-primary)]">
          Profile updated successfully.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="space-y-4">
          <Card className="!rounded-[12px] text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--cv-primary)] text-2xl font-semibold text-[var(--cv-btn-text)]">
              {(name || 'U').slice(0, 1)}
            </div>
            <p className="mt-3 font-semibold">{name || 'User'}</p>
            <p className="text-sm text-[var(--cv-muted)]">{ROLE_LABELS[user?.activeRole ?? 'seller']}</p>
            <div className="mt-3 flex justify-center">
              <Badge
                status={
                  kyc === 'approved' ? 'approved' : kyc === 'pending' ? 'pending' : 'rejected'
                }
              >{`KYC ${kyc}`}</Badge>
            </div>
            <Button className="mt-4" size="sm" variant="secondary" fullWidth>
              Upload photo
            </Button>
            {kycPending ? (
              <Button className="mt-2" size="sm" fullWidth onClick={() => navigate('/kyc-status')}>
                Complete KYC
              </Button>
            ) : null}
          </Card>

          <Card className="!rounded-[12px]" title="Action">
            <ul className="divide-y divide-[var(--cv-border)]">
              {actionItems.map((item) => {
                const Icon = ACTION_ICONS[item.id] ?? StarIcon
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="focus-ring flex w-full items-center gap-3 rounded-lg px-1 py-2.5 text-left transition hover:bg-[var(--cv-elevated)]"
                      onClick={() => navigate(item.path)}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--cv-elevated)] text-[var(--cv-text)]">
                        <Icon className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-medium text-[var(--cv-text)]">
                        {item.label}
                      </span>
                      {item.count ? (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--cv-blue)] px-1.5 text-[11px] font-bold text-white">
                          {item.count}
                        </span>
                      ) : null}
                      <ChevronRightIcon className="h-4 w-4 shrink-0 text-[var(--cv-muted)]" strokeWidth={2} />
                    </button>
                  </li>
                )
              })}
            </ul>
          </Card>
        </div>

        <div className="space-y-4">
          <Card
            className="!rounded-[12px]"
            title="Switch role"
            subtitle={
              roleCount > 1
                ? 'Choose which workspace you are working in. Navigation and tools update instantly.'
                : undefined
            }
          >
            <RoleSwitcher />
          </Card>

          <Card className="!rounded-[12px]" title="Personal information">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
              <FormInput label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <FormInput label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <FormInput
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </Card>

          <Card className="!rounded-[12px]" title="Business & bank">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput label="Business name" placeholder="Green Valley Farms" />
              <FormInput label="GSTIN (optional)" placeholder="22AAAAA0000A1Z5" />
              <FormInput label="Account holder" placeholder="As per bank records" />
              <FormInput label="IFSC" placeholder="HDFC0001234" />
            </div>
            <p className="mt-3 text-xs text-[var(--cv-muted)]">
              Bank account is required before the first payout. Sensitive changes are audit-logged.
            </p>
          </Card>

          <Card
            className="!rounded-[12px]"
            title="Reviews & reputation"
            subtitle="Ratings from renters and buyers tied to this profile."
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-2xl font-semibold text-[var(--cv-text)]">4.8</p>
                <p className="text-sm text-[var(--cv-muted)]">Average · 89 reviews</p>
              </div>
              <Button variant="secondary" onClick={() => navigate('/dashboard/reviews')}>
                View all reviews
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
