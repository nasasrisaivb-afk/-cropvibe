'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { requestPasswordReset } from '@/lib/api/auth.api'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: FormData) {
    try {
      await requestPasswordReset(data.email)
      setSent(true)
      toast.success('Reset link sent')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Request failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base p-6">
      <div className="w-full max-w-md rounded-2xl border border-border-default bg-bg-surface p-8">
        <h1 className="text-2xl font-bold text-text-primary">Forgot password</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Enter your admin email and we&apos;ll send a reset link.
        </p>

        {sent ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-lg bg-status-success/10 p-4 text-sm text-status-success">
              If an account exists for that email, a reset link has been sent (mock).
            </p>
            <Link href="/login" className="text-sm text-brand-limeAlt hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Email</label>
              <input
                {...form.register('email')}
                type="email"
                className="cv-control h-10"
              />
              {form.formState.errors.email ? (
                <p className="text-xs text-status-error">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
            <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
              Send reset link
            </Button>
            <Link href="/login" className="block text-center text-sm text-text-secondary hover:text-text-primary">
              Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
