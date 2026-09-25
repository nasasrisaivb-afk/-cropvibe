'use client'

import { Suspense, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn, useSession, STATIC_DEMO } from '@/lib/auth-client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { MarketIllustration } from '@/components/auth/MarketIllustration'
import { Wordmark } from '@/components/layout/Wordmark'
import { Footer } from '@/components/layout/Footer'
import { DEMO_PASSWORD } from '@/lib/data/seeds'
import { cn } from '@/lib/cn'

const loginSchema = z.object({
  emailOrPhone: z
    .string()
    .min(1, 'Enter your work email or phone number')
    .refine(
      (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || /^[6-9]\d{9}$/.test(val),
      'Enter a valid email or 10-digit mobile number'
    ),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

/** Figma "Cropvibe | Admin | Log in": accent story panel + dark form panel + footer bar. */
function LoginFormInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { status } = useSession()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (STATIC_DEMO && status === 'authenticated') router.replace(params.get('callbackUrl') || '/')
  }, [status, router, params])
  const [error, setError] = useState<string | null>(null)
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { emailOrPhone: 'admin@cropvibe.com', password: DEMO_PASSWORD },
  })
  const errors = form.formState.errors

  async function onSubmit(data: LoginForm) {
    setError(null)
    const res = await signIn('credentials', {
      emailOrPhone: data.emailOrPhone,
      password: data.password,
      redirect: false,
    })
    if (res?.error) {
      setError('That email and password don’t match an active admin account.')
      return
    }
    toast.success('Welcome back')
    router.push(params.get('callbackUrl') || '/')
    router.refresh()
  }

  const sso = (provider: string) => toast.info(`${provider} single sign-on isn’t configured in this prototype.`)

  const inputClass =
    'h-11 w-full rounded-md border bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:ring-2 focus:ring-brand-lime disabled:opacity-60'

  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <main className="grid flex-1 lg:grid-cols-2">
        {/* Story panel */}
        <section className="relative hidden flex-col overflow-hidden bg-brand-lime px-16 pt-12 lg:flex" aria-hidden>
          <h2 className="max-w-[46rem] text-[3.25rem] font-extrabold leading-[1.08] tracking-tight text-brand-ink">
            Make the world’s products bigger and better
          </h2>
          <div className="mt-auto flex justify-center">
            <MarketIllustration className="w-full max-w-[46rem]" />
          </div>
        </section>

        {/* Form panel */}
        <section className="flex items-center justify-center bg-bg-surface px-6 py-12 sm:px-12">
          <div className="w-full max-w-[39rem]">
            <div className="mb-10 lg:hidden">
              <Wordmark size="lg" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-[1.75rem]">Log in to cropvibe</h1>
            <p className="mt-1 text-sm text-text-secondary">Admin console · authorised CropVibe staff only</p>

            {error ? (
              <div role="alert" className="mt-6 rounded-md border border-status-error/40 bg-status-error/10 px-3 py-2.5 text-sm text-status-error">
                {error}
              </div>
            ) : null}

            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-primary">
                  Email Address
                </label>
                <input
                  id="email"
                  type="text"
                  autoComplete="username"
                  inputMode="email"
                  placeholder="john.dowry@example.com"
                  aria-invalid={Boolean(errors.emailOrPhone)}
                  aria-describedby={errors.emailOrPhone ? 'email-error' : undefined}
                  disabled={form.formState.isSubmitting}
                  {...form.register('emailOrPhone')}
                  className={cn(inputClass, errors.emailOrPhone ? 'border-status-error' : 'border-neutral-300')}
                />
                {errors.emailOrPhone ? (
                  <p id="email-error" className="mt-1.5 text-xs text-status-error">
                    {errors.emailOrPhone.message}
                  </p>
                ) : null}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-medium text-brand-lime hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    disabled={form.formState.isSubmitting}
                    {...form.register('password')}
                    className={cn(inputClass, 'pr-11', errors.password ? 'border-status-error' : 'border-neutral-300')}
                  />
                  <button
                    type="button"
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-neutral-500 hover:text-neutral-900"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p id="password-error" className="mt-1.5 text-xs text-status-error">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <Button type="submit" size="lg" className="w-full" loading={form.formState.isSubmitting}>
                Log in
              </Button>
              <p className="text-center text-sm text-text-muted">
                No account yet?{' '}
                <a href="mailto:admin@cropvibe.com?subject=Admin%20console%20access" className="font-medium text-brand-lime hover:underline">
                  Request access
                </a>
              </p>
            </form>

            <div className="my-8 flex items-center gap-4" role="separator" aria-label="Or">
              <span className="h-px flex-1 bg-border-strong" />
              <span className="text-xs text-text-muted">Or</span>
              <span className="h-px flex-1 bg-border-strong" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => sso('Google')}
                className="flex h-10 items-center justify-center rounded-md border border-neutral-300 bg-white transition hover:bg-neutral-100"
                aria-label="Continue with Google"
              >
                <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
                  <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => sso('Apple')}
                className="flex h-10 items-center justify-center rounded-md border border-neutral-600 bg-black text-white transition hover:bg-neutral-900"
                aria-label="Continue with Apple"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  <path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9s-2-.9-3.4-.9C5.9 6.8 4 8 3 9.8c-2.1 3.6-.5 8.9 1.5 11.8 1 1.4 2.2 3 3.7 3 1.5-.1 2-.9 3.8-.9s2.3.9 3.8.9c1.6 0 2.6-1.5 3.6-2.9 1.1-1.6 1.6-3.2 1.6-3.3-.1 0-3.2-1.2-3.2-4.8zM13.6 4.9c.8-1 1.4-2.4 1.2-3.8-1.2.1-2.6.8-3.4 1.8-.7.8-1.4 2.2-1.2 3.6 1.3.1 2.6-.7 3.4-1.6z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => sso('Facebook')}
                className="flex h-10 items-center justify-center rounded-md bg-[#1877F2] text-white transition hover:bg-[#166FE0]"
                aria-label="Continue with Facebook"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
                </svg>
              </button>
            </div>

            <p className="mt-8 flex items-start gap-2 rounded-md border border-border-default bg-bg-inset px-3 py-2.5 text-xs text-text-secondary">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>
                Demo: <span className="font-mono text-text-primary">admin@cropvibe.com</span> /{' '}
                <span className="font-mono text-text-primary">{DEMO_PASSWORD}</span>. Try{' '}
                <span className="font-mono text-text-primary">auditor@cropvibe.com</span> for view-only or{' '}
                <span className="font-mono text-text-primary">finance@cropvibe.com</span> for a scoped role.
              </span>
            </p>
          </div>
        </section>
      </main>
      <Footer className="mt-0" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-base" />}>
      <LoginFormInner />
    </Suspense>
  )
}
