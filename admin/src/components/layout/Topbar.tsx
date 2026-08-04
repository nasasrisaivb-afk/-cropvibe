'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Bell, Menu, Search, Command } from 'lucide-react'
import { useUiStore } from '@/lib/store/ui'
import { getUnreadCount } from '@/lib/api/notifications.api'
import { globalSearch } from '@/lib/api/search.api'
import { Avatar } from '@/components/ui/avatar'
import { ADMIN_ROLE_LABELS } from '@/lib/types'
import { cn } from '@/lib/cn'

export function Topbar() {
  const { data: session } = useSession()
  const { setMobileNavOpen, commandOpen, setCommandOpen } = useUiStore()
  const { data: unread } = useQuery({
    queryKey: ['unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 15000,
  })
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Awaited<ReturnType<typeof globalSearch>>>([])
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandOpen(true)
      }
      if (e.key === 'Escape') setCommandOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setCommandOpen])

  useEffect(() => {
    if (!commandOpen || !q.trim()) {
      setResults([])
      return
    }
    const t = setTimeout(() => {
      void globalSearch(q).then(setResults)
    }, 200)
    return () => clearTimeout(t)
  }, [q, commandOpen])

  return (
    <>
      <header className="cv-frost sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border-default bg-bg-surface/80 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md p-2 text-text-secondary hover:bg-bg-surfaceHover lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden items-center gap-2 text-xs sm:flex">
            <span className="rounded bg-status-error/20 px-2 py-0.5 font-semibold text-status-error">
              STAGING
            </span>
            <span className="text-text-muted">|</span>
            <span className="text-text-secondary">
              Role:{' '}
              <span className="text-text-primary">
                {session?.user?.role
                  ? ADMIN_ROLE_LABELS[session.user.role]
                  : '—'}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="flex h-9 items-center gap-2 rounded-lg border border-border-default bg-bg-base px-3 text-sm text-text-muted hover:border-border-focus"
            aria-label="Global search"
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">Search…</span>
            <kbd className="ml-2 hidden items-center gap-0.5 rounded border border-border-default px-1.5 py-0.5 text-[10px] md:inline-flex">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => router.push('/notifications')}
            className="relative rounded-md p-2 text-text-secondary hover:bg-bg-surfaceHover"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unread && unread > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-error px-1 text-[10px] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            ) : null}
          </button>

          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-bg-surfaceHover"
              aria-label="Admin profile"
            >
              <Avatar name={session?.user?.name ?? 'Admin'} size="sm" />
              <span className="hidden text-sm text-text-primary md:inline">
                {session?.user?.name}
              </span>
            </button>
            <div className="invisible absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-border-default bg-bg-surfaceAlt py-1 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg-surfaceHover hover:text-text-primary"
                onClick={() => router.push('/settings')}
              >
                Account settings
              </button>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm text-status-error hover:bg-bg-surfaceHover"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {commandOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 pt-[12vh] px-4">
          <div className="w-full max-w-lg rounded-xl border border-border-default bg-bg-surfaceAlt shadow-xl">
            <div className="flex items-center gap-2 border-b border-border-light px-4">
              <Search className="h-4 w-4 text-text-muted" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search users, listings, transactions, disputes…"
                className="h-12 w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
              />
              <button
                type="button"
                className="text-xs text-text-muted"
                onClick={() => setCommandOpen(false)}
              >
                Esc
              </button>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-text-muted">
                  {q.trim() ? 'No results' : 'Type to search'}
                </li>
              ) : (
                results.map((r) => (
                  <li key={`${r.type}-${r.id}`}>
                    <button
                      type="button"
                      className={cn(
                        'flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-bg-surfaceHover'
                      )}
                      onClick={() => {
                        setCommandOpen(false)
                        setQ('')
                        router.push(r.href)
                      }}
                    >
                      <span className="text-sm text-text-primary">{r.title}</span>
                      <span className="text-xs text-text-muted">
                        {r.type} · {r.subtitle}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
          <button
            type="button"
            className="absolute inset-0 -z-10"
            aria-label="Close search"
            onClick={() => setCommandOpen(false)}
          />
        </div>
      ) : null}
    </>
  )
}
