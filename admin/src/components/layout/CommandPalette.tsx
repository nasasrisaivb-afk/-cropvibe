'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ArrowRight, CornerDownLeft, FileText, Search } from 'lucide-react'
import { NAV_LEAVES } from '@/config/navigation'
import { globalSearch, type SearchResult } from '@/lib/api/search.api'
import { useUiStore } from '@/lib/store/ui'
import { can } from '@/lib/rbac'
import { cn } from '@/lib/cn'

type Item =
  | { kind: 'page'; key: string; title: string; subtitle: string; href: string }
  | { kind: 'record'; key: string; title: string; subtitle: string; href: string; type: string }

/** ⌘K — jump to any page in the IA or any record (user, order, payment, ticket…). */
export function CommandPalette() {
  const router = useRouter()
  const { data: session } = useSession()
  const { commandOpen, setCommandOpen } = useUiStore()
  const [q, setQ] = useState('')
  const [records, setRecords] = useState<SearchResult[]>([])
  const [cursor, setCursor] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandOpen(!useUiStore.getState().commandOpen)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setCommandOpen])

  useEffect(() => {
    if (!commandOpen) {
      setQ('')
      setRecords([])
    }
  }, [commandOpen])

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) {
      setRecords([])
      return
    }
    let cancelled = false
    const t = setTimeout(() => {
      void globalSearch(term).then((r) => !cancelled && setRecords(r))
    }, 180)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [q])

  const pages = useMemo(() => {
    const term = q.trim().toLowerCase()
    const perms = session?.user?.permissions
    return NAV_LEAVES.filter((l) => !perms || can(perms, l.module.permission, 'view'))
      .filter(
        (l) =>
          !term ||
          `${l.label} ${l.module.label} ${l.description} ${(l.keywords ?? []).join(' ')}`.toLowerCase().includes(term)
      )
      .slice(0, term ? 8 : 6)
  }, [q, session])

  const items: Item[] = [
    ...pages.map((p) => ({
      kind: 'page' as const,
      key: `page-${p.href}`,
      title: p.label,
      subtitle: p.module.label,
      href: p.href,
    })),
    ...records.map((r) => ({
      kind: 'record' as const,
      key: `rec-${r.type}-${r.id}`,
      title: r.title,
      subtitle: r.subtitle,
      href: r.href,
      type: r.type,
    })),
  ]

  useEffect(() => setCursor(0), [q, records.length])

  const go = (item: Item) => {
    setCommandOpen(false)
    router.push(item.href)
  }

  return (
    <DialogPrimitive.Root open={commandOpen} onOpenChange={setCommandOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] animate-fade-in bg-black/70" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-[12vh] z-[60] w-[min(100%-2rem,40rem)] -translate-x-1/2 overflow-hidden rounded-xl border border-border-default bg-bg-surface shadow-pop focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setCursor((c) => Math.min(items.length - 1, c + 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setCursor((c) => Math.max(0, c - 1))
            } else if (e.key === 'Enter' && items[cursor]) {
              e.preventDefault()
              go(items[cursor]!)
            }
          }}
        >
          <DialogPrimitive.Title className="sr-only">Search CropVibe Admin</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search pages and records. Use arrow keys to move and Enter to open.
          </DialogPrimitive.Description>
          <div className="flex items-center gap-3 border-b border-border-default px-4">
            <Search className="h-5 w-5 text-text-muted" aria-hidden />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search pages, users, orders, payments, tickets…"
              aria-label="Search"
              role="combobox"
              aria-expanded="true"
              aria-controls="cmdk-list"
              aria-activedescendant={items[cursor] ? items[cursor]!.key : undefined}
              className="h-14 w-full bg-transparent text-base text-text-primary outline-none placeholder:text-text-muted"
            />
            <kbd className="rounded border border-border-default px-1.5 py-0.5 font-mono text-2xs text-text-muted">Esc</kbd>
          </div>
          <ul id="cmdk-list" ref={listRef} role="listbox" className="scrollbar-thin max-h-[60vh] overflow-y-auto p-2">
            {items.length === 0 ? (
              <li className="px-3 py-10 text-center text-sm text-text-muted">
                {q.trim().length >= 2 ? `No results for “${q.trim()}”` : 'Type to search'}
              </li>
            ) : null}
            {items.map((item, i) => {
              const header =
                i === 0 && item.kind === 'page'
                  ? q.trim()
                    ? 'Pages'
                    : 'Jump to'
                  : item.kind === 'record' && items[i - 1]?.kind !== 'record'
                    ? 'Records'
                    : null
              return (
                <li key={item.key} role="presentation">
                  {header ? (
                    <p className="px-3 pb-1.5 pt-3 text-2xs font-semibold uppercase tracking-wider text-text-muted">{header}</p>
                  ) : null}
                  <button
                    id={item.key}
                    type="button"
                    role="option"
                    aria-selected={i === cursor}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(item)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left',
                      i === cursor ? 'bg-bg-surfaceAlt' : 'hover:bg-bg-surfaceAlt/60'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border-default',
                        i === cursor ? 'bg-brand-lime text-brand-ink' : 'bg-bg-inset text-text-secondary'
                      )}
                      aria-hidden
                    >
                      {item.kind === 'page' ? <ArrowRight className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-text-primary">{item.title}</span>
                      <span className="block truncate text-xs text-text-muted">
                        {item.kind === 'record' ? <span className="capitalize">{item.type} · </span> : null}
                        {item.subtitle}
                      </span>
                    </span>
                    {i === cursor ? <CornerDownLeft className="h-4 w-4 text-text-muted" aria-hidden /> : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
