import type { ColorMode } from './tokens'
import { TOKENS } from './tokens'

export const CHART_THEME: Record<
  ColorMode,
  {
    grid: string
    tick: string
    tooltipBg: string
    tooltipBorder: string
    accent: string
    secondary: string
  }
> = {
  light: {
    grid: TOKENS.light.border,
    tick: TOKENS.light.textSecondary,
    tooltipBg: TOKENS.light.surface1,
    tooltipBorder: TOKENS.light.border,
    accent: TOKENS.light.textPrimary,
    secondary: TOKENS.light.textSecondary,
  },
  dark: {
    grid: TOKENS.dark.border,
    tick: TOKENS.dark.textSecondary,
    tooltipBg: TOKENS.dark.surface1,
    tooltipBorder: TOKENS.dark.border,
    accent: TOKENS.accent.solid,
    secondary: TOKENS.dark.textSecondary,
  },
}
