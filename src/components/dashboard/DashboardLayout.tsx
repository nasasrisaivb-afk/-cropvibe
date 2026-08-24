import { useEffect, useMemo } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BREADCRUMB_TITLES,
  getAllNavPaths,
  SEARCH_PLACEHOLDERS,
} from '../../config/navigation'
import { useAppStore } from '../../store/appStore'
import type { PageId } from '../../types/roles'
import { getServiceById } from '../services/serviceCatalogUtils'
import type { ServiceCategory } from '../services/serviceCatalogTypes'
import { ToastProvider } from '../common/Toast'
import { DashboardHeader, DashboardSidebar, MobileBottomNav, MobileCreateFab, MobileSearchBar } from '../common/Navigation'
import { BuyerDashboard } from './BuyerDashboard'
import { EducatorDashboard } from './EducatorDashboard'
import { RentalDashboard } from './RentalDashboard'
import { SellerDashboard } from './SellerDashboard'
import { ServiceDashboard } from './ServiceDashboard'

const pageToPath = getAllNavPaths()

const routeToPage = Object.fromEntries(
  Object.entries(pageToPath).map(([page, path]) => [path, page]),
) as Record<string, PageId>

function resolvePageFromPath(pathname: string): PageId | null {
  if (routeToPage[pathname]) return routeToPage[pathname]
  for (const [path, page] of Object.entries(routeToPage)) {
    if (pathname.startsWith(`${path}/`)) return page
  }
  return null
}

function buildBreadcrumbs(pathname: string, currentPage: PageId): string[] {
  const base = BREADCRUMB_TITLES[currentPage] ?? ['Dashboard']
  const match = pathname.match(/^\/dashboard\/(consultancy|testing|repair|aerial|irrigation)\/([^/]+)/)
  if (match) {
    const category = match[1] as ServiceCategory
    const service = getServiceById(category, match[2])
    if (service) return [...base, service.title]
  }
  return base
}

function DashboardHome() {
  const role = useAppStore((state) => state.user?.activeRole ?? 'seller')
  if (role === 'seller') return <SellerDashboard />
  if (role === 'buyer') return <BuyerDashboard />
  if (role === 'rental') return <RentalDashboard />
  if (role === 'service') return <ServiceDashboard />
  return <EducatorDashboard />
}

export function DashboardLayout() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  const currentPage = useAppStore((state) => state.currentPage)
  const setCurrentPage = useAppStore((state) => state.setCurrentPage)
  const roleSwitchMessage = useAppStore((state) => state.roleSwitchMessage)
  const clearRoleSwitchMessage = useAppStore((state) => state.clearRoleSwitchMessage)
  const user = useAppStore((state) => state.user)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const mapped = resolvePageFromPath(location.pathname)
    if (mapped && mapped !== currentPage) {
      setCurrentPage(mapped)
    }
  }, [location.pathname, currentPage, setCurrentPage])

  useEffect(() => {
    const expectedPath = pageToPath[currentPage]
    if (!expectedPath) return
    const onSection =
      location.pathname === expectedPath || location.pathname.startsWith(`${expectedPath}/`)
    if (!onSection) {
      navigate(expectedPath, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.activeRole])

  useEffect(() => {
    if (!roleSwitchMessage) return
    const timeout = setTimeout(() => clearRoleSwitchMessage(), 2200)
    return () => clearTimeout(timeout)
  }, [roleSwitchMessage, clearRoleSwitchMessage])

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  const breadcrumbs = useMemo(
    () => buildBreadcrumbs(location.pathname, currentPage),
    [location.pathname, currentPage],
  )
  const go = (page: PageId) => {
    setCurrentPage(page)
    navigate(pageToPath[page] ?? '/dashboard')
  }

  return (
    <ToastProvider>
    <div className="flex min-h-[100dvh] bg-[var(--cv-bg)] text-[var(--cv-text)]">
      <a className="skip-link focus-ring" href="#main-content">
        Skip to content
      </a>

      <DashboardSidebar onNavigate={go} searchPlaceholder={SEARCH_PLACEHOLDERS[currentPage] ?? 'Search...'} />

      <div className="cv-main-shell flex min-h-0 min-w-0 flex-1 flex-col">
        <DashboardHeader
          breadcrumbs={breadcrumbs}
          searchPlaceholder={SEARCH_PLACEHOLDERS[currentPage] ?? 'Search...'}
          onNavigate={go}
        />

        <main
          className="cv-mobile-main min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-3 sm:px-6 sm:py-5 lg:px-8 lg:py-6"
          id="main-content"
        >
          <div className="mx-auto w-full max-w-[1280px] space-y-5 lg:space-y-6">
            <MobileSearchBar
              placeholder={SEARCH_PLACEHOLDERS[currentPage] ?? 'Search...'}
            />
            {currentPage === 'dashboard' ? <DashboardHome /> : <Outlet />}
          </div>
        </main>
      </div>

      <MobileCreateFab onNavigate={go} />
      <MobileBottomNav onNavigate={go} />

      {roleSwitchMessage && user ? (
        <div className="fixed right-4 z-50 rounded-xl bg-[var(--cv-text)] px-4 py-2.5 text-sm text-[var(--cv-bg)] shadow-lg bottom-[calc(var(--cv-mobile-tabbar)+var(--cv-safe-bottom)+4.5rem)] lg:bottom-4">
          {roleSwitchMessage}
        </div>
      ) : null}
    </div>
    </ToastProvider>
  )
}
