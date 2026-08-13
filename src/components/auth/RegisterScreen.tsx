import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ALL_ROLES,
  ROLE_DESCRIPTIONS,
  ROLE_ICONS,
  ROLE_TITLES,
  type Role,
} from '../../types/roles'
import { ROLE_COLORS, ROLE_SOFT } from '../../types/roles'
import { ROLE_LABELS } from '../../config/navigation'
import { useAppStore } from '../../store/appStore'
import { Button } from '../common/Button'
import { FormInput } from '../common/FormInput'
import { Select } from '../common/Select'
import { cn } from '../../utils/format'

const DRAFT_KEY = 'cropvibe_signup_draft'

interface SignupData {
  email: string
  password: string
  confirmPassword: string
  roles: Role[]
  fullName: string
  phone: string
  businessName: string
  businessType: string
  experience: string
  address: string
  gst: string
  companySize: string
  equipmentType: string
  insurance: string
  serviceType: string
  certifications: string
  serviceArea: string
  languages: string[]
  subject: string
  qualification: string
  platform: string
  accountHolder: string
  bankName: string
  accountNumber: string
  ifsc: string
  upi: string
}

const empty: SignupData = {
  email: '',
  password: '',
  confirmPassword: '',
  roles: [],
  fullName: '',
  phone: '',
  businessName: '',
  businessType: '',
  experience: '',
  address: '',
  gst: '',
  companySize: '',
  equipmentType: '',
  insurance: '',
  serviceType: '',
  certifications: '',
  serviceArea: '',
  languages: [],
  subject: '',
  qualification: '',
  platform: '',
  accountHolder: '',
  bankName: '',
  accountNumber: '',
  ifsc: '',
  upi: '',
}

const LANGS = ['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Kannada']

