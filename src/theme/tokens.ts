/**
 * CropVibe design tokens — Shipfaster UI kit
 * Cool canvas · violet primary · white cards
 *
 * Mode strategy (defaults — both modes always available):
 * - Field / mixed portals (seller, buyer, rental, service, educator): light-first
 * - Admin console: dark-first
 */

import type { Role } from '../types/roles'

export const TOKENS = {
  dark: {
    bgPrimary: '#101225',
    surface1: '#1A1E35',
    surface2: '#252A45',
    border: 'rgba(139,144,167,0.22)',
    textPrimary: '#F4F6FB',
    textSecondary: '#A8ADC2',
    frost: 'rgba(16,18,37,0.82)',
  },
  light: {
    bgPrimary: '#E5E7EB',
    surface1: '#FFFFFF',
    surface2: '#F3F4F6',
    border: 'rgba(17,24,39,0.12)',
    textPrimary: '#1A1D2E',
    textSecondary: '#4B5563',
    frost: 'rgba(255,255,255,0.88)',
  },
  accent: {
    solid: '#5B5CE2',
    hover: '#4A4FD4',
    muted: 'rgba(91,92,226,0.12)',
    onAccent: '#FFFFFF',
  },
  blue: '#5B5CE2',
  grey: '#8B90A7',
  white: '#FFFFFF',
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#5B5CE2',
  },
  radius: {
    control: '12px',
    card: '16px',
    sheet: '24px',
    pill: '9999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(26,29,46,0.04), 0 4px 12px rgba(91,92,226,0.04)',
    md: '0 8px 24px rgba(91,92,226,0.08)',
    lg: '0 18px 48px rgba(91,92,226,0.12)',
  },
  space: [4, 8, 12, 16, 24, 32, 48, 64] as const,
  type: {
    display: { size: 40, line: 48, tracking: '-0.02em', weight: 700 },
    h1: { size: 32, line: 40, weight: 700 },
    h2: { size: 24, line: 32, weight: 600 },
    h3: { size: 18, line: 26, weight: 600 },
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

/** Portal defaults — light canvas with violet accent */
export const ROLE_THEME_DEFAULT: Record<Role, ColorMode> = {
  seller: 'light',
  buyer: 'light',
  rental: 'light',
  service: 'light',
  educator: 'light',
}

export const ADMIN_THEME_DEFAULT: ColorMode = 'dark'

export function defaultThemeForRole(role: Role | null | undefined): ColorMode {
  if (!role) return 'light'
  return ROLE_THEME_DEFAULT[role]
}
