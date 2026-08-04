import type { ColorMode } from './tokens'

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
    grid: 'rgba(0, 0, 0, 0.06)',
    tick: '#6b6b6b',
    tooltipBg: '#ffffff',
    tooltipBorder: 'rgba(0, 0, 0, 0.06)',
    accent: '#CCFF00',
    secondary: '#6b6b6b',
  },
  dark: {
    grid: 'rgba(255, 255, 255, 0.06)',
    tick: '#a0a0a0',
    tooltipBg: '#242424',
    tooltipBorder: 'rgba(255, 255, 255, 0.08)',
    accent: '#CCFF00',
    secondary: '#9ca3af',
  },
}
