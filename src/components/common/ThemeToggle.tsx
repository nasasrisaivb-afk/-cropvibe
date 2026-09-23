import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '../../store/appStore'

/** Quick light / dark toggle for the header */
export function ThemeToggle() {
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="cv-touch focus-ring cv-header-icon"
      onClick={toggleTheme}
    >
      {isDark ? <SunIcon className="h-5 w-5" strokeWidth={1.5} /> : <MoonIcon className="h-5 w-5" strokeWidth={1.5} />}
    </button>
  )
}
