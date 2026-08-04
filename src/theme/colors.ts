import type { Role } from '../types/roles'
import { TOKENS } from './tokens'

/**
 * CropVibe 60 / 30 / 10 — Charcoal · Surface · Signature Lime
 * Light-first for field/mixed portals; dark available everywhere (admin dark-first).
 */
export const BRAND = {
  bg60: TOKENS.dark.bgPrimary,
  surface30: TOKENS.dark.surface1,
  elevated10: TOKENS.dark.surface2,
  text: TOKENS.dark.textPrimary,
  textMuted: TOKENS.dark.textSecondary,
  border: TOKENS.dark.border,
  btnBg: TOKENS.accent.solid,
  btnText: TOKENS.accent.onAccent,
  accent: TOKENS.accent.solid,
  accentMuted: TOKENS.accent.hover,
  accentSoft: TOKENS.accent.muted,
  primary: TOKENS.accent.solid,
  primaryMuted: TOKENS.accent.hover,
  primarySoft: TOKENS.accent.muted,
  success: TOKENS.semantic.success,
  warning: TOKENS.semantic.warning,
  danger: TOKENS.semantic.error,
  info: TOKENS.semantic.info,
} as const

/** All roles share signature lime — identity is typography/copy, not rainbow chrome */
export const ROLE_PALETTE: Record<
  Role,
  { solid: string; soft: string; muted: string; label: string }
> = {
  seller: {
    solid: TOKENS.accent.solid,
    soft: TOKENS.accent.muted,
    muted: TOKENS.accent.hover,
    label: 'Seller',
  },
  buyer: {
    solid: TOKENS.accent.solid,
    soft: TOKENS.accent.muted,
    muted: TOKENS.accent.hover,
    label: 'Buyer',
  },
  rental: {
    solid: TOKENS.accent.solid,
    soft: TOKENS.accent.muted,
    muted: TOKENS.accent.hover,
    label: 'Rental',
  },
  service: {
    solid: TOKENS.accent.solid,
    soft: TOKENS.accent.muted,
    muted: TOKENS.accent.hover,
    label: 'Service',
  },
  educator: {
    solid: TOKENS.accent.solid,
    soft: TOKENS.accent.muted,
    muted: TOKENS.accent.hover,
    label: 'Educator',
  },
}

export function roleSolid(role: Role): string {
  return ROLE_PALETTE[role].solid
}

export function roleSoft(role: Role): string {
  return ROLE_PALETTE[role].soft
}
