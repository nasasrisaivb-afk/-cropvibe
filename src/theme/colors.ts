import type { Role } from '../types/roles'

/**
 * 60 / 30 / 10 dark system
 * 60% #303132  page canvas
 * 30% #262626  surfaces (sidebar, cards, header)
 * 10% #2D2D2D  elevated / inset panels
 * Text #FFFFFF for primary text
 * CTA: bg #121212 · text #C9FF35
 */
export const BRAND = {
  bg60: '#303132',
  surface30: '#262626',
  elevated10: '#2D2D2D',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.62)',
  border: 'rgba(255,255,255,0.08)',
  btnBg: '#121212',
  btnText: '#C9FF35',
  accent: '#C9FF35',
  accentMuted: '#A8D42A',
  accentSoft: 'rgba(201,255,53,0.12)',
  success: '#C9FF35',
  warning: '#F5B942',
  danger: '#FF6B6B',
  info: '#6EC8FF',
} as const

/** Role accents stay on-brand (lime) with slight hue shifts for identity */
export const ROLE_PALETTE: Record<
  Role,
  { solid: string; soft: string; muted: string; label: string }
> = {
  seller: {
    solid: '#C9FF35',
    soft: 'rgba(201,255,53,0.12)',
    muted: '#A8D42A',
    label: 'Seller lime',
  },
  buyer: {
    solid: '#C9FF35',
    soft: 'rgba(201,255,53,0.12)',
    muted: '#A8D42A',
    label: 'Buyer lime',
  },
  rental: {
    solid: '#C9FF35',
    soft: 'rgba(201,255,53,0.12)',
    muted: '#A8D42A',
    label: 'Rental lime',
  },
  service: {
    solid: '#C9FF35',
    soft: 'rgba(201,255,53,0.12)',
    muted: '#A8D42A',
    label: 'Service lime',
  },
  educator: {
    solid: '#C9FF35',
    soft: 'rgba(201,255,53,0.12)',
    muted: '#A8D42A',
    label: 'Educator lime',
  },
}

export function roleSolid(role: Role): string {
  return ROLE_PALETTE[role].solid
}

export function roleSoft(role: Role): string {
  return ROLE_PALETTE[role].soft
}
