import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../common/Button'
import { FormInput } from '../common/FormInput'

export function LoginScreen() {
  const navigate = useNavigate()
  return (
    <div className="grid min-h-screen w-full grid-cols-1 md:grid-cols-[42%_58%]">
      <div
        className="relative hidden flex-col justify-end overflow-hidden p-10 text-white md:flex"
        style={{ background: 'linear-gradient(160deg, #262626 0%, #121212 55%, #0a0a0a 100%)' }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(201,255,53,0.25), transparent 45%), radial-gradient(circle at 80% 70%, rgba(201,255,53,0.12), transparent 40%)',
          }}
        />
        <div className="relative z-10 max-w-md">
          <p className="cv-logo text-4xl">
            Crop<span className="cv-logo-accent">Vibe</span>
          </p>
          <p className="mt-4 text-lg text-white/75">
            One dashboard for sellers, buyers, rental providers, service experts, and educators.
          </p>
          <ul className="mt-8 space-y-2 text-white/60">
            <li className="flex gap-2"><span className="text-[var(--cv-accent)]">✓</span> Role-adaptive workflows</li>
            <li className="flex gap-2"><span className="text-[var(--cv-accent)]">✓</span> Shared wallet, messages, analytics</li>
            <li className="flex gap-2"><span className="text-[var(--cv-accent)]">✓</span> KYC-secured marketplace access</li>
          </ul>
        </div>
      </div>

      <main className="flex min-h-screen items-center justify-center bg-[var(--cv-bg)] px-6 py-10">
        <div className="w-full max-w-[440px] rounded-xl border border-[var(--cv-border)] bg-[var(--cv-surface)] p-8">
          <div className="mb-6 flex items-center gap-2 md:hidden">
            <span className="text-2xl">🌱</span>
            <span className="cv-logo text-xl">
              Crop<span className="cv-logo-accent">Vibe</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--cv-text)]">Welcome Back</h1>
          <p className="mt-2 text-[var(--cv-muted)]">Sign in to your CropVibe account</p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              navigate('/otp')
            }}
          >
            <FormInput label="Email Address" type="email" required placeholder="you@example.com" />
            <FormInput label="Password" type="password" required placeholder="••••••••" />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[var(--cv-muted)]">
                <input type="checkbox" className="h-4 w-4 accent-[var(--cv-accent)]" /> Remember me
              </label>
              <Link to="/forgot-password" className="font-medium text-[var(--cv-accent)] hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" fullWidth size="lg">
              Sign In
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-[var(--cv-muted)]">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-[var(--cv-accent)] hover:underline">
              Register
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
