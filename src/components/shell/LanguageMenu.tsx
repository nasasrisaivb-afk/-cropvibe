import { useEffect, useRef, useState } from 'react'

const LANGUAGES = [
  { id: 'en', label: 'English', native: 'English' },
  { id: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { id: 'mr', label: 'Marathi', native: 'मराठी' },
  { id: 'te', label: 'Telugu', native: 'తెలుగు' },
  { id: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { id: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { id: 'bn', label: 'Bengali', native: 'বাংলা' },
  { id: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
] as const

const STORAGE_KEY = 'cropvibe.language'

function readLang() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? 'en'
  } catch {
    return 'en'
  }
}

export function LanguageMenu() {
  const [lang, setLang] = useState(readLang)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = LANGUAGES.find((item) => item.id === lang) ?? LANGUAGES[0]

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${current.native}. Change language`}
        className="focus-ring flex h-10 min-w-10 items-center justify-center rounded-xl border border-[var(--cv-border)] bg-[var(--cv-surface)] px-2 text-sm font-semibold text-[var(--cv-text)]"
        onClick={() => setOpen((v) => !v)}
      >
        {current.id === 'en' ? 'A' : current.native.slice(0, 1)}
      </button>
      {open ? (
        <div
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-[var(--cv-border)] bg-[var(--cv-surface)] py-1 shadow-[var(--shadow-lg)]"
        >
          {LANGUAGES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={item.id === lang}
              className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-[var(--cv-elevated)]"
              onClick={() => {
                setLang(item.id)
                try {
                  localStorage.setItem(STORAGE_KEY, item.id)
                } catch {
                  /* ignore */
                }
                setOpen(false)
              }}
            >
              <span className="font-medium text-[var(--cv-text)]">{item.native}</span>
              <span className="text-[11px] text-[var(--cv-muted)]">{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
