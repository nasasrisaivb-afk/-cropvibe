/**
 * CropVibe design tokens — Apple discipline on brand colors.
 * 60% canvas · 30% surfaces · 10% signature lime
 *
 * Mode strategy (defaults — both modes always available):
 * - Field / mixed portals (seller, buyer, rental, service, educator): light-first
 * - Admin console: dark-first
 */

import type { Role } from '../types/roles'

export const TOKENS = {
  dark: {
    bgPrimary: '#1A1A1A',
    surface1: '#242424',
    surface2: '#2E2E2E',
    border: 'rgba(255,255,255,0.08)',
    textPrimary: '#F5F5F3',
    textSecondary: '#A0A0A0',
    frost: 'rgba(26,26,26,0.80)',
  },
  light: {
    bgPrimary: '#FAFAF8',
    surface1: '#FFFFFF',
    surface2: '#F0F0EE',
    border: 'rgba(0,0,0,0.06)',
    textPrimary: '#1A1A1A',
    textSecondary: '#6B6B6B',
    frost: 'rgba(250,250,248,0.80)',
  },
  accent: {
    solid: '#CCFF00',
    hover: '#B8E600',
    muted: 'rgba(204,255,0,0.12)',
    onAccent: '#1A1A1A',
  },
  semantic: {
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#38BDF8',
  },
  radius: {
    control: '8px',
    card: '16px',
    sheet: '20px',
    pill: '9999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.08)',
    md: '0 4px 16px rgba(0,0,0,0.12)',
    lg: '0 12px 40px rgba(0,0,0,0.18)',
  },
  space: [4, 8, 12, 16, 24, 32, 48, 64] as const,
  type: {
    display: { size: 40, line: 48, tracking: '-0.02em', weight: 600 },
    h1: { size: 32, line: 40, weight: 600 },
    h2: { size: 24, line: 32, weight: 600 },
    h3: { size: 18, line: 26, weight: 500 },
    body: { size: 16, line: 24, weight: 400 },
    caption: { size: 13, line: 18, weight: 400 },
  },
  motion: {
    fast: '150ms cubic-bezier(0.25, 0.1, 0.25, 1)',
    base: '200ms cubic-bezier(0.25, 0.1, 0.25, 1)',
    sheet: '420ms cubic-bezier(0.32, 0.72, 0, 1)',
    spring: '500ms cubic-bezier(0.34, 1.3, 0.64, 1)',
  },
} as const

export type ColorMode = 'dark' | 'light'

/** Portal defaults — dark-first while the darker theme is the active product build */
export const ROLE_THEME_DEFAULT: Record<Role, ColorMode> = {
  seller: 'dark',
  buyer: 'dark',
  rental: 'dark',
  service: 'dark',
  educator: 'dark',
}

export const ADMIN_THEME_DEFAULT: ColorMode = 'dark'

export function defaultThemeForRole(role: Role | null | undefined): ColorMode {
  if (!role) return 'dark'
  return ROLE_THEME_DEFAULT[role]
}
