import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-bold">Unauthorized</h1>
      <p className="text-text-secondary">You do not have permission to view this resource.</p>
      <Link href="/" className="text-brand-limeAlt hover:underline">
        Return to dashboard
      </Link>
    </div>
  )
}
