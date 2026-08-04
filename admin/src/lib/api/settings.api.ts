import { platformSettings } from '@/lib/data/seeds'
import type { PlatformSettings } from '@/lib/types'
import { delay } from '@/lib/utils'

export async function getSettings(): Promise<PlatformSettings> {
  await delay()
  return structuredClone(platformSettings)
}

export async function updateSettings(
  patch: Partial<PlatformSettings>
): Promise<PlatformSettings> {
  await delay(500)
  Object.assign(platformSettings, patch)
  return structuredClone(platformSettings)
}

export async function toggleFeatureFlag(key: string, enabled: boolean): Promise<PlatformSettings> {
  await delay(300)
  const flag = platformSettings.featureFlags.find((f) => f.key === key)
  if (!flag) throw new Error('Feature flag not found')
  flag.enabled = enabled
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