export function RegisterScreen() {
  const navigate = useNavigate()
  const setSignupDraft = useAppStore((s) => s.setSignupDraft)
  const [step, setStep] = useState(1)
  const [data, setData] = useState<SignupData>(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as { step: number; data: SignupData }
      setData(parsed.data)
      setStep(parsed.step)
    } catch {
      /* ignore */
    }
  }, [])

  const primaryRole = data.roles[0] ?? 'seller'
  const progress = useMemo(() => (step / 7) * 100, [step])

  const update = <K extends keyof SignupData>(key: K, value: SignupData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key as string]
      return next
    })
  }

  const toggleRole = (role: Role) => {
    setData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role) ? prev.roles.filter((r) => r !== role) : [...prev.roles, role],
    }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next.roles
      return next
    })
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (step === 1) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) next.email = 'Enter a valid email'
      if (!/^(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(data.password)) {
        next.password = 'Min 8 chars, 1 number, 1 special character'
      }
      if (data.password !== data.confirmPassword) next.confirmPassword = 'Passwords do not match'
    }
    if (step === 2 && data.roles.length === 0) next.roles = 'Select at least one role'
    if (step === 3) {
      if (!data.fullName.trim()) next.fullName = 'Required'
      if (data.phone && !/^\d{10}$/.test(data.phone)) next.phone = '10-digit phone required'
    }
    if (step === 4) {
      if (data.roles.includes('seller') || data.roles.includes('buyer') || data.roles.includes('rental')) {
        if (!data.businessName.trim()) next.businessName = 'Required'
      }
      if (data.roles.includes('service') && !data.serviceType) next.serviceType = 'Required'
      if (data.roles.includes('educator') && !data.subject.trim()) next.subject = 'Required'
    }
    if (step === 5) {
      if (!data.accountHolder.trim()) next.accountHolder = 'Required'
      if (!data.bankName.trim()) next.bankName = 'Required'
      if (!data.accountNumber.trim()) next.accountNumber = 'Required'
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(data.ifsc)) next.ifsc = 'Invalid IFSC'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const saveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, data }))
    setSignupDraft({ step, data })
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const nextStep = () => {
    if (!validate()) return
    if (step < 7) setStep((s) => s + 1)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (step < 7) {
      nextStep()
      return
    }
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        step: 7,
        data,
        kycSubmitted: true,
      }),
    )
    setSignupDraft({ ...data, kycSubmitted: true })
    navigate('/kyc-status', { state: { fromSignup: true, roles: data.roles, name: data.fullName, email: data.email } })
  }

  return (
    <main className="min-h-screen bg-[var(--cv-bg)] px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/login" className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="cv-logo text-xl">
              Crop<span className="cv-logo-accent">Vibe</span>
            </span>
          </Link>
          <span className="text-sm text-[var(--cv-muted)]">Step {step} of 7</span>
        </div>

        <div className="mb-6 h-2 overflow-hidden rounded-full bg-[var(--cv-elevated)]">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, backgroundColor: ROLE_COLORS[primaryRole] }}
          />
        </div>

        <form onSubmit={submit} className="rounded-xl border border-[var(--cv-border)] bg-[var(--cv-surface)] p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-[var(--cv-text)]">Create Account</h1>
              <FormInput label="Email" type="email" value={data.email} onChange={(e) => update('email', e.target.value)} required error={errors.email} />
              <FormInput
                label="Password"
                type="password"
                value={data.password}
                onChange={(e) => update('password', e.target.value)}
                required
                error={errors.password}
                helperText="Min 8 characters, 1 number, 1 special character"
              />
              <FormInput
                label="Confirm Password"
                type="password"
                value={data.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                required
                error={errors.confirmPassword}
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-3xl font-bold text-[var(--cv-text)]">What do you do?</h1>
              <p className="mt-2 text-[var(--cv-muted)]">Select one or more roles that apply to you</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {ALL_ROLES.map((role) => {
                  const selected = data.roles.includes(role)
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border-2 p-4 text-left transition',
                        selected ? 'shadow-md' : 'border-[var(--cv-border)] hover:border-[var(--cv-border)]',
                      )}
                      style={selected ? { borderColor: ROLE_COLORS[role], backgroundColor: ROLE_SOFT[role] } : undefined}
                    >
                      <span className="text-2xl">{ROLE_ICONS[role]}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold">{ROLE_TITLES[role]}</p>
                          <input type="checkbox" checked={selected} readOnly className="h-4 w-4" />
                        </div>
                        <p className="mt-1 text-xs text-[var(--cv-muted)]">{ROLE_DESCRIPTIONS[role]}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
              {errors.roles ? <p className="mt-3 text-sm text-[var(--cv-danger)]">{errors.roles}</p> : null}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Personal Information</h1>
              <FormInput label="Full Name" value={data.fullName} onChange={(e) => update('fullName', e.target.value)} required error={errors.fullName} />
              <FormInput label="Email" type="email" value={data.email} disabled helperText="From step 1" />
              <FormInput
                label="Phone"
                type="tel"
                value={data.phone}
                onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                error={errors.phone}
                helperText="Optional"
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Business Information</h1>
              <p className="text-sm text-[var(--cv-muted)]">
                Fields adapt to: {data.roles.map((r) => ROLE_LABELS[r]).join(', ')}
              </p>
              {(data.roles.includes('seller') || data.roles.includes('buyer') || data.roles.includes('rental')) && (
                <FormInput label="Business Name" value={data.businessName} onChange={(e) => update('businessName', e.target.value)} required error={errors.businessName} />
              )}
              {data.roles.includes('seller') && (
                <Select
                  label="Business Type"
                  value={data.businessType}
                  onChange={(e) => update('businessType', e.target.value)}
                  options={['Fruits', 'Vegetables', 'Grains', 'Dairy', 'Seeds', 'Fertilizer', 'Pesticides', 'Organic', 'Livestock'].map((o) => ({ value: o, label: o }))}
                  required
                />
              )}
              {data.roles.includes('buyer') && (
                <>
                  <Select label="Business Type" value={data.businessType} onChange={(e) => update('businessType', e.target.value)} options={['Retail', 'Wholesale', 'Restaurant', 'Supermarket'].map((o) => ({ value: o, label: o }))} />
                  <Select label="Company Size" value={data.companySize} onChange={(e) => update('companySize', e.target.value)} options={['Small', 'Medium', 'Large'].map((o) => ({ value: o, label: o }))} />
                </>
              )}
              {data.roles.includes('rental') && (
                <Select label="Equipment Specialization" value={data.equipmentType} onChange={(e) => update('equipmentType', e.target.value)} options={['Tractors', 'Harvesters', 'Sprayers', 'Rotavators', 'Pumps'].map((o) => ({ value: o, label: o }))} />
              )}
              {data.roles.includes('service') && (
                <>
                  <Select label="Service Type" value={data.serviceType} onChange={(e) => update('serviceType', e.target.value)} options={['Soil Testing', 'Farm Consultancy', 'Mechanic', 'Irrigation', 'Repair', 'Drone Spraying', 'Crop Inspection'].map((o) => ({ value: o, label: o }))} required error={errors.serviceType} />
                  <FormInput label="Service Area (km)" type="number" value={data.serviceArea} onChange={(e) => update('serviceArea', e.target.value)} />
                  <div>
                    <p className="mb-2 text-sm">Languages Spoken</p>
                    <div className="flex flex-wrap gap-2">
                      {LANGS.map((lang) => (
                        <label key={lang} className="flex items-center gap-2 rounded-md border border-[var(--cv-border)] px-3 py-2 text-sm">
                          <input
                            type="checkbox"
                            checked={data.languages.includes(lang)}
                            onChange={() =>
                              update(
                                'languages',
                                data.languages.includes(lang)
                                  ? data.languages.filter((l) => l !== lang)
                                  : [...data.languages, lang],
                              )
                            }
                          />
                          {lang}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {data.roles.includes('educator') && (
                <>
                  <FormInput label="Subject / Topic Area" value={data.subject} onChange={(e) => update('subject', e.target.value)} required error={errors.subject} />
                  <Select label="Qualification" value={data.qualification} onChange={(e) => update('qualification', e.target.value)} options={["Bachelor's", "Master's", 'Diploma', 'Certificate', 'Other'].map((o) => ({ value: o, label: o }))} />
                  <Select label="Platform Preference" value={data.platform} onChange={(e) => update('platform', e.target.value)} options={['Online', 'Offline', 'Hybrid'].map((o) => ({ value: o, label: o }))} />
                </>
              )}
              <FormInput label="Years of Experience" type="number" value={data.experience} onChange={(e) => update('experience', e.target.value)} />
              <FormInput label="Address" value={data.address} onChange={(e) => update('address', e.target.value)} />
              <FormInput label="GST Number" value={data.gst} onChange={(e) => update('gst', e.target.value)} helperText="Optional" />
              {data.roles.includes('rental') && (
                <FormInput label="Insurance Provider" value={data.insurance} onChange={(e) => update('insurance', e.target.value)} helperText="Optional" />
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Bank Details</h1>
              <p className="text-sm text-[var(--cv-muted)]">We&apos;ll use this for payouts</p>
              <FormInput label="Account Holder Name" value={data.accountHolder} onChange={(e) => update('accountHolder', e.target.value)} required error={errors.accountHolder} />
              <FormInput label="Bank Name" value={data.bankName} onChange={(e) => update('bankName', e.target.value)} required error={errors.bankName} />
              <FormInput label="Account Number" value={data.accountNumber} onChange={(e) => update('accountNumber', e.target.value)} required error={errors.accountNumber} />
              <FormInput label="IFSC Code" value={data.ifsc} onChange={(e) => update('ifsc', e.target.value.toUpperCase())} required error={errors.ifsc} maxLength={11} />
              <FormInput label="UPI ID" value={data.upi} onChange={(e) => update('upi', e.target.value)} helperText="Optional" />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">KYC Documents</h1>
              <p className="text-sm text-[var(--cv-muted)]">Clear photos required. Role-specific docs appear below.</p>
              {['Aadhaar Card', 'PAN Card'].map((doc) => (
                <div key={doc} className="rounded-lg border-2 border-dashed border-[var(--cv-border)] p-4">
                  <p className="font-medium">{doc} <span className="text-[var(--cv-danger)]">*</span></p>
                  <input type="file" accept="image/*,.pdf" className="mt-2 block w-full text-sm" />
                </div>
              ))}
              {data.roles.includes('seller') && (
                <div className="rounded-lg border-2 border-dashed border-[var(--cv-border)] p-4">
                  <p className="font-medium">Business Registration (optional)</p>
                  <p className="text-xs text-[var(--cv-muted)]">Clear photos, all 4 sides visible</p>
                  <input type="file" accept="image/*,.pdf" className="mt-2 block w-full text-sm" />
                </div>
              )}
              {data.roles.includes('buyer') && (
                <div className="rounded-lg border-2 border-dashed border-[var(--cv-border)] p-4">
                  <p className="font-medium">GST Certificate (if applicable)</p>
                  <input type="file" accept="image/*,.pdf" className="mt-2 block w-full text-sm" />
                </div>
              )}
              {data.roles.includes('rental') && (
                <>
                  <div className="rounded-lg border-2 border-dashed border-[var(--cv-border)] p-4">
                    <p className="font-medium">Equipment Ownership Proof <span className="text-[var(--cv-danger)]">*</span></p>
                    <input type="file" accept="image/*,.pdf" className="mt-2 block w-full text-sm" />
                  </div>
                  <div className="rounded-lg border-2 border-dashed border-[var(--cv-border)] p-4">
                    <p className="font-medium">Insurance Certificate (optional)</p>
                    <input type="file" accept="image/*,.pdf" className="mt-2 block w-full text-sm" />
                  </div>
                </>
              )}
              {(data.roles.includes('service') || data.roles.includes('educator')) && (
                <div className="rounded-lg border-2 border-dashed border-[var(--cv-border)] p-4">
                  <p className="font-medium">Certifications / Qualifications <span className="text-[var(--cv-danger)]">*</span></p>
                  <input type="file" accept="image/*,.pdf" className="mt-2 block w-full text-sm" />
                </div>
              )}
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4 text-center">
              <div className="text-5xl">📋</div>
              <h1 className="text-3xl font-bold">Ready to Submit</h1>
              <p className="text-[var(--cv-muted)]">
                Your KYC will be submitted for review. Typically approved within 24–48 hours.
              </p>
              <p className="text-sm text-[var(--cv-muted)]">
                You can browse as a buyer while waiting. Provider features stay locked until approval.
              </p>
              <div className="rounded-lg bg-[var(--cv-elevated)] p-4 text-left text-sm">
                <p><strong>Name:</strong> {data.fullName || '—'}</p>
                <p><strong>Email:</strong> {data.email}</p>
                <p><strong>Roles:</strong> {data.roles.map((r) => ROLE_LABELS[r]).join(', ')}</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <Button type="button" variant="secondary" roleColor={primaryRole} disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
                Previous
              </Button>
              {step >= 2 && step < 7 && (
                <Button type="button" variant="ghost" onClick={saveDraft}>
                  {saved ? 'Draft saved ✓' : 'Save Draft'}
                </Button>
              )}
            </div>
            <Button type="submit" roleColor={primaryRole} size="lg">
              {step === 1 ? 'Create Account' : step === 7 ? 'Submit KYC' : step === 2 ? 'Continue' : 'Next'}
            </Button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--cv-muted)]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[var(--cv-accent)] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}
