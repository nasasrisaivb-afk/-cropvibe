import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../common/Button'
import { FormInput } from '../common/FormInput'
import { AuthShell } from './AuthShell'

export function LoginScreen() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'phone' | 'email'>('phone')

  return (
    <AuthShell
      headline="Get Started with Us"
      description="Complete these easy steps to register your account."
      activeStep={1}
      steps={[
        { label: 'Sign in to your account' },
        { label: 'Verify with OTP' },
        { label: 'Open your workspace' },
      ]}
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--cv-text)]">Welcome back</h1>
        <p className="mt-2 text-sm text-[var(--cv-muted)]">
          Enter your credentials to access your CropVibe workspace.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/otp')}>
          Google
        </Button>
        <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/otp')}>
          Apple
        </Button>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-[var(--cv-muted)]">
        <div className="h-px flex-1 bg-[var(--cv-border)]" />
        Or
        <div className="h-px flex-1 bg-[var(--cv-border)]" />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-[12px] bg-[var(--cv-elevated)] p-1">
        <button
          type="button"
          className={`rounded-[10px] py-2 text-sm font-semibold transition ${
            mode === 'phone'
              ? 'bg-[var(--cv-btn-bg)] text-[var(--cv-btn-text)] shadow-sm'
              : 'text-[var(--cv-muted)]'
          }`}
          onClick={() => setMode('phone')}
        >
          Phone + OTP
        </button>
        <button
          type="button"
          className={`rounded-[10px] py-2 text-sm font-semibold transition ${
            mode === 'email'
              ? 'bg-[var(--cv-btn-bg)] text-[var(--cv-btn-text)] shadow-sm'
              : 'text-[var(--cv-muted)]'
          }`}
          onClick={() => setMode('email')}
        >
          Email
        </button>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          navigate('/otp')
        }}
      >
        {mode === 'phone' ? (
          <FormInput
            label="Phone number"
            type="tel"
            required
            placeholder="+91 98765 43210"
            autoComplete="tel"
          />
        ) : (
          <>
            <FormInput
              label="Email address"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
            <FormInput
              label="Password"
              type="password"
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </>
        )}

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-[var(--cv-muted)]">
            <input type="checkbox" className="h-4 w-4 accent-[var(--cv-primary)]" /> Remember this device
          </label>
          <Link to="/forgot-password" className="font-medium text-[var(--cv-text)] hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" className="!rounded-[10px]">
          {mode === 'phone' ? 'Send OTP' : 'Sign In'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--cv-muted)]">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-[var(--cv-text)] hover:underline">
          Sign up
        </Link>
      </p>
    </AuthShell>
  )
}
