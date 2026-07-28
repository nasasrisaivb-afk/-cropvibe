import type { Role } from '../types/roles'

/**
 * CropVibe 60 / 30 / 10 — Black · Grey · Green
 * 60% Base:     #0B0B0B black canvas
 * 30% Secondary:#161616 / #222222 grey surfaces
 * 10% Accent:   #22C55E green actions & highlights
 */
export const BRAND = {
  bg60: '#0B0B0B',
  surface30: '#161616',
  elevated10: '#222222',
  text: '#F3F4F6',
  textMuted: '#9CA3AF',
  border: 'rgba(255, 255, 255, 0.08)',
  btnBg: '#22C55E',
  btnText: '#0B0B0B',
  accent: '#22C55E',
  accentMuted: '#16A34A',
  accentSoft: 'rgba(34, 197, 94, 0.14)',
  primary: '#22C55E',
  primaryMuted: '#16A34A',
  primarySoft: 'rgba(34, 197, 94, 0.14)',
  success: '#22C55E',
  warning: '#EAB308',
  danger: '#EF4444',
  info: '#38BDF8',
} as const

/** Role identity stays on brand green */
export const ROLE_PALETTE: Record<
  Role,
  { solid: string; soft: string; muted: string; label: string }
> = {
  seller: {
    solid: '#22C55E',
    soft: 'rgba(34, 197, 94, 0.14)',
    muted: '#16A34A',
    label: 'Seller green',
  },
  buyer: {
    solid: '#22C55E',
    soft: 'rgba(34, 197, 94, 0.14)',
    muted: '#16A34A',
    label: 'Buyer green',
  },
  rental: {
    solid: '#22C55E',
    soft: 'rgba(34, 197, 94, 0.14)',
    muted: '#16A34A',
    label: 'Rental green',
  },
  service: {
    solid: '#22C55E',
    soft: 'rgba(34, 197, 94, 0.14)',
    muted: '#16A34A',
    label: 'Service green',
  },
  educator: {
    solid: '#22C55E',
    soft: 'rgba(34, 197, 94, 0.14)',
    muted: '#16A34A',
    label: 'Educator green',
  },
}

export function roleSolid(role: Role): string {
  return ROLE_PALETTE[role].solid
}

export function roleSoft(role: Role): string {
  return ROLE_PALETTE[role].soft
}
