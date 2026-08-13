'use client'

import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DEMO_PASSWORD } from '@/lib/data/seeds'

const loginSchema = z.object({
  emailOrPhone: z
    .string()
    .min(1, 'Email or phone required')
    .refine(
      (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || /^[6-9]\d{9}$/.test(val),
      'Enter valid email or 10-digit phone'
    ),
  password: z
    .string()
    .min(8, 'Password must be 8+ characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/\d/, 'Must contain digit')
    .regex(/[@$!%*?&]/, 'Must contain special character'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginFormInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [shake, setShake] = useState(false)
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: 'admin@cropvibe.com',
      password: DEMO_PASSWORD,
    },
  })

  async function onSubmit(data: LoginForm) {
    const res = await signIn('credentials', {
      emailOrPhone: data.emailOrPhone,
      password: data.password,
      redirect: false,
    })
    if (res?.error) {
      toast.error('Invalid credentials')
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }
    toast.success('Welcome back')
    router.push(params.get('callbackUrl') || '/')
    router.refresh()
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-bg-base p-10 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(204,255,0,0.12),_transparent_50%)]" />
        <div className="relative">
          <p className="text-2xl font-bold text-brand-lime">CropVibe</p>
          <p className="mt-1 text-sm text-text-muted">Views Become Value</p>
        </div>
        <div className="relative max-w-md space-y-4">
          <h1 className="text-4xl font-bold leading-tight text-text-primary">
            Make the world&apos;s agricultural products bigger and better
          </h1>
          <p className="text-text-secondary">
            Operate the marketplace — verify users, resolve disputes, and monitor platform health in
            real time.
          </p>
        </div>
        <p className="relative text-xs text-text-muted">© {new Date().getFullYear()} CropVibe</p>
      </div>

      <div className="flex items-center justify-center bg-bg-base p-6">
        <div
          className={`w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-neutral-900 shadow-xl ${
            shake ? 'translate-x-1' : ''
          }`}
        >
          <div className="mb-6 lg:hidden">
            <p className="text-xl font-bold text-neutral-900">CropVibe Admin</p>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">Login</h2>
          <p className="mt-1 text-sm text-neutral-500">Sign in to the admin console</p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-600">Email or phone number</label>
              <input
                {...form.register('emailOrPhone')}
                disabled={form.formState.isSubmitting}
                placeholder="Email or phone number"
                className="flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-brand-limeAlt focus:ring-2 focus:ring-brand-lime"
              />
              {form.formState.errors.emailOrPhone ? (
                <p className="text-xs text-red-600">{form.formState.errors.emailOrPhone.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-600">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-neutral-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...form.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  disabled={form.formState.isSubmitting}
                  className="flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 pr-10 text-sm text-neutral-900 outline-none focus:border-brand-limeAlt focus:ring-2 focus:ring-brand-lime"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-500"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password ? (
                <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
              Login
            </Button>
          </form>

          <div className="mt-6">
            <p className="mb-3 text-center text-xs text-neutral-500">Or continue with</p>
            <div className="flex justify-center gap-3">
              {['Google', 'Apple', 'Facebook'].map((provider) => (
                <button
                  key={provider}
                  type="button"
                  aria-label={provider}
                  onClick={() => console.log('Not implemented yet', provider)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  {provider[0]}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-neutral-400">
            Demo: admin@cropvibe.com / {DEMO_PASSWORD}
          </p>
        </div>
      </div>
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
