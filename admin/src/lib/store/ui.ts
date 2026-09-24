import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  sidebarCollapsed: boolean
  mobileNavOpen: boolean
  commandOpen: boolean
  /** Sidebar modules the admin has expanded (the active module is always open) */
  expandedModules: string[]
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileNavOpen: (open: boolean) => void
  setCommandOpen: (open: boolean) => void
  toggleModule: (id: string) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      commandOpen: false,
      expandedModules: [],
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
      setCommandOpen: (open) => set({ commandOpen: open }),
      toggleModule: (id) =>
        set((s) => ({
          expandedModules: s.expandedModules.includes(id)
            ? s.expandedModules.filter((m) => m !== id)
            : [...s.expandedModules, id],
        })),
    }),
    {
      name: 'cv-admin-ui',
      // Rehydrated after mount (see DashboardShell) so SSR and first client render match
      skipHydration: true,
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, expandedModules: s.expandedModules }),
    }
  )
)
