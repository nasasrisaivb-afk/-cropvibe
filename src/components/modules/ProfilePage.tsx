import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/appStore'
import { ROLE_LABELS } from '../../config/navigation'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">
            Personal and business identity for {ROLE_LABELS[user?.activeRole ?? 'seller']}.
          </p>
        </div>
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
      </div>

      {saved ? (
        <div className="rounded-[12px] border border-[var(--cv-primary)]/30 bg-[var(--cv-primary-soft)] px-4 py-3 text-sm text-[var(--cv-primary)]">
          Profile updated successfully.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <Card className="!rounded-[12px] text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--cv-primary)] text-2xl font-bold text-white">
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
        </Card>

        <div className="space-y-4">
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

          <Card className="!rounded-[12px]" title="Roles on this account">
            <ul className="flex flex-wrap gap-2">
              {(user?.roles ?? []).map((r) => (
                <li
                  key={r}
                  className="rounded-full bg-[var(--cv-elevated)] px-3 py-1 text-sm font-medium text-[var(--cv-muted)]"
                >
                  {ROLE_LABELS[r]}
                  {r === user?.activeRole ? ' · Active' : ''}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
