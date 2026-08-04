import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { defaultThemeForRole } from '../../theme/tokens'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'
import { LargeTitle } from '../common/LargeTitle'
import { Select } from '../common/Select'
import { Switch } from '../common/Switch'
import { useScrollCollapse } from '../../hooks/useScrollCollapse'

export function SettingsPage() {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const themeExplicit = useAppStore((s) => s.themeExplicit)
  const resetThemeToRoleDefault = useAppStore((s) => s.resetThemeToRoleDefault)
  const role = useAppStore((s) => s.user?.activeRole ?? 'seller')
  const collapsed = useScrollCollapse()
  const [quietStart, setQuietStart] = useState('22:00')
  const [quietEnd, setQuietEnd] = useState('06:00')
  const [channels, setChannels] = useState({
    push: true,
    sms: true,
    email: true,
    inApp: true,
  })
  const [saved, setSaved] = useState(false)
  const roleDefault = defaultThemeForRole(role)

  return (
    <div className="space-y-8">
      <LargeTitle
        collapsed={collapsed}
        title="Settings"
        subtitle="Appearance, notifications, security, and device sessions."
        actions={
          <Button
            onClick={() => {
              setSaved(true)
              setTimeout(() => setSaved(false), 2000)
            }}
          >
            Save preferences
          </Button>
        }
      />

      {saved ? (
        <div className="rounded-[16px] border border-[var(--cv-primary)]/20 bg-[var(--cv-primary-soft)] px-4 py-3 text-sm text-[var(--cv-text)]">
          Preferences saved.
        </div>
      ) : null}

      <Card title="Appearance">
        <p className="mb-4 text-sm text-[var(--cv-muted)]">
          Dark mode is the default for a calm, desk-ready experience. Switch to light for outdoor
          field use — lime accent stays identical in either mode.
        </p>
        <div
          className="inline-flex rounded-[10px] border border-[var(--cv-border)] bg-[var(--cv-elevated)] p-1"
          role="group"
          aria-label="Color theme"
        >
          {(
            [
              ['light', 'Light'],
              ['dark', 'Dark'],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              aria-pressed={theme === mode}
              className={`min-h-10 rounded-[8px] px-4 text-sm font-semibold transition duration-150 ${
                theme === mode
                  ? 'bg-[var(--cv-surface)] text-[var(--cv-text)] shadow-[var(--shadow-sm)]'
                  : 'text-[var(--cv-muted)] hover:text-[var(--cv-text)]'
              }`}
              onClick={() => setTheme(mode)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[13px] text-[var(--cv-muted)]">
          Role default: <span className="font-medium text-[var(--cv-text)]">{roleDefault}</span>
          {themeExplicit ? ' · You overrode this preference' : ' · Using role default'}
        </p>
        {themeExplicit ? (
          <Button className="mt-3" size="sm" variant="ghost" onClick={resetThemeToRoleDefault}>
            Reset to role default
          </Button>
        ) : null}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Notification channels">
          <ul className="space-y-1">
            {(
              [
                ['push', 'Push notifications'],
                ['sms', 'SMS alerts'],
                ['email', 'Email digests'],
                ['inApp', 'In-app feed'],
              ] as const
            ).map(([key, label]) => (
              <li
                key={key}
                className="flex min-h-14 items-center justify-between gap-3 border-b border-[var(--cv-border)] py-2 last:border-0"
              >
                <span className="text-sm font-medium">{label}</span>
                <Switch
                  checked={channels[key]}
                  onChange={(checked) => setChannels((c) => ({ ...c, [key]: checked }))}
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

        <Card title="Language & region">
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

        <Card title="Security & devices">
          <ul className="divide-y divide-[var(--cv-border)] text-sm">
            <li className="flex min-h-14 items-center justify-between gap-3 py-2">
              <span>Chrome · Windows · Hyderabad</span>
              <span className="text-[13px] font-medium text-[var(--cv-primary)]">This device</span>
            </li>
            <li className="flex min-h-14 items-center justify-between gap-3 py-2">
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

        <Card title="Data & privacy">
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
