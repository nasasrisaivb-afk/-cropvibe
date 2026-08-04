import { create } from 'zustand'
import type { KycStatus, PageId, Role, User } from '../types/roles'
import { ROLE_LABELS } from '../config/navigation'
import { defaultThemeForRole, type ColorMode } from '../theme/tokens'

const THEME_KEY = 'cropvibe.theme'
const THEME_EXPLICIT_KEY = 'cropvibe.theme.explicit'

function readExplicit(): boolean {
  try {
    return localStorage.getItem(THEME_EXPLICIT_KEY) === '1'
  } catch {
    return false
  }
}

function readTheme(role?: Role | null): ColorMode {
  try {
    if (readExplicit()) {
      const stored = localStorage.getItem(THEME_KEY)
      if (stored === 'light' || stored === 'dark') return stored
    }
  } catch {
    /* ignore */
  }
  return defaultThemeForRole(role)
}

function applyTheme(theme: ColorMode) {
  document.documentElement.setAttribute('data-theme', theme)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'light' ? '#FAFAF8' : '#1A1A1A')
}

interface AppState {
  user: User | null
  isAuthenticated: boolean
  currentPage: PageId
  rolePages: Partial<Record<Role, PageId>>
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  roleSwitchMessage: string | null
  signupDraft: Record<string, unknown> | null
  theme: ColorMode
  themeExplicit: boolean
  login: (user: User) => void
  logout: () => void
  setCurrentPage: (page: PageId) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapsed: () => void
  switchRole: (role: Role) => void
  clearRoleSwitchMessage: () => void
  setKycStatus: (status: KycStatus) => void
  setSignupDraft: (draft: Record<string, unknown> | null) => void
  setTheme: (theme: ColorMode) => void
  toggleTheme: () => void
  resetThemeToRoleDefault: () => void
}

const defaultRolePages: Record<Role, PageId> = {
  seller: 'dashboard',
  buyer: 'dashboard',
  rental: 'dashboard',
  service: 'dashboard',
  educator: 'dashboard',
}

const initialExplicit = typeof document !== 'undefined' ? readExplicit() : false
const initialTheme = typeof document !== 'undefined' ? readTheme(null) : 'dark'
if (typeof document !== 'undefined') applyTheme(initialTheme)

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  currentPage: 'dashboard',
  rolePages: { ...defaultRolePages },
  sidebarOpen: false,
  sidebarCollapsed: false,
  roleSwitchMessage: null,
  signupDraft: null,
  theme: initialTheme,
  themeExplicit: initialExplicit,
  login: (user) => {
    const theme = readTheme(user.activeRole)
    applyTheme(theme)
    set({
      user,
      isAuthenticated: true,
      currentPage: defaultRolePages[user.activeRole],
      theme,
    })
  },
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      currentPage: 'dashboard',
      rolePages: { ...defaultRolePages },
      roleSwitchMessage: null,
    }),
  setCurrentPage: (page) => {
    const state = get()
    const role = state.user?.activeRole
    set({
      currentPage: page,
      rolePages: role ? { ...state.rolePages, [role]: page } : state.rolePages,
    })
  },
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  switchRole: (role) => {
    const state = get()
    if (!state.user || state.user.activeRole === role) return
    const cachedPage = state.rolePages[role] ?? 'dashboard'
    const theme = state.themeExplicit ? state.theme : defaultThemeForRole(role)
    if (!state.themeExplicit) applyTheme(theme)
    set({
      user: { ...state.user, activeRole: role },
      currentPage: cachedPage,
      roleSwitchMessage: `Switched to ${ROLE_LABELS[role]} role`,
      sidebarOpen: false,
      theme,
    })
  },
  clearRoleSwitchMessage: () => set({ roleSwitchMessage: null }),
  setKycStatus: (status) =>
    set((state) => (state.user ? { user: { ...state.user, kycStatus: status } } : state)),
  setSignupDraft: (draft) => set({ signupDraft: draft }),
  setTheme: (theme) => {
    try {
      localStorage.setItem(THEME_KEY, theme)
      localStorage.setItem(THEME_EXPLICIT_KEY, '1')
    } catch {
      /* ignore */
    }
    applyTheme(theme)
    set({ theme, themeExplicit: true })
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },
  resetThemeToRoleDefault: () => {
    const role = get().user?.activeRole
    const theme = defaultThemeForRole(role)
    try {
      localStorage.removeItem(THEME_EXPLICIT_KEY)
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* ignore */
    }
    applyTheme(theme)
    set({ theme, themeExplicit: false })
  },
}))
