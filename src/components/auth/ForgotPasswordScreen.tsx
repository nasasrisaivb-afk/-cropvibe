import { Link } from 'react-router-dom'
import { Button } from '../common/Button'
import { FormInput } from '../common/FormInput'
import { AuthShell } from './AuthShell'

export function ForgotPasswordScreen() {
  return (
    <AuthShell
      headline="Get Started with Us"
      description="Complete these easy steps to recover your account."
      activeStep={1}
      steps={[
        { label: 'Confirm your email' },
        { label: 'Reset your password' },
        { label: 'Sign in again' },
      ]}
    >
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--cv-text)]">Forgot password</h1>
        <p className="mt-2 text-sm text-[var(--cv-muted)]">
          Enter your email and we will send reset instructions.
        </p>
      </div>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <FormInput label="Email" required type="email" placeholder="you@example.com" />
        <Button className="w-full !rounded-[10px]" type="submit" size="lg">
          Send reset link
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--cv-muted)]">
        Remembered it?{' '}
        <Link className="font-semibold text-[var(--cv-text)] hover:underline" to="/login">
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}
