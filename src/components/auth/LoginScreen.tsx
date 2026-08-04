import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../common/Button'
import { FormInput } from '../common/FormInput'
import { ThemeToggle } from '../common/ThemeToggle'
import { useState } from 'react'

export function LoginScreen() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'phone' | 'email'>('phone')

  return (
    <div className="grid min-h-screen w-full grid-cols-1 md:grid-cols-[42%_58%]">
      <div
        className="relative hidden flex-col justify-end overflow-hidden p-10 text-white md:flex"
        style={{
          background: 'linear-gradient(160deg, #1A1A1A 0%, #242424 52%, #1A1A1A 100%)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(circle at 18% 22%, rgba(204,255,0,0.16), transparent 42%), radial-gradient(circle at 85% 75%, rgba(255,255,255,0.05), transparent 38%)',
          }}
        />
        <div className="relative z-10 max-w-md">
          <p className="cv-logo text-4xl text-[var(--cv-text)]">
            Crop<span className="text-[var(--cv-primary)]">Vibe</span>
          </p>
          <p className="mt-4 text-lg text-[var(--cv-muted)]">
            Discover, book, buy, rent, and manage agricultural resources in one trusted marketplace.
          </p>
          <ul className="mt-8 space-y-2 text-[var(--cv-muted)]">
            <li className="flex gap-2">
              <span className="text-[var(--cv-primary)]">✓</span> Phone OTP secure login
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--cv-primary)]">✓</span> Multi-role business dashboard
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--cv-primary)]">✓</span> KYC-ready seller & rental workflows
            </li>
          </ul>
        </div>
      </div>

      <main className="relative flex min-h-screen items-center justify-center bg-[var(--cv-bg)] px-6 py-10">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-[440px] rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface)] p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-2 md:hidden">
            <span className="cv-logo text-xl">
              Crop<span className="cv-logo-accent">Vibe</span>
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--cv-text)]">Welcome back</h1>
          <p className="mt-2 text-[var(--cv-muted)]">Sign in with phone OTP (recommended) or email</p>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-[12px] bg-[var(--cv-elevated)] p-1">
            <button
              type="button"
              className={`rounded-[10px] py-2 text-sm font-semibold ${
                mode === 'phone'
                  ? 'bg-[var(--cv-surface)] text-[var(--cv-primary)] shadow-sm'
                  : 'text-[var(--cv-muted)]'
              }`}
              onClick={() => setMode('phone')}
            >
              Phone + OTP
            </button>
            <button
              type="button"
              className={`rounded-[10px] py-2 text-sm font-semibold ${
                mode === 'email'
                  ? 'bg-[var(--cv-surface)] text-[var(--cv-primary)] shadow-sm'
                  : 'text-[var(--cv-muted)]'
              }`}
              onClick={() => setMode('email')}
            >
              Email
            </button>
          </div>

          <form
            className="mt-6 space-y-4"
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
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </>
            )}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[var(--cv-muted)]">
                <input type="checkbox" className="h-4 w-4 accent-[var(--cv-primary)]" /> Remember this device
              </label>
              <Link to="/forgot-password" className="font-medium text-[var(--cv-primary)] hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" fullWidth size="lg">
              {mode === 'phone' ? 'Send OTP' : 'Sign In'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-[var(--cv-muted)]">
            <div className="h-px flex-1 bg-[var(--cv-border)]" />
            or continue with
            <div className="h-px flex-1 bg-[var(--cv-border)]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/otp')}>
              Google
            </Button>
            <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/otp')}>
              Apple
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-[var(--cv-muted)]">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-[var(--cv-primary)] hover:underline">
              Register
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
