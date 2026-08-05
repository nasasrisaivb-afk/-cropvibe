import { useRef, useState, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/appStore'
import type { User } from '../../types/roles'
import { Button } from '../common/Button'
import { AuthShell } from './AuthShell'

const demoUser: User = {
  id: 'u-demo',
  profile: {
    name: 'Rakesh Sharma',
    email: 'rakesh@cropvibe.app',
    phone: '9876543210',
    location: 'Nagpur, MH',
  },
  roles: ['seller', 'buyer', 'rental', 'service', 'educator'],
  activeRole: 'rental',
  kycStatus: 'approved',
}

const OTP_LEN = 6

export function OtpScreen() {
  const navigate = useNavigate()
  const login = useAppStore((s) => s.login)
  const [digits, setDigits] = useState<string[]>(Array(OTP_LEN).fill(''))
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const code = digits.join('')

  const setDigit = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[index] = char
      return next
    })
    if (char && index < OTP_LEN - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const onKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LEN)
    if (!pasted) return
    const next = Array(OTP_LEN).fill('')
    pasted.split('').forEach((c, i) => {
      next[i] = c
    })
    setDigits(next)
    inputsRef.current[Math.min(pasted.length, OTP_LEN - 1)]?.focus()
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (code.length < OTP_LEN) return
    login(demoUser)
    navigate('/dashboard')
  }

  return (
    <AuthShell
      headline="Get Started with Us"
      description="Complete these easy steps to access your account."
      activeStep={2}
      steps={[
        { label: 'Sign in to your account' },
        { label: 'Verify with OTP' },
        { label: 'Open your workspace' },
      ]}
    >
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-white">OTP Verification</h1>
        <p className="mt-2 text-sm text-[var(--cv-muted)]">
          Enter the 6-digit code we sent you. Demo opens as Rental Provider — switch roles anytime from the
          header.
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={onSubmit}>
        <div>
          <label className="mb-2 block text-left text-sm text-[var(--cv-muted)]" htmlFor="otp-0">
            OTP code
          </label>
          <div className="flex justify-between gap-2">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el
                }}
                id={index === 0 ? 'otp-0' : undefined}
                aria-label={`Digit ${index + 1}`}
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                className="focus-ring h-12 w-11 rounded-[10px] border border-[var(--cv-border)] bg-[var(--cv-elevated)] text-center text-lg font-semibold text-white sm:h-14 sm:w-12"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => setDigit(index, e.target.value)}
                onKeyDown={(e) => onKeyDown(index, e)}
                onPaste={onPaste}
              />
            ))}
          </div>
        </div>

        <Button className="w-full !rounded-[10px]" type="submit" size="lg" disabled={code.length < OTP_LEN}>
          Verify and continue
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--cv-muted)]">
        Didn&apos;t get a code?{' '}
        <button type="button" className="font-semibold text-white hover:underline">
          Resend OTP
        </button>
      </p>
      <p className="mt-3 text-center text-sm text-[var(--cv-muted)]">
        Wrong number?{' '}
        <Link to="/login" className="font-semibold text-white hover:underline">
          Back to login
        </Link>
      </p>
    </AuthShell>
  )
}
