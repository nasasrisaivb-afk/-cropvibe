import { useState } from 'react'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'
import { Select } from '../common/Select'

export function SettingsPage() {
  const [quietStart, setQuietStart] = useState('22:00')
  const [quietEnd, setQuietEnd] = useState('06:00')
  const [channels, setChannels] = useState({
    push: true,
    sms: true,
    email: true,
    inApp: true,
  })
  const [saved, setSaved] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-[var(--cv-muted)]">
            Notifications, security, language, and device sessions.
          </p>
        </div>
        <Button
          onClick={() => {
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
          }}
        >
          Save preferences
        </Button>
      </div>

      {saved ? (
        <div className="rounded-[12px] border border-[var(--cv-primary)]/30 bg-[var(--cv-primary-soft)] px-4 py-3 text-sm text-[var(--cv-primary)]">
          Preferences saved.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="!rounded-[12px]" title="Notification channels">
          <ul className="space-y-3">
            {(
              [
                ['push', 'Push notifications'],
                ['sms', 'SMS alerts'],
                ['email', 'Email digests'],
                ['inApp', 'In-app feed'],
              ] as const
            ).map(([key, label]) => (
              <li key={key} className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{label}</span>
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-[var(--cv-primary)]"
                  checked={channels[key]}
                  onChange={(e) => setChannels((c) => ({ ...c, [key]: e.target.checked }))}
                  aria-label={label}
                />
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <FormInput
              label="Quiet hours start"
              type="time"
              value={quietStart}
              onChange={(e) => setQuietStart(e.target.value)}
            />
            <FormInput
              label="Quiet hours end"
              type="time"
              value={quietEnd}
              onChange={(e) => setQuietEnd(e.target.value)}
            />
          </div>
        </Card>

        <Card className="!rounded-[12px]" title="Language & region">
          <div className="space-y-3">
            <Select
              label="Language"
              defaultValue="en"
              options={[
                { value: 'en', label: 'English' },
                { value: 'hi', label: 'Hindi' },
                { value: 'mr', label: 'Marathi' },
                { value: 'te', label: 'Telugu' },
                { value: 'ta', label: 'Tamil' },
              ]}
            />
            <Select
              label="Timezone"
              defaultValue="ist"
              options={[
                { value: 'ist', label: 'India Standard Time (IST)' },
                { value: 'utc', label: 'UTC' },
              ]}
            />
          </div>
        </Card>

        <Card className="!rounded-[12px]" title="Security & devices">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between rounded-[10px] bg-[var(--cv-elevated)] px-3 py-2">
              <span>Chrome · Windows · Hyderabad</span>
              <span className="text-[var(--cv-primary)]">This device</span>
            </li>
            <li className="flex items-center justify-between rounded-[10px] bg-[var(--cv-elevated)] px-3 py-2">
              <span>CropVibe Android · Pune</span>
              <Button size="sm" variant="ghost">
                Revoke
              </Button>
            </li>
          </ul>
          <Button className="mt-4" variant="danger" size="sm">
            Logout from all devices
          </Button>
        </Card>

        <Card className="!rounded-[12px]" title="Data & privacy">
          <p className="text-sm text-[var(--cv-muted)]">
            Download a copy of your business data or request account deletion. Sensitive actions are
            written to the audit log.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm">
              Download my data
            </Button>
            <Button variant="ghost" size="sm">
              Delete account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
