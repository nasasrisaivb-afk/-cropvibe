import '@/lib/data/ops-seeds'
import { platformSettings } from '@/lib/data/seeds'
import type { PlatformSettings } from '@/lib/types'
import { delay } from '@/lib/utils'
import { recordAudit } from '@/lib/data/store'

type Actor = { name: string; role: string }

export async function getSettings(): Promise<PlatformSettings> {
  await delay()
  return structuredClone(platformSettings)
}

export async function updateSettings(
  patch: Partial<PlatformSettings>,
  actor: Actor = { name: 'Admin', role: 'Admin' }
): Promise<PlatformSettings> {
  await delay(500)
  const changes: string[] = []
  if (patch.commissionRates) {
    for (const [k, v] of Object.entries(patch.commissionRates)) {
      const before = platformSettings.commissionRates[k as keyof PlatformSettings['commissionRates']]
      if (before !== v) changes.push(`${k} commission ${before}% → ${v}%`)
    }
  }
  if (patch.disputeSlaHours != null && patch.disputeSlaHours !== platformSettings.disputeSlaHours) {
    changes.push(`dispute SLA ${platformSettings.disputeSlaHours}h → ${patch.disputeSlaHours}h`)
  }
  if (patch.kycRequirements) {
    for (const [k, v] of Object.entries(patch.kycRequirements)) {
      if (platformSettings.kycRequirements[k as keyof PlatformSettings['kycRequirements']] !== v) {
        changes.push(`${k.toUpperCase()} ${v ? 'now required' : 'no longer required'}`)
      }
    }
  }
  Object.assign(platformSettings, patch)
  recordAudit({
    actor: actor.name,
    actorRole: actor.role,
    module: 'settings',
    entity: 'Platform settings',
    entityId: 'platform',
    action: changes.length ? `Changed ${changes.join(', ')}` : 'Saved platform settings',
    href: '/settings',
    severity: changes.length ? 'critical' : 'info',
  })
  return structuredClone(platformSettings)
}

export async function toggleFeatureFlag(
  key: string,
  enabled: boolean,
  actor: Actor = { name: 'Admin', role: 'Admin' }
): Promise<PlatformSettings> {
  await delay(300)
  const flag = platformSettings.featureFlags.find((f) => f.key === key)
  if (!flag) throw new Error('Feature flag not found')
  flag.enabled = enabled
  recordAudit({
    actor: actor.name,
    actorRole: actor.role,
    module: 'settings',
    entity: 'Feature flag',
    entityId: key,
    action: `${enabled ? 'Enabled' : 'Disabled'} “${flag.label}”`,
    href: '/settings',
    severity: 'warning',
  })
  return structuredClone(platformSettings)
}

export async function updateTemplate(
  id: string,
  patch: { subject?: string; body?: string }
): Promise<PlatformSettings> {
  await delay(400)
  const tpl = platformSettings.notificationTemplates.find((t) => t.id === id)
  if (!tpl) throw new Error('Template not found')
  Object.assign(tpl, patch)
  return structuredClone(platformSettings)
}
