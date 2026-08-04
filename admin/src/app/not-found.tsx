import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-base p-6 text-center">
      <h1 className="text-4xl font-bold text-brand-lime">404</h1>
      <p className="text-text-secondary">This page could not be found.</p>
      <Link href="/" className="rounded-lg bg-brand-lime px-4 py-2 text-sm font-medium text-text-inverse">
        Back to dashboard
      </Link>
    </div>
  )
}
