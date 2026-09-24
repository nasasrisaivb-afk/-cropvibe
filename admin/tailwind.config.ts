import type { Config } from 'tailwindcss'

/**
 * CropVibe Admin — tokens taken from the CropVibe Admin Figma file.
 *
 * 60 / 30 / 10
 *   60% canvas   #1A1A1A  (bg.base)
 *   30% surfaces #242424  (bg.surface) · #2E2E2E (bg.surfaceAlt) — sidebar, cards, tables
 *   10% accent   #CCFF00  (brand.lime) — primary actions, active nav, focus, key data
 *
 * Status colours are semantic only (success / warning / error / info) and are never
 * used to tell modules apart.
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/config/**/*.{js,ts,jsx,tsx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          lime: '#CCFF00',
          limeSoft: '#E8FF4D',
          limeAlt: '#B8E600',
          ink: '#1A1A1A',
        },
        bg: {
          base: '#1A1A1A',
          inset: '#1F1F1F',
          surface: '#242424',
          surfaceAlt: '#2E2E2E',
          surfaceHover: '#2E2E2E',
          elevated: '#333333',
          disabled: '#1A1A1A',
        },
        text: {
          primary: '#F5F5F3',
          secondary: '#A0A0A0',
          muted: '#8F8F8F',
          inverse: '#1A1A1A',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          default: 'rgba(255,255,255,0.08)',
          light: 'rgba(255,255,255,0.06)',
          strong: 'rgba(255,255,255,0.14)',
          focus: '#CCFF00',
        },
        status: {
          success: '#4ADE80',
          warning: '#FBBF24',
          error: '#F87171',
          info: '#7DD3FC',
          pending: '#FBBF24',
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        sidebar: '19.5rem',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '3.25rem' }],
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      borderRadius: {
        none: '0',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.24)',
        pop: '0 12px 40px rgba(0,0,0,0.45)',
        drawer: '-24px 0 64px rgba(0,0,0,0.5)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Monaco', 'monospace'],
        wordmark: ['Rocpar', 'var(--font-wordmark)', 'var(--font-inter)', 'sans-serif'],
      },
      keyframes: {
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 240ms cubic-bezier(0.32, 0.72, 0, 1)',
        'fade-in': 'fade-in 160ms ease-out',
      },
    },
  },
  plugins: [],
}

export default config
