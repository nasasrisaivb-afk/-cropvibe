import { ACCOUNT_NAV, SHARED_NAV, getFarmIntelItems, getWorkspaceItems, ROLE_LABELS } from '../../config/navigation'
import { useAppStore } from '../../store/appStore'
import type { PageId } from '../../types/roles'
import { Sheet } from '../common/Sheet'

export function MoreSheet({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean
  onClose: () => void
  onNavigate: (page: PageId) => void
}) {
  const role = useAppStore((s) => s.user?.activeRole ?? 'seller')
  const farm = getFarmIntelItems(role)
  const workspace = getWorkspaceItems(role).filter((item) => item.id !== 'dashboard')

  const go = (page: PageId) => {
    onNavigate(page)
    onClose()
  }

  const groups = [
    { title: ROLE_LABELS[role], items: workspace },
    { title: 'Shared', items: SHARED_NAV },
    ...(farm.length ? [{ title: 'Farm Intelligence', items: farm }] : []),
    { title: 'Account', items: ACCOUNT_NAV },
  ]

  return (
    <Sheet open={open} title="More" onClose={onClose}>
      <div className="space-y-5 pb-4">
        {groups.map((group) => (
          <section key={group.title}>
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--cv-muted)]">
              {group.title}
            </h4>
            <ul className="divide-y divide-[var(--cv-border)] overflow-hidden rounded-2xl border border-[var(--cv-border)]">
              {group.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="flex min-h-12 w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[var(--cv-text)]"
                    onClick={() => go(item.id)}
                  >
                    {item.label}
                    {item.count ? (
                      <span className="rounded-md bg-[var(--cv-sidebar-badge-bg)] px-1.5 py-0.5 text-[11px] font-semibold">
                        {item.count}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Sheet>
  )
}
