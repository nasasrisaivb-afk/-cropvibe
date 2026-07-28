import { Link } from 'react-router-dom'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { FormInput } from '../common/FormInput'

export function ForgotPasswordScreen() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-8">
      <Card className="w-full" title="Forgot password">
        <form className="space-y-4">
          <p className="text-sm text-[var(--cv-muted)]">Enter your email and we will send reset instructions.</p>
          <FormInput label="Email" required type="email" />
          <Button className="w-full" type="submit">
            Send reset link
          </Button>
        </form>
        <div className="mt-4 text-sm">
          <Link className="text-[var(--cv-accent)]" to="/login">
            Back to login
          </Link>
        </div>
      </Card>
    </main>
  )
}
