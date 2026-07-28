import { create } from 'zustand'
import type { KycStatus, PageId, Role, User } from '../types/roles'
import { ROLE_LABELS } from '../config/navigation'

interface AppState {
  user: User | null
  isAuthenticated: boolean
  currentPage: PageId
  rolePages: Partial<Record<Role, PageId>>
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  roleSwitchMessage: string | null
  signupDraft: Record<string, unknown> | null
  login: (user: User) => void
  logout: () => void
  setCurrentPage: (page: PageId) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapsed: () => void
  switchRole: (role: Role) => void
  clearRoleSwitchMessage: () => void
  setKycStatus: (status: KycStatus) => void
  setSignupDraft: (draft: Record<string, unknown> | null) => void
}

const defaultRolePages: Record<Role, PageId> = {
  seller: 'dashboard',
  buyer: 'dashboard',
  rental: 'dashboard',
  service: 'dashboard',
  educator: 'dashboard',
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  currentPage: 'dashboard',
  rolePages: { ...defaultRolePages },
  sidebarOpen: false,
  sidebarCollapsed: false,
  roleSwitchMessage: null,
  signupDraft: null,
  login: (user) =>
    set({
      user,
      isAuthenticated: true,
      currentPage: defaultRolePages[user.activeRole],
    }),
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
    set({
      user: { ...state.user, activeRole: role },
      currentPage: cachedPage,
      roleSwitchMessage: `Switched to ${ROLE_LABELS[role]} role`,
      sidebarOpen: false,
    })
  },
  clearRoleSwitchMessage: () => set({ roleSwitchMessage: null }),
  setKycStatus: (status) =>
    set((state) => (state.user ? { user: { ...state.user, kycStatus: status } } : state)),
  setSignupDraft: (draft) => set({ signupDraft: draft }),
}))
