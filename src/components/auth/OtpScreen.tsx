import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/appStore'
import type { User } from '../../types/roles'
import { Button } from '../common/Button'
import { FormInput } from '../common/FormInput'

const demoUser: User = {
  id: 'u-demo',
  profile: {
    name: 'Raj Patel',
    email: 'raj@cropvibe.app',
    phone: '9876543210',
    location: 'Hyderabad, India',
  },
  roles: ['seller', 'buyer', 'rental', 'service', 'educator'],
  activeRole: 'seller',
  kycStatus: 'approved',
}

export function OtpScreen() {
  const navigate = useNavigate()
  const login = useAppStore((s) => s.login)

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-8">
      <div className="w-full rounded-xl border border-[var(--cv-border)] bg-[var(--cv-surface)] p-6">
        <h1 className="text-2xl font-bold text-[var(--cv-text)]">OTP Verification</h1>
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            login(demoUser)
            navigate('/dashboard')
          }}
        >
          <p className="text-sm text-[var(--cv-muted)]">Enter the 6-digit OTP sent to your phone.</p>
          <FormInput label="OTP code" maxLength={6} minLength={6} required placeholder="123456" />
          <Button className="w-full" type="submit" size="lg">
            Verify and continue
          </Button>
        </form>
      </div>
    </main>
  )
}
